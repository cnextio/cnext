import yaml
import logging
import traceback 

logging.basicConfig(filename='./log.txt', filemode='a', format='%(asctime)s,%(msecs)d %(name)s %(funcName)s %(levelname)s %(message)s', 
                        datefmt='%H:%M:%S', level=logging.DEBUG)
log = logging.getLogger(__name__)

class Config:
    def __init__(self, **entries): 
        self.__dict__.update(entries)

def read_config(path):
    try: 
        config = yaml.safe_load(open(path, 'r'))
        log.info(config)
        return Config(**config);
    except Exception as error:
        log.error("No config file found. Return default config.")
        log.error("%s - %s" % (error, traceback.format_exc()))  
        config = {'node_py_zmq':{'host': '127.0.0.1', 'n2p_port': 5001, 'p2n_port': 5002}}
        return Config(**config);
        