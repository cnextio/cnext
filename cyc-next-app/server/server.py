import platform, sys, logging, simplejson as json, io, os
import pandas 
import plotly
import plotly.express as px, plotly.io as pio
pio.renderers.default = "json"

import traceback
import logs
import re
from zmq_message import MessageQueue
from message import CommandType, ExperimentManagerCommand, Message, WebappEndpoint, DFManagerCommand, ContentType, ProjectCommand, CodeEditorCommand

import mlflow
import mlflow.tensorflow
from mlflow.tracking.client import MlflowClient

from project_manager import files, projects
from experiment_manager import experiment_manager as em


log = logs.get_logger(__name__)

from libs.config import read_config
try:
    config = read_config('.server.yaml', {'code_executor_comm':{'host': '127.0.0.1', 'n2p_port': 5001, 'p2n_port': 5002}})
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
        "type": ContentType.STRING,
        "content": trace,
        "error": True,
        "metadata": metadata,
    })

def send_to_node(message: Message):
    # the current way of communicate with node server is through stdout with a json string
    # log.info("Send to node server: %s" % message)
    # log.info("Send output to node server... %s"%message.toJSON())
    log.info("Send output to node server...")
    p2n_queue.send(message.toJSON())
    
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
                type = ContentType.PLOTLY_FIG
                send_reply = True

        if message.command_name == DFManagerCommand.plot_column_quantile:
            result = eval(message.content, globals())
            if result is not None:                
                log.info("get plot data")                                        
                output = _create_DFManager_plot_data(message.metadata['df_id'], message.metadata['col_name'], result) 
                type = ContentType.PLOTLY_FIG
                send_reply = True

        elif message.command_name == DFManagerCommand.get_table_data:    
            result = eval(message.content, globals())        
            if result is not None:                
                log.info("get table data")
                output = _create_table_data(message.metadata['df_id'], result)       
                type = ContentType.PANDAS_DATAFRAME
                send_reply = True
                                       
        elif message.command_name == DFManagerCommand.get_countna: 
            df_id = message.metadata['df_id']
            countna = eval("%s.isna().sum()"%df_id, globals())
            len = eval("%s.shape[0]"%df_id, globals())      
            if (countna is not None) and (len is not None):                
                log.info("get countna data")
                output = _create_countna_data(message.metadata['df_id'], len, countna)       
                type = ContentType.DICT
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
            type = ContentType.DICT
            send_reply = True    

        if send_reply:
            message.type = type
            message.content = output
            message.error = False
            send_to_node(message)
    except:
        trace = traceback.format_exc()
        log.error("%s" % (trace))
        error_message = create_error_message(message.webapp_endpoint, trace)          
        send_to_node(error_message)

def handle_CodeEditor_message(message):
    try:
        assign_exec_mode(message)
        type = ContentType.NONE
        output = ''                        
        if message.execution_mode == 'exec':
            log.info('exec mode...')
            exec(message.content, globals())
            type = ContentType.STRING
            # output = sys.stdout.getvalue()
        elif message.execution_mode == 'eval':
            log.info('eval mode...')
            result = eval(message.content, globals())
            if result is not None:            
                # log.info("eval result: \n%s" % (result))
                log.info("got eval results")
                if _result_is_dataframe(result):
                    df_id = _get_dataframe_id(message.content)
                    output = _create_table_data(df_id, result)       
                    type = ContentType.PANDAS_DATAFRAME
                elif _result_is_plotly_fig(result):
                    output = _create_CodeArea_plot_data(result)
                    type = ContentType.PLOTLY_FIG
                else:
                    type = ContentType.STRING
                    output = str(result)                
            
        message.type = type
        message.content = output
        message.error = False
        send_to_node(message)                                 
    except:
        trace = traceback.format_exc()
        log.error("Exception %s" % (trace))
        error_message = create_error_message(message.webapp_endpoint, trace, message.metadata)          
        send_to_node(error_message)

