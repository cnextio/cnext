import platform, sys, logging, simplejson as json, io, os
import pandas 
import plotly
import traceback
import logs
import re
from zmq_message import MessageQueue
from message import Message, WebappEndpoint, DFManagerCommand, ContentType, ProjectCommand, CodeEditorCommand
from project_manager import files, projects

log = logs.get_logger(__name__)

from libs.config import read_config
try:
    config = read_config('.server.yaml', {'node_py_zmq':{'host': '127.0.0.1', 'n2p_port': 5001, 'p2n_port': 5002}})
    log.info('Server config: %s'%config)
    open_projects = []
    active_project: projects.ProjectMetadata = None
    if hasattr(config, 'projects'):
        if 'open_projects' in config.projects:
            if isinstance(config.projects['open_projects'], list):
                open_projects = config.projects['open_projects']
        if 'active_project' in config.projects:
            for project_config in open_projects:
                if config.projects['active_project'] == project_config['id']:
                    active_project = projects.ProjectMetadata(**project_config)
    if active_project:
        projects.set_active_project(active_project)

except Exception as error:
    log.error("%s - %s" % (error, traceback.format_exc()))          
    exit(1)

#TODO: Point this to the cycdataframe repos folder
sys.path.append(config.path_to_cycdataframe_lib); 
from cycdataframe.df_status_hook import DataFrameStatusHook
from cycdataframe.cycdataframe import CycDataFrame

#TODO: need to heavily test this
def assign_exec_mode(message: Message):
    message.execution_mode = 'eval'
    if message.metadata and ('line_range' in message.metadata):
        line_range = message.metadata['line_range']
        if line_range['fromLine'] < line_range['toLine']-1: ## always 'exec' if there are more than 1 line in the code
            message.execution_mode = 'exec'

    try:
        compile(message.content, '<stdin>', 'eval')
    except SyntaxError as error:
        log.error(error)
        message.execution_mode = 'exec'
    
    log.info("assigned command type: %s" % message.execution_mode)


# have to do this here. do it in df_status_hook does not work
def get_global_df_list():
    names = list(globals())
    df_list = []
    for name in names:
        if type(globals()[name]) == CycDataFrame:
            df_list.append((name, id(globals()[name])))
    log.info('Current global df list: %s' % df_list)
    return df_list

    
def _plotly_show_match(command):
    res = re.search(r'^\w+(?=\.show\(\))',command)
    if res is not None:
        name = res.group()
        log.info("Name of the object before .show(): %s" % name)
        if type(globals()[name]) == plotly.graph_objs._figure.Figure:
            return True
        else: 
            return False
    else: 
        return False

def _get_dataframe_id(command):
    res = re.search(r'^\w+(?=[\.\[])',command)
    if res is not None:
        name = res.group()
        log.info("Name of the dataframe object: %s" % name)
        return name
    else: 
        return None

def _result_is_dataframe(result):
    return type(result) == pandas.core.frame.DataFrame

def _result_is_plotly_fig(result):
    return hasattr(plotly.graph_objs, '_figure') and (type(result) == plotly.graph_objs._figure.Figure)

def _create_table_data(df_id, df):
    tableData = {}
    tableData['df_id'] = df_id
    tableData['column_names'] = list(df.columns)
    
    ## Convert datetime to string so it can be displayed in the frontend #
    for i,t in enumerate(df.dtypes):
        if t.name == 'datetime64[ns]':
            df[df.columns[i]] = df[df.columns[i]].dt.strftime('%Y-%m-%d %H:%M:%S')
    tableData['rows'] = df.values.tolist()

    tableData['index'] = {}
    tableData['index']['name'] = df.index.name
    tableData['index']['data'] = []
    if str(df.index.dtype) == 'datetime64[ns]':
        [tableData['index']['data'].append(str(idx)) for idx in df.index]
    else:
        tableData['index']['data'] = df.index.tolist()
    
    return tableData

def _create_countna_data(df_id, len, countna_series):
    countna = {}
    for k, v in countna_series.to_dict().items():
        countna[k] = {'na': v, 'len': len}
    return {'df_id': df_id, 'countna': countna}

def _create_plot_data(result):
    result = result.replace("'", '"')
    result = result.replace("True", 'true')
    result = result.replace("False", 'false')
    return {'plot': result}

#TODO: unify this with _create_plot_data
def _create_DFManager_plot_data(df_id, col_name, result):    
    return {'df_id': df_id, 'col_name': col_name, 'plot': result.to_json()}

def _create_CodeArea_plot_data(result):
    return {'plot': result.to_json()}       

def _create_get_cardinal_data(result):
     return {'cardinals': result}

