from os.path import exists
import simplejson as json
import traceback
from message import FileMetadata
import logs
from libs.config import read_config

log = logs.get_logger(__name__)

class ProjectMetadata:
    def __init__(self, **entries): 
        self.path = None
        self.name = None
        self.id = None
        self.__dict__.update(entries) 
    
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, ignore_nan=True)

    def __repr__(self) -> str:
        return self.toJSON()       

active_project = None        
CNEXT_PROJECT_DIR = './'

def get_open_files():    
    open_files = []
    try:
        if active_project: 
            config_path = active_project.path+'/.cnext.yaml'
            if exists(config_path):
                config = read_config(config_path)
                if hasattr(config, 'open_files'):
                    for f in config.open_files:
                        open_files.append(FileMetadata(**f))           
            else:
                log.error("Config file does not exist %s" % (config_path))        
        return open_files
    # except yaml.YAMLError as error:
    #     log.error("%s" % (error))        
    #     return []  
    except Exception as error:
        log.error("%s - %s" % (error, traceback.format_exc()))          
        raise Exception # this will be seen in the web app #

def set_project_dir(path):
    global CNEXT_PROJECT_DIR
    CNEXT_PROJECT_DIR = path
    return True

def set_active_project(project: ProjectMetadata):
    global active_project
    active_project = project
    return True

def get_active_project():
    return active_project

