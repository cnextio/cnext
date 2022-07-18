import os
import uuid
from os.path import exists
import simplejson as json
import traceback
from project_manager.interfaces import ProjectInfoInWorkspace
from libs import logs
from libs.config import read_config, save_config
from project_manager.interfaces import FileMetadata, CNEXT_PROJECT_METADATA_FILE, CNEXT_PROJECT_FOLDER, WORKSPACE_METADATA_PATH, WorkspaceMetadata, SETTINGS_FILE, ProjectMetadata

log = logs.get_logger(__name__)

active_project = None
CNEXT_PROJECT_DIR = ''

## File #


def get_project_metadata_path(project):
    """ Get path to .cnext/cnext.yaml """
    return os.path.join(project['path'], CNEXT_PROJECT_FOLDER, CNEXT_PROJECT_METADATA_FILE)


def get_open_files():
    """ Get active project's open files """
    open_files = []
    try:
        active_project = get_active_project()
        # config_file_path = active_project['config_path']
        config_file_path = get_project_metadata_path(active_project)
        if exists(config_file_path):
            config = read_config(config_file_path)
            project_metadata = ProjectMetadata(config.__dict__)
        else:
            log.error("Config file does not exist %s" % (config_file_path))
        return project_metadata
    # except yaml.YAMLError as error:
    #     log.error("%s" % (error))
    #     return []
    except Exception as error:
        log.error("%s - %s" % (error, traceback.format_exc()))
        raise Exception  # this will be seen in the web app #


def close_file(path, open_order):
    new_open_files = []
    try:
        if path != None:
            active_project = get_active_project()
            # config_file_path = active_project['config_path']
            config_file_path = get_project_metadata_path(active_project)
            if exists(config_file_path):
                config = read_config(config_file_path)
                project_metadata = ProjectMetadata(config.__dict__)
                for file in project_metadata.open_files:
                    if(file.path != path):
                        new_open_files.append(file)                        
                project_metadata.open_files = new_open_files

                if isinstance(open_order, list):
                    ## update with the latest order #
                    project_metadata.open_order = open_order
                if path in open_order:
                    ## remove the path #
                    project_metadata.open_order.remove(path)

                save_config(project_metadata, config_file_path)
            else:
                log.error("Config file does not exist %s" % (config_file_path))
        return project_metadata
    # except yaml.YAMLError as error:
    #     log.error("%s" % (error))
    #     return []
    except Exception as error:
        log.error("%s - %s" % (error, traceback.format_exc()))
        raise Exception  # this will be seen in the web app #


def open_file(path, open_order):
    try:
        if path != None:
            active_project = get_active_project()
            # config_path = active_project['config_path']
            project_metadata_path = get_project_metadata_path(active_project)
            if exists(project_metadata_path):
                config = read_config(project_metadata_path)
                project_metadata = ProjectMetadata(config.__dict__)
                file_existed = [
                    file_item for file_item in project_metadata.open_files if file_item.path == path]
                if len(file_existed) == 0:
                    ## Note that we dont set the timestamp when open the file #
                    file = FileMetadata(path=path,
                                        name=os.path.basename(path))
                    project_metadata.open_files.append(file)
                    
                    if isinstance(open_order, list):
                        ## update with the latest order #
                        project_metadata.open_order = open_order
                    if path in project_metadata.open_order:
                        ## remove path before append it to the end #
                        project_metadata.open_order.remove(path)
                    project_metadata.open_order.append(path)
                    
                    # config.open_files = open_files
                    save_config(project_metadata, project_metadata_path)
            else:
                log.error("Config file does not exist %s" %
                          (project_metadata_path))
            return project_metadata
        else:
            return []
    # except yaml.YAMLError as error:
    #     log.error("%s" % (error))
    #     return []
    except Exception as error:
        log.error("%s - %s" % (error, traceback.format_exc()))
        raise Exception  # this will be seen in the web app #
##

## Project #