def create_error_message(webapp_endpoint, trace, metadata=None):
    return Message(**{
        "webapp_endpoint": webapp_endpoint, 
        "content_type": ContentType.STRING,
        "content": trace,
        "error": True,
        "metadata": metadata,
    })

def send_result_to_node_server(message: Message):
    # the current way of communicate with node server is through stdout with a json string
    # log.info("Send to node server: %s" % message)
    # log.info("Send output to node server... %s"%message.toJSON())
    log.info("Send output to node server...")
    p2n_queue.push(message.toJSON())
    
def handle_DataFrameManager_message(message):
    send_reply = False
    # message execution_mode will always be `eval` for this sender
    log.info('eval... %s' % message)
    try:        
        if message.command_name == DFManagerCommand.plot_column_histogram:
            result = eval(message.content, globals())
            if result is not None:                
                log.info("get plot data")                                        
                output = _create_DFManager_plot_data(message.metadata['df_id'], message.metadata['col_name'], result) 
                content_type = ContentType.PLOTLY_FIG
                send_reply = True

        if message.command_name == DFManagerCommand.plot_column_quantile:
            result = eval(message.content, globals())
            if result is not None:                
                log.info("get plot data")                                        
                output = _create_DFManager_plot_data(message.metadata['df_id'], message.metadata['col_name'], result) 
                content_type = ContentType.PLOTLY_FIG
                send_reply = True

        elif message.command_name == DFManagerCommand.get_table_data:    
            result = eval(message.content, globals())        
            if result is not None:                
                log.info("get table data")
                output = _create_table_data(message.metadata['df_id'], result)       
                content_type = ContentType.PANDAS_DATAFRAME
                send_reply = True
                                       
        elif message.command_name == DFManagerCommand.get_countna: 
            df_id = message.metadata['df_id']
            countna = eval("%s.isna().sum()"%df_id, globals())
            len = eval("%s.shape[0]"%df_id, globals())      
            if (countna is not None) and (len is not None):                
                log.info("get countna data")
                output = _create_countna_data(message.metadata['df_id'], len, countna)       
                content_type = ContentType.DICT
                send_reply = True                            
        
        elif message.command_name == DFManagerCommand.get_df_metadata: 
            df_id = message.metadata['df_id']
            shape = eval("%s.df.shape"%df_id, globals())
            dtypes = eval("%s.df.dtypes"%df_id, globals())
            countna = eval("%s.df.isna().sum()"%df_id, globals())
            describe = eval("%s.df.describe(include='all')"%df_id, globals())
            columns = {}
            for col_name, ctype in dtypes.items():
                # print(col_name, ctype)
                # FIXME: only get at most 100 values here, this is hacky, find a better way
                unique = eval("%s['%s'].unique().tolist()"%(df_id, col_name), globals())[:100]                
                columns[col_name] = {'name': col_name, 'type': str(ctype.name), 'unique': unique, 
                                        'describe': describe[col_name].to_dict(), 'countna': countna[col_name].item()}                
            output = {'df_id': df_id, 'shape': shape, 'columns': columns}    
            log.info(output)
            content_type = ContentType.DICT
            send_reply = True    

        if send_reply:
            message.content_type = content_type
            message.content = output
            message.error = False
            send_result_to_node_server(message)
    except:
        trace = traceback.format_exc()
        log.error("%s" % (trace))
        error_message = create_error_message(message.webapp_endpoint, trace)          
        send_result_to_node_server(error_message)

def handle_CodeArea_message(message):
    try:
        assign_exec_mode(message)
        # sys.stdout = normal_stdout                        
        if message.execution_mode == 'exec':
            log.info('exec mode...')
            exec(message.content, globals())
            content_type = ContentType.STRING
            output = sys.stdout.getvalue()
        elif message.execution_mode == 'eval':
            log.info('eval mode...')
            result = eval(message.content, globals())
            if result is not None:            
                # log.info("eval result: \n%s" % (result))
                log.info("got eval results")
                if _result_is_dataframe(result):
                    df_id = _get_dataframe_id(message.content)
                    output = _create_table_data(df_id, result)       
                    content_type = ContentType.PANDAS_DATAFRAME
                elif _result_is_plotly_fig(result):
                    output = _create_CodeArea_plot_data(result)
                    content_type = ContentType.PLOTLY_FIG
                else:
                    content_type = ContentType.STRING
                    output = str(result)                
            else:
                result = sys.stdout.getvalue()
                # log.info("eval stdout: \n"+ result)                     
                log.info("got eval result on stdout ...")
                if result is not None:             
                    #this is super hacky. for now just assume only plotly will return a dict type
                    if _plotly_show_match(message.content): 
                        print("get plot data")                                        
                        output = _create_plot_data(result) 
                        content_type = ContentType.PLOTLY_FIG
                    else:
                        content_type = ContentType.STRING
                        output = str(result)
                else:
                    content_type = ContentType.NONE
                    output = ''

        message.content_type = content_type
        message.content = output
        message.error = False
        # print(message)           
        send_result_to_node_server(message)                                 
        # return message

    except:
        trace = traceback.format_exc()
        log.error("%s" % (trace))
        error_message = create_error_message(message.webapp_endpoint, trace, message.metadata)          
        send_result_to_node_server(error_message)

