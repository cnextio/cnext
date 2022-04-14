import os
from os.path import exists
import simplejson as json
import traceback
from project_manager.interfaces import ProjectMetadata
from libs import logs
from libs.config import read_config, save_config
from project_manager.interfaces import FileMetadata

log = logs.get_logger(__name__)
     
active_project = None        
CNEXT_PROJECT_DIR = ''

def get_open_files():    
    open_files = []
    try:
        if active_project: 
            config_path = active_project.config_path  # active_project.path+'/.cnext.yaml'
            if exists(config_path):
                config = read_config(config_path)
                if hasattr(config, 'open_files'):
                    open_files = config.open_files
            else:
                log.error("Config file does not exist %s" % (config_path))        
        return open_files
    # except yaml.YAMLError as error:
    #     log.error("%s" % (error))        
    #     return []  
    except Exception as error:
        log.error("%s - %s" % (error, traceback.format_exc()))          
        raise Exception # this will be seen in the web app #

def close_file(path):
    open_files = []
    try:
        if active_project: 
            config_path = active_project.config_path #active_project.path+'/.cnext.yaml'
            if exists(config_path):
                config = read_config(config_path)
                if hasattr(config, 'open_files'):
                    for f in config.open_files:
                        ## do not include the file that is being closed
                        if(f['path'] != path):
                            open_files.append(f)
                config.open_files = open_files
                save_config(config.__dict__, config_path)        
            else:
                log.error("Config file does not exist %s" % (config_path))        
        return open_files
    # except yaml.YAMLError as error:
    #     log.error("%s" % (error))        
    #     return []  
    except Exception as error:
        log.error("%s - %s" % (error, traceback.format_exc()))          
        raise Exception # this will be seen in the web app #

def open_file(path):
    open_files = []
    try:
        if active_project: 
            config_path = active_project.config_path #active_project.path+'/.cnext.yaml'
            if exists(config_path):
                config = read_config(config_path)
                if hasattr(config, 'open_files'):
                    open_files = config.open_files
                ## Note that we dont set the timestamp when open the file #    
                file = FileMetadata(path, 
                    name = path.split('/')[-1], 
                    executor = (config.executor==path))
                open_files.append(file.__dict__)    
                config.open_files = open_files
                save_config(config.__dict__, config_path)        
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

def set_working_dir(path):
    try:
        os.chdir(path)
        return True
    except Exception:
        raise Exception
