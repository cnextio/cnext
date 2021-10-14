import sys, logging, json, io
import pandas 

logging.basicConfig(filename='./log.txt', filemode='a', format='%(asctime)s,%(msecs)d %(name)s %(levelname)s %(message)s', 
                        datefmt='%H:%M:%S', level=logging.DEBUG)
log = logging.getLogger(__name__)

def create_output_table_data(df):
    tableData = {}
    tableData['header'] = list(df.columns)
    tableData['rows'] = df.values.tolist() 
    tableData['index'] = {}
    tableData['index']['name'] = df.index.name
    tableData['index']['data'] = []
    if str(df.index.dtype) == 'datetime64[ns]':
        [tableData['index']['data'].append(str(idx)) for idx in df.index]
    else:
        tableData['index']['data'] = df.index.tolist()
    
    return tableData

def execute_request(req):    
    if req['command_type']=='exec':
        log.info('executing...')
        exec(req['command'], globals())
        contentType = "str"
        output = sys.stdout.getvalue()
    elif req['command_type']=='eval':
        log.info('evaluating...')
        res = eval(req['command'])
        log.info(res)
        if type(res) == pandas.core.frame.DataFrame:
            tableData = create_output_table_data(res)       
            contentType = str(type(res))
            output = tableData
        else:
            contentType = str(type(res))
            if res is not None:                
                output = str(res)
            else:
                output = sys.stdout.getvalue()

    return {"commandType": req['command_type'], "contentType": contentType, "content": output, "error": False}
    

    
import traceback
while True:
    for line in sys.stdin:
        req = json.loads(line)        
        log.info(req)

        try:
            # have to make the stdout swapping outside because 
            # execute_request might got interrupted because of the exceptions
            normal_stdout = sys.stdout            
            sys.stdout = io.StringIO()
            result = execute_request(req)
            sys.stdout = normal_stdout    
            print(json.dumps(result))            
        except:            
            log.error(traceback.format_exc())                                
            traceback.print_exc()        
        finally:
            sys.stdout = normal_stdout
            sys.stdout.flush()                 