def handle_FileManager_message(message):
    log.info('Handle FileManager message: %s' % message)
    try:    
        metadata = message.metadata    
        result = None
        if message.command_name == ProjectCommand.list_dir:            
            result = []
            if 'path' in metadata.keys():
                result = files.list_dir(metadata['path']) 
                content_type = ContentType.DIR_LIST    
        elif message.command_name == ProjectCommand.get_open_files:
            result = projects.get_open_files()
            content_type = ContentType.FILE_METADATA   
        elif message.command_name == ProjectCommand.set_working_dir:
            if 'path' in metadata.keys():
                result = projects.set_working_dir(metadata['path'])
            content_type = ContentType.NONE 
        elif message.command_name == ProjectCommand.set_project_dir:
            if 'path' in metadata.keys():
                result = projects.set_project_dir(metadata['path'])
            content_type = ContentType.NONE   
        elif message.command_name == ProjectCommand.read_file:
            if 'path' in metadata.keys():
                timestamp = metadata['timestamp'] if 'timestamp' in metadata else None
                result = files.read_file(metadata['path'], timestamp)
                if result == None:
                    content_type = ContentType.NONE
                else:
                    content_type = ContentType.FILE_CONTENT
        elif message.command_name == ProjectCommand.save_file:
            if 'path' in metadata.keys():
                result = files.save_file(metadata['path'], message.content)
            content_type = ContentType.FILE_METADATA        
        elif message.command_name == ProjectCommand.close_file:
            result = projects.close_file(metadata['path'])
            content_type = ContentType.FILE_METADATA
        elif message.command_name == ProjectCommand.open_file:
            result = projects.open_file(metadata['path'])
            content_type = ContentType.FILE_METADATA
        elif message.command_name == ProjectCommand.get_active_project:
            result = projects.get_active_project()
            content_type = ContentType.PROJECT_METADATA    

        # create reply message
        message.content_type = content_type
        message.content = result
        message.error = False
        send_result_to_node_server(message)   

    except:
        trace = traceback.format_exc()
        log.error("%s" % (trace))
        error_message = create_error_message(message.webapp_endpoint, trace)          
        send_result_to_node_server(error_message)

def handle_FileExplorer_message(message):
    log.info('Handle FileExplorer message: %s' % message)
    try:    
        metadata = message.metadata    
        output = None
        if message.command_name == ProjectCommand.list_dir:            
            output = []
            if 'path' in metadata.keys():
                output = files.list_dir(metadata['path']) 
                content_type = ContentType.DIR_LIST    
        elif message.command_name == ProjectCommand.create_file:
            if 'path' in metadata.keys():
                files.create_file(metadata['path'])
            output = projects.open_file(metadata['path'])
            content_type = ContentType.FILE_METADATA
        elif message.command_name == ProjectCommand.delete:
            if 'path' in metadata.keys():
                files.delete(metadata['path'], metadata['is_file'])            
            if ('is_file'in metadata) and metadata['is_file']:
                output = projects.close_file(metadata['path'])
            else: #TODO: handle the case where a dir is deleted and deleted files were opened
                output = projects.get_open_files()
            content_type = ContentType.FILE_METADATA
        # create reply message
        message.content_type = content_type
        message.content = output
        message.error = False
        send_result_to_node_server(message)   

    except:
        trace = traceback.format_exc()
        log.error("%s" % (trace))
        error_message = create_error_message(message.webapp_endpoint, trace)          
        send_result_to_node_server(error_message)

