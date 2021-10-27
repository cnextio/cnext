import platform, sys, logging, simplejson as json, io, os
import pandas 
import plotly
import traceback
import yaml
import logs

log = logs.get_logger(__name__)

from config import read_config
try:
    if platform.system() == 'Windows':
        config = read_config('config-win.yaml')
    else:
        config = read_config('config.yaml')
except Exception as error:
    log.error("%s - %s" % (error, traceback.format_exc()))          
    exit(1)

from zmq_message import MessageQueue
from message import Message, WebappEndpoint, CommandName, ContentType


#TODO: Point this to the cycdataframe repos folder
sys.path.append(config.path_to_cycdataframe_lib); 
from cycdataframe.df_status_hook import DataFrameStatusHook
from cycdataframe.cycdataframe import CycDataFrame

# have to do this here. do it in df_status_hook does not work
def get_global_df_list():
    names = list(globals())
    df_list = []
    for name in names:
        if type(globals()[name]) == CycDataFrame:
            df_list.append((name, id(globals()[name])))
    log.info('Current global df list: %s' % df_list)
    return df_list

def _create_table_data(df_id, df):
    tableData = {}
    tableData['df_id'] = df_id
    tableData['column_names'] = list(df.columns)
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
    
#TODO: need to heavily test this
def assign_exec_mode(message):
    message.execution_mode = 'eval'
    try:
        compile(message.content, '<stdin>', 'eval')
    except SyntaxError as error:
        log.error(error)
        message.execution_mode = 'exec'
    log.info("assigned command type: %s" % message.execution_mode)

import re
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
    return type(result) == plotly.graph_objs._figure.Figure

def _create_plot_data(result):
    result = result.replace("'", '"')
    result = result.replace("True", 'true')
    result = result.replace("False", 'false')
    return result

#TODO: unify this with _create_plot_data
def _create_dataframemanager_plot_data(df_id, col_name, result):
    result = result.replace("'", '"')
    result = result.replace("True", 'true')
    result = result.replace("False", 'false')
    return {'df_id': df_id, 'col_name': col_name, 'plot': result}

def execute_request(message):    
    if message.execution_mode == 'exec':
        log.info('exec...')
        exec(message.content, globals())
        content_type = ContentType.str
        output = sys.stdout.getvalue()
    elif message.execution_mode == 'eval':
        log.info('eval...')
        result = eval(message.content, globals())
        if result is not None:            
            # log.info("eval result: \n%s" % (result))
            log.info("eval result: \n")
            if _result_is_dataframe(result):
                dataframe_id = _get_dataframe_id(message.content)
                output = _create_table_data(dataframe_id, result)       
                content_type = ContentType.pandas_dataframe
            else:
                content_type = ContentType.str
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
                    content_type = ContentType.plotly_fig
                else:
                    content_type = ContentType.str
                    output = str(result)
            else:
                content_type = ContentType.none
                output = ''

    message.content_type = content_type
    message.content = output
    message.error = False
    # print(message)                                        
    return message #Message(message['request_originator'], message['command_type'], content_type, output, False, metadata)
    
def send_result_to_node_server(message: Message):
    # the current way of communicate with node server is through stdout with a json string
    # log.info("Send to node server: %s" % message)
    log.info("Send output to node server...")
    # print(message)
    p2n_queue.push(message.__repr__())
    
def create_error_message(webapp_endpoint, trace):
    return Message(**{
        "webapp_endpoint": webapp_endpoint, 
        "content_type": ContentType.str,
        "content": trace,
        "error": True
    })

def handle_DataFrameManager_message(message):
    send_reply = False
    # message execution_mode will always be `eval` for this sender
    log.info('eval...')
    try:        
        if message.command_name == CommandName.plot_column_histogram:
            if message.seq_number == 1:
                result = exec(message.content, globals())
                # nothing to be done here
                # pass
            elif message.seq_number == 2:
                # plotly show will be output to stdout
                eval(message.content, globals())
                result = sys.stdout.getvalue()
                if result is not None:                
                    log.info("get plot data")                                        
                    output = _create_dataframemanager_plot_data(message.metadata['df_id'], message.metadata['col_name'], result) 
                    content_type = ContentType.plotly_fig
                    send_reply = True

        elif message.command_name == CommandName.get_table_data:    
            result = eval(message.content, globals())        
            if result is not None:                
                log.info("get table data")
                output = _create_table_data(message.metadata['df_id'], result)       
                content_type = ContentType.pandas_dataframe
                send_reply = True
                                       
        elif message.command_name == CommandName.get_countna: 
            df_id = message.metadata['df_id']
            countna = eval("%s.isna().sum()"%df_id, globals())
            len = eval("%s.shape[0]"%df_id, globals())      
            if (countna is not None) and (len is not None):                
                log.info("get countna data")
                output = _create_countna_data(message.metadata['df_id'], len, countna)       
                content_type = ContentType.dict
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
                # log.info('Got message from %s' % (message.webapp_endpoint))
                if message.webapp_endpoint == WebappEndpoint.CodeEditorComponent: 
                    # log.info('Got message from %s' % WebappEndpoint.CodeEditorComponent)                   
                    # have to make the stdout swapping outside because 
                    # execute_request might got interrupted because of the exceptions                    
                    assign_exec_mode(message)
                    result = execute_request(message)
                    # sys.stdout = normal_stdout    
                    send_result_to_node_server(result)
                                
                    if DataFrameStatusHook.update_active_df_status(get_global_df_list()):
                        active_df_status_message = Message(**{"webapp_endpoint": WebappEndpoint.DataFrameManager, 
                                                            "command_name": CommandName.active_df_status, 
                                                            "seq_number": 1, 
                                                            "content_type": "dict", 
                                                            "content": DataFrameStatusHook.get_active_df(), 
                                                            "error": False})
                        send_result_to_node_server(active_df_status_message)
                
                elif message.webapp_endpoint == WebappEndpoint.DataFrameManager: 
                    handle_DataFrameManager_message(message)

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



