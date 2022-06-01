import yaml
import traceback 
from libs import logs
import simplejson as json

log = logs.get_logger(__name__)
yaml.emitter.Emitter.process_tag = lambda self, *args, **kw: None

class Config:
    def __init__(self, **entries): 
        self.__dict__.update(entries)
    
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, ignore_nan=True)

def read_config(path, default = {}):
    try: 
        config = yaml.safe_load(open(path, 'r'))
        log.info('Read config %s: %s'%(path, config))
        return Config(**config);
    
    except Exception as error:
        log.error("No config file found. Return default config.")
        log.error("%s - %s" % (error, traceback.format_exc()))  
        return Config(**default);
        
def save_config(config, path, default = {}):
    try: 
        # config = yaml.dump(open(path, 'r'))
        with open(path, 'w') as file:
            yaml.dump(config, file, default_flow_style=False)
        log.info('Save config %s: %s'%(path, config))
        return True
    
    except Exception as error:
        log.error("No config file found. Return default config.")
        log.error("%s - %s" % (error, traceback.format_exc()))  
        return Config(**default);