def set_project_dir(path):
    global CNEXT_PROJECT_DIR
    CNEXT_PROJECT_DIR = path
    return True


def set_active_project(project_id: str):
    config = read_config(WORKSPACE_METADATA_PATH)
    config_dict = config.__dict__
    config_dict['active_project'] = project_id
    return save_workspace_metadata(config=config_dict)


def get_active_project():
    config = read_config(WORKSPACE_METADATA_PATH)
    config_dict = config.__dict__
    active_project = [project for project in config_dict['open_projects']
                      if project['id'] == config_dict['active_project']]
    if len(active_project) == 0:
        log.error("Active project not found!")
        raise Exception
    return active_project[0]


## Project Settings #


def get_project_settings_path(project):
    """ Get path to config.json """
    return os.path.join(project['path'], SETTINGS_FILE)


def save_project_settings(content):
    """ Save config.json"""
    try:
        active_project = get_active_project()
        settings_file_path = get_project_settings_path(active_project)
        os.makedirs(os.path.dirname(settings_file_path), exist_ok=True)
        with open(settings_file_path, 'w') as outfile:
            outfile.write(json.dumps(content, indent=4))
        return FileMetadata(path=settings_file_path, name=SETTINGS_FILE, timestamp=os.path.getmtime(settings_file_path))
    except Exception as ex:
        log.error("Save config error: {}".format(ex))
        raise Exception


def get_project_settings():
    """ Save config from config.json"""
    active_project = get_active_project()
    config_file_path = get_project_settings_path(active_project)
    if os.path.exists(config_file_path):
        config_file_data = open(config_file_path, "r")
        data = json.loads(config_file_data.read())
        return data
    return
##

## Workspace #


def add_project(path):
    try:
        project_name = os.path.basename(path)

        if not os.path.exists(path):
            os.mkdir(path)

        # Update workspace config
        config = read_config(WORKSPACE_METADATA_PATH)
        workspace_metadata = WorkspaceMetadata(config.__dict__)
        # config_dict = config.__dict__
        exist_project = [
            project for project in workspace_metadata.open_projects if project.path == path]
        if len(exist_project) > 0:
            project_id = exist_project[0].id
        else:
            project_id = str(uuid.uuid1())
            new_project = {
                'id': project_id,
                'name': project_name,
                'path': path
            }
            workspace_metadata.open_projects.append(new_project)
            workspace_metadata.active_project = project_id
            save_config(workspace_metadata, WORKSPACE_METADATA_PATH)

            # # Create main.py file
            # main_file_path = os.path.join(path, 'main.py')
            # if not os.path.exists(main_file_path):
            #     with open(main_file_path, 'w'):
            #         pass

        # Assign project
        active_project = ProjectInfoInWorkspace(
            path=path,
            name=project_name,
            id=project_id,
            # data_path=os.path.join(path, CNEXT_PROJECT_FOLDER),
            # config_path=None
        )

        # active_project.config_path = os.path.join(
        #     active_project.data_path, CNEXT_PROJECT_METADATA_FILE)

        # Set activate project
        # set_active_project(active_project)

        # Create .cnext/cnext.yaml if not exsists
        cnext_project_path = os.path.join(path, CNEXT_PROJECT_FOLDER)
        if not os.path.exists(cnext_project_path):
            os.mkdir(cnext_project_path)
        cnext_config_path = os.path.join(
            cnext_project_path, CNEXT_PROJECT_METADATA_FILE)
        if not os.path.exists(cnext_config_path):
            with open(cnext_config_path, 'w'):
                pass

        return workspace_metadata
    except Exception as ex:
        raise ex


def get_workspace_metadata():
    config = read_config(WORKSPACE_METADATA_PATH)
    return config.__dict__


def save_workspace_metadata(config):
    workspace_info = WorkspaceMetadata(config)
    save_config(workspace_info, WORKSPACE_METADATA_PATH)
    return workspace_info
##