def handle_MagicCommandGen_message(message):
    send_reply = False
    # message execution_mode will always be `eval` for this sender
    log.info('eval... %s' % message)
    try:        
        if message.command_name == DFManagerCommand.get_cardinal:
            df_id = message.metadata['df_id']
            col_name = message.metadata['col_name']
            if 'groupby' in message.metadata:
                groupby = message.metadata['groupby']

                ## Get stat for groupby x0
                groupby_cols = ''
                groupby_cols += '"%s",'%groupby[0]
                command_str = '%s.groupby([%s])["%s"].count()'%(df_id, groupby_cols, col_name)
                result = {'groupby_x0': eval(command_str, globals()).describe().to_dict()}
                
                ## Get stat for groupby all x
                groupby_cols = ''
                for c in groupby:
                    groupby_cols += '"%s",'%c
                command_str = '%s.groupby([%s])["%s"].count()'%(df_id, groupby_cols, col_name)
                result.update({'groupby_all': eval(command_str, globals()).describe().to_dict()})
                
                ## Count unique and get monotonic for all x
                unique_counts = {}
                monotonics = {}
                for col_name in groupby:
                    command_str = 'len(%s["%s"].unique())'%(df_id, col_name)
                    unique_counts[col_name] = eval(command_str, globals())
                    command_str = '%s["%s"].is_monotonic'%(df_id, col_name)
                    monotonics[col_name] = eval(command_str, globals())
                result.update({'unique_counts': unique_counts, 'monotonics': monotonics})
                # log.info('Result:  %s' % (result))
            else:
                ## TODO: consider to remove this because it is not used
                ## return a describe dict to make it consistent with the groupby case above
                command_str = '%s["%s"].shape[0]'%(df_id, col_name)
                result = pandas.DataFrame([eval(command_str, globals())]).describe().to_dict()

            if result is not None:                
                # log.info("get cardinal data: %s"%type(result))                                        
                log.info("get cardinal data")                                        
                output = _create_get_cardinal_data(result) 
                content_type = ContentType.COLUMN_CARDINAL
                send_reply = True  

        if send_reply:
            message.content_type = content_type
            message.content = output
            message.error = False
            send_result_to_node_server(message)
    except:
        trace = traceback.format_exc()
        log.error("%s" % (trace))
        error_message = create_error_message(message.webapp_endpoint, trace)          
        send_result_to_node_server(error_message)

def process_active_df_status():
    if DataFrameStatusHook.update_active_df_status(get_global_df_list()):
        active_df_status_message = Message(**{"webapp_endpoint": WebappEndpoint.DFManager, 
                                            "command_name": DFManagerCommand.active_df_status, 
                                            "seq_number": 1, 
                                            "content_type": "dict", 
                                            "content": DataFrameStatusHook.get_active_df(), 
                                            "error": False})
        send_result_to_node_server(active_df_status_message)

message_handler = {
    WebappEndpoint.CodeEditor: handle_CodeArea_message,
    WebappEndpoint.DFManager: handle_DataFrameManager_message,
    WebappEndpoint.FileManager: handle_FileManager_message,
    WebappEndpoint.MagicCommandGen: handle_MagicCommandGen_message,
    WebappEndpoint.FileExplorer: handle_FileExplorer_message,
}

if __name__ == "__main__":    
    try:
        p2n_queue = MessageQueue(config.node_py_zmq['host'], config.node_py_zmq['p2n_port'])
        # notification_queue = MessageQueue(config.node_py_zmq['host'], config.node_py_zmq['p2n_notif_port']) 
        # n2p_queue = MessageQueue(config.node_py_zmq['host'], config.node_py_zmq['n2p_port'])
    except Exception as error:
        log.error("%s - %s" % (error, traceback.format_exc()))          
        exit(1)

    while True:    
        for line in sys.stdin:            
            log.info('Got message %s' % json.loads(line))
            message = Message(**json.loads(line))        
            normal_stdout = sys.stdout            
            sys.stdout = io.StringIO()

            try:                
                message_handler[message.webapp_endpoint](message);
                if message.webapp_endpoint == WebappEndpoint.CodeEditor:                     
                    process_active_df_status()

            except OSError as error: #TODO check if this has to do with buffer error
                #since this error might be related to the pipe, we do not send this error to nodejs
                sys.stdout = normal_stdout
                log.error("OSError: %s" % (error))  

            except:            
                sys.stdout = normal_stdout    
                log.error(traceback.format_exc())
                message = create_error_message(message.webapp_endpoint, traceback.format_exc())                
                send_result_to_node_server(message)
                # error_message = Message(message['request_originator'], 'eval', "str", traceback.format_exc(), True)    
                # send_result_to_node_server(error_message)
                # traceback.print_exc()        
            
            sys.stdout = normal_stdout    
            try:    
                sys.stdout.flush()                 
            except Exception as error:
                log.error("%s - %s" % (error, traceback.format_exc()))  
                # error_message = Message(req['request_originator'], 'eval', "str", "Got some unexpected errors", True)    
                # send_result_to_node_server(error_message) 