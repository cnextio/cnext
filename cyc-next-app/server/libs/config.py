import yaml
import traceback 
import logs

log = logs.get_logger(__name__)

class Config:
    def __init__(self, **entries): 
        self.__dict__.update(entries)

def read_config(path, default = {}):
    try: 
        config = yaml.safe_load(open(path, 'r'))
        log.info('Read config %s: %s'%(path, config))
        return Config(**config);
    
    except Exception as error:
        log.error("No config file found. Return default config.")
        log.error("%s - %s" % (error, traceback.format_exc()))  
        return Config(**default);
        