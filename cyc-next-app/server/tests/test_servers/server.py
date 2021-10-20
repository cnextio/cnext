import sys, logging, json, io
import pandas 

logging.basicConfig(filename='./log.txt', filemode='a', format='%(asctime)s,%(msecs)d %(name)s %(levelname)s %(message)s', 
                        datefmt='%H:%M:%S', level=logging.DEBUG)
log = logging.getLogger(__name__)

while True:
    for line in sys.stdin:        
        try:
            req = json.loads(line)        
            log.info(req)
            exec(req['command'])
        except:
            import traceback
            log.error(traceback.format_exc())
            # print(json.dumps({"commandType": req['command_type'], "contentType": "str", "content": traceback.format_exc(), "error": True}))                        
            traceback.print_exc();
        sys.stdout.flush()     