def handle_FileManager_message(message):
    log.info('Handle FileManager message: %s' % message)
    try:    
        metadata = message.metadata    
        result = None
        if message.command_name == ProjectCommand.list_dir:            
            result = []
            if 'path' in metadata.keys():
                result = files.list_dir(metadata['path']) 
                type = ContentType.DIR_LIST    
        elif message.command_name == ProjectCommand.get_open_files:
            result = projects.get_open_files()
            type = ContentType.FILE_METADATA   
        elif message.command_name == ProjectCommand.set_working_dir:
            if 'path' in metadata.keys():
                result = projects.set_working_dir(metadata['path'])
            type = ContentType.NONE 
        elif message.command_name == ProjectCommand.set_project_dir:
            if 'path' in metadata.keys():
                result = projects.set_project_dir(metadata['path'])
            type = ContentType.NONE   
        elif message.command_name == ProjectCommand.read_file:
            if 'path' in metadata.keys():
                timestamp = metadata['timestamp'] if 'timestamp' in metadata else None
                result = files.read_file(metadata['path'], timestamp)
                if result == None:
                    type = ContentType.NONE
                else:
                    type = ContentType.FILE_CONTENT
        elif message.command_name == ProjectCommand.save_file:
            if 'path' in metadata.keys():
                result = files.save_file(metadata['path'], message.content)
            type = ContentType.FILE_METADATA        
        elif message.command_name == ProjectCommand.close_file:
            result = projects.close_file(metadata['path'])
            type = ContentType.FILE_METADATA
        elif message.command_name == ProjectCommand.open_file:
            result = projects.open_file(metadata['path'])
            type = ContentType.FILE_METADATA
        elif message.command_name == ProjectCommand.get_active_project:
            result = projects.get_active_project()
            type = ContentType.PROJECT_METADATA    

        # create reply message
        message.type = type
        message.content = result
        message.error = False
        send_to_node(message)   

    except:
        trace = traceback.format_exc()
        log.error("%s" % (trace))
        error_message = create_error_message(message.webapp_endpoint, trace)          
        send_to_node(error_message)

def handle_FileExplorer_message(message):
    log.info('Handle FileExplorer message: %s' % message)
    try:    
        metadata = message.metadata    
        output = None
        if message.command_name == ProjectCommand.list_dir:            
            output = []
            if 'path' in metadata.keys():
                output = files.list_dir(metadata['path']) 
                type = ContentType.DIR_LIST    
        elif message.command_name == ProjectCommand.create_file:
            if 'path' in metadata.keys():
                files.create_file(metadata['path'])
            output = projects.open_file(metadata['path'])
            type = ContentType.FILE_METADATA
        elif message.command_name == ProjectCommand.delete:
            if 'path' in metadata.keys():
                files.delete(metadata['path'], metadata['is_file'])            
            if ('is_file'in metadata) and metadata['is_file']:
                output = projects.close_file(metadata['path'])
            else: #TODO: handle the case where a dir is deleted and deleted files were opened
                output = projects.get_open_files()
            type = ContentType.FILE_METADATA
        # create reply message
        message.type = type
        message.content = output
        message.error = False
        send_to_node(message)   

    except:
        trace = traceback.format_exc()
        log.error("%s" % (trace))
        error_message = create_error_message(message.webapp_endpoint, trace)          
        send_to_node(error_message)

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
                type = ContentType.COLUMN_CARDINAL
                send_reply = True  

        if send_reply:
            message.type = type
            message.content = output
            message.error = False
            send_to_node(message)
    except:
        trace = traceback.format_exc()
        log.error("%s" % (trace))
        error_message = create_error_message(message.webapp_endpoint, trace)          
        send_to_node(error_message)

RUN_NAME_SHORTEN_LENGTH = 10
def get_run_name(mlFlowClient, run_id):
    run = mlFlowClient.get_run(run_id)
    if 'mlflow.runName' in run.data.tags:
        ## add underscore prefix to make it consistent with other fileds on mlflow
        return run.data.tags['mlflow.runName']
    else:
        return run_id[:RUN_NAME_SHORTEN_LENGTH]

def add_cnext_metadata(object, metadata):
    if type(object) == dict:
        object['_cnext_metadata'] = metadata
    elif type(object) == mlflow.entities.run_info.RunInfo:
        object._cnext_metadata = metadata
    else:
        raise TypeError('object type has to be dict or object, got %s'%type(object))
    return object

def handle_ExperimentManager_message(message):
    log.info('Handle ExperimentManager message: %s' % message)    
    try:    
        params = message.content
        if message.type == CommandType.MLFLOW_CLIENT:    
            mlflowClient: MlflowClient = mlflow.tracking.MlflowClient(params['tracking_uri'])
            params.pop('tracking_uri')
            message.content = getattr(mlflowClient, message.command_name)(**params)
            if message.command_name == ExperimentManagerCommand.list_experiments:
                running_exp_id = None
                experiments = message.content
                ## 
                # Identify the running experiment.
                # Since the API does not provide this functionality, use running run as the proxy for running experiments
                # A run is running if it's end_time is None. This might not work when there are multiple running runs 
                # initiated from different context
                # #
                for exp in experiments:
                    run_infos = mlflowClient.list_run_infos(exp.experiment_id)
                    log.info(run_infos)
                    if len(run_infos)>0 and run_infos[0].status == 'RUNNING':
                        running_exp_id = exp.experiment_id
                        break                    
                message.content = {'experiments': experiments, 'running_exp_id': running_exp_id}
            if message.command_name == ExperimentManagerCommand.list_run_infos:
                active_run_id = None
                run_infos = message.content
                ## 
                # Identify the running experiment.
                # Since the API does not provide this functionality, use running run as the proxy for running experiments
                # A run is running if it's end_time is None. This might not work when there are multiple running runs 
                # initiated from different context
                # Note: cann't use mlflow.active_run().info.run_uuid here because this is a different python context with
                # that initiated the run. We can improve this by attach the active run id to the message from client. 
                # #
                for run_info in run_infos:
                    log.info(run_info)
                    if run_info.status == 'RUNNING':
                        active_run_id = run_info.run_id
                        break
                
                ## define run name according to the cnext rule
                for run_info in run_infos:
                    add_cnext_metadata(run_info, {'run_name': get_run_name(mlflowClient, run_info.run_id)})
                    # run_info._cnext_metadata = {'run_name': get_run_name(mlFlowClient, run_info.run_id)}
                message.content = {'runs': run_infos, 'active_run_id': active_run_id}    
        elif message.type == CommandType.MFLOW:
            message.content = getattr(mlflow, message.command_name)(**params)    
        elif message.type == CommandType.MLFLOW_COMBINE:
            if message.command_name == ExperimentManagerCommand.get_metric_plots:             
                mlflowClient: MlflowClient = mlflow.tracking.MlflowClient(params['tracking_uri'])
                # for run_id in message.content['run_ids']:
                #     runs_data.append(mlFlowClient.get_run(run_id))
                metrics_data = {}
                metrics_index = {}
                run_ids = message.content['run_ids']
                for run_id in run_ids:
                    run = mlflowClient.get_run(run_id)
                    metric_keys = run.data.metrics.keys()    
                    for metric in metric_keys:
                        metric_history = mlflowClient.get_metric_history(run_id, metric)
                        if metric not in metrics_data:
                            metrics_data[metric] = {}
                        run_cnext_name = get_run_name(mlflowClient, run_id)
                        ## use run cnext name format for column name # 
                        metrics_data[metric][run_cnext_name] = [m.value for m in metric_history]
                        metrics_index = {
                            'step': [m.step for m in metric_history],
                            'timestamp': [m.timestamp for m in metric_history]
                        }
                result = {'plots': {}}
                for metric in metrics_data.keys():
                    metrics_df = pandas.DataFrame(
                        dict([(k,pandas.Series(v)) for k,v in metrics_data[metric].items()]),
                        index = metrics_index['step']
                    )
                    fig = px.line(metrics_df, text=metrics_df.index)
                    fig.update_layout(
                        xaxis_title="Steps",
                        yaxis_title=metric,
                        legend_title="Runs",
                        font=dict(size=11)
                    )
                    result['plots'][metric] = fig.to_json()
                
                ## Checkpoins are keyed using cnext run name. It would be better if we key it by the run id instead
                #  but since the trace name in the plot using name not id, we have to use name to make it consistent #
                checkpoints={}
                for run_id in run_ids:
                    run_cnext_name = get_run_name(mlflowClient, run_id)
                    checkpoints[run_cnext_name] = em.get_checkpoints(mlflowClient, run_id)
                log.info(checkpoints)
                if len(checkpoints) > 0:
                    add_cnext_metadata(result, {'checkpoints': checkpoints})

                log.info(result)
                message.content = result

        # elif message.type == CommandType.MLFLOW_COMBINE:
        #     if message.command                 
        message.error = False
        send_to_node(message)   

    except:
        trace = traceback.format_exc()
        log.error("%s" % (trace))
        error_message = create_error_message(message.webapp_endpoint, trace)          
        send_to_node(error_message)

