import sys, logging, simplejson as json, io, os
import pandas 
import plotly
import traceback
import yaml
import logs

log = logs.get_logger(__name__)

from config import read_config
try:
    config = read_config('config.yaml')
except Exception as error:
    log.error("%s - %s" % (error, traceback.format_exc()))          
    exit(1)

#TODO: Point this to the cycdataframe repos folder
sys.path.append(config.path_to_cycdataframe_lib); 
from cycdataframe.df_status_hook import DataFrameStatusHook
from cycdataframe.cycdataframe import CycDataFrame
from messages import MessageQueue

class Message:
    def __init__(self, request_originator, command_type, content_type, content, error, metadata={}):
        self.request_originator = request_originator
        self.command_type = command_type
        self.content_type = content_type
        self.content = content
        self.error = error
        self.metadata = metadata

    def __repr__(self):        
        return json.dumps({
            "request_originator": self.request_originator,
            "command_type": self.command_type, 
            "content_type": self.content_type, 
            "content": self.content, 
            "error": self.error,
            "metadata": self.metadata
        }, ignore_nan=True)
    
    # def __str__(self):
    #     return self.__repr__()

# have to do this here. do it in df_status_hook does not work
def get_global_df_list():
    names = list(globals())
    df_list = []
    for name in names:
        if type(globals()[name]) == CycDataFrame:
            df_list.append((name, id(globals()[name])))
    log.info('Current global df list: %s' % df_list)
    return df_list

def _create_output_table_data(df_id, df):
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

#TODO: need to heavily test this
def assign_exec_mode(req):
    req['command_type'] = 'eval'
    try:
        compile(req['command'], '<stdin>', 'eval')
    except SyntaxError as error:
        log.error(error)
        req['command_type'] = 'exec'
    log.info("assigned command type: %s" % req['command_type'])

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

def _get_eval_dataframe_id(command):
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

def _create_output_plot_data(result):
    result = result.replace("'", '"')
    result = result.replace("True", 'true')
    result = result.replace("False", 'false')
    return result

def execute_request(req):    
    if req['command_type']=='exec':
        log.info('exec...')
        exec(req['command'], globals())
        content_type = "str"
        output = sys.stdout.getvalue()
    elif req['command_type']=='eval':
        log.info('eval...')
        result = eval(req['command'], globals())
        if result is not None:            
            log.info("eval result: \n%s" % (result))
            if _result_is_dataframe(result):
                dataframe_id = _get_eval_dataframe_id(req['command'])
                output = _create_output_table_data(dataframe_id, result)       
                content_type = str(pandas.core.frame.DataFrame)
            else:
                content_type = "str"
                output = str(result)                
        else:
            result = sys.stdout.getvalue()
            # log.info("eval stdout: \n"+ result)                     
            log.info("got eval result on stdout ...")
            if result is not None:             
                #this is super hacky. for now just assume only plotly will return a dict type
                if _plotly_show_match(req['command']):                                         
                    output = _create_output_plot_data(result) 
                    content_type = str(plotly.graph_objs._figure.Figure)
                else:
                    content_type = "str"
                    output = str(result)
            else:
                content_type = "None"
                output = ''
    if 'metadata' in req:
        metadata = req['metadata']
    else:
        metadata = {}
    return Message(req['request_originator'], req['command_type'], content_type, output, False, metadata)
    
def send_result_to_node_server(message: Message):
    # the current way of communicate with node server is through stdout with a json string
    # log.info("Send to node server: %s" % message)
    log.info("Send output to node server...")
    # print(message)
    p2n_queue.push(message.__repr__())

if __name__ == "__main__":
    try:
        p2n_queue = MessageQueue(config.node_py_zmq['host'], config.node_py_zmq['p2n_port'])
        # n2p_queue = MessageQueue(config.node_py_zmq['host'], config.node_py_zmq['n2p_port'])
    except Exception as error:
        log.error("%s - %s" % (error, traceback.format_exc()))          
        exit(1)

    while True:    
        for line in sys.stdin:
            req = json.loads(line)        
            log.info(req)
            try:
                # have to make the stdout swapping outside because 
                # execute_request might got interrupted because of the exceptions
                normal_stdout = sys.stdout            
                sys.stdout = io.StringIO()
                assign_exec_mode(req)
                result = execute_request(req)
                sys.stdout = normal_stdout    
                send_result_to_node_server(result)
                            
                if DataFrameStatusHook.update_df_status(get_global_df_list()):
                    df_list_message = Message('DataFrameManager', 'dataframe_updated', "dict", DataFrameStatusHook.dataframe_updated, False)
                    send_result_to_node_server(df_list_message)
            except OSError as error: #TODO check if this has to do with buffer error
                #since this error might be related to the pipe, we do not send this error to nodejs
                sys.stdout = normal_stdout
                log.error("OSError: %s" % (error))  
            except Exception as error:            
                sys.stdout = normal_stdout    
                log.error("%s - %s" % (error, traceback.format_exc()))  
                error_message = Message(req['request_originator'], 'eval', "str", traceback.format_exc(), True)    
                send_result_to_node_server(error_message)                         
                # traceback.print_exc()        
                
            try:
                sys.stdout = normal_stdout
                sys.stdout.flush()                 
            except Exception as error:
                log.error("%s - %s" % (error, traceback.format_exc()))  
                # error_message = Message(req['request_originator'], 'eval', "str", "Got some unexpected errors", True)    
                # send_result_to_node_server(error_message) 