def process_active_df_status():
    if DataFrameStatusHook.update_active_df_status(get_global_df_list()):
        active_df_status_message = Message(**{"webapp_endpoint": WebappEndpoint.DFManager, 
                                            "command_name": DFManagerCommand.active_df_status, 
                                            "seq_number": 1, 
                                            "type": "dict", 
                                            "content": DataFrameStatusHook.get_active_df(), 
                                            "error": False})
        send_to_node(active_df_status_message)

message_handler = {
    WebappEndpoint.CodeEditor: handle_CodeEditor_message,
    WebappEndpoint.DFManager: handle_DataFrameManager_message,
    WebappEndpoint.FileManager: handle_FileManager_message,
    WebappEndpoint.MagicCommandGen: handle_MagicCommandGen_message,
    WebappEndpoint.FileExplorer: handle_FileExplorer_message,
    WebappEndpoint.ExperimentManager: handle_ExperimentManager_message,
}

class StdoutHandler:
    def __init__(self):
        self.message = None

    def handler(self):
        while self.message != None:
            # if self.message != None:
            # log.info('Getting message on stdout')
            for output in sys.stdout:    
                log.info('Got message on stdout: %s'%output)
                self.message.type = ContentType.STRING
                self.message.content = output
                self.message.error = False
                send_to_node(self.message)                                 
        
if __name__ == "__main__":    
    try:
        p2n_queue = MessageQueue(config.p2n_comm['host'], config.p2n_comm['p2n_port'])
        # if sys.argv[1]=='code-executor':
        #     p2n_queue = MessageQueue(config.code_executor_comm['host'], config.code_executor_comm['p2n_port'])
        # elif sys.argv[1]=='non-code-executor':
        #     p2n_queue = MessageQueue(config.non_code_executor_comm['host'], config.non_code_executor_comm['p2n_port'])
        #     pass

    except Exception as error:
        log.error("Failed to make connection to node server %s - %s" % (error, traceback.format_exc()))          
        exit(1)

    while True:            
        for line in sys.stdin:                  
            try:                      
                log.info('Got message %s' % line)
                message = Message(**json.loads(line))    
                
                message_handler[message.webapp_endpoint](message);
                if message.webapp_endpoint == WebappEndpoint.CodeEditor:                     
                    process_active_df_status()

            except OSError as error: #TODO check if this has to do with buffer error
                #since this error might be related to the pipe, we do not send this error to nodejs
                log.error("OSError: %s" % (error))  

            except:            
                log.error("Failed to execute the command %s", traceback.format_exc())
                message = create_error_message(message.webapp_endpoint, traceback.format_exc())                
                send_to_node(message)
            
            try:    
                sys.stdout.flush()                 
            except Exception as error:
                log.error("Failed to flush stdout %s - %s" % (error, traceback.format_exc()))  
