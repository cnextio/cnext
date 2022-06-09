import os
import uuid
from os.path import exists
import simplejson as json
import traceback
from project_manager.interfaces import ProjectMetadata
from libs import logs
from libs.config import read_config, save_config
from project_manager.interfaces import FileMetadata
from project_manager.interfaces import CNEXT_PROJECT_CONFIG_FILE, CNEXT_PROJECT_FOLDER, WORKSPACE_CONFIG_PATH, WorkspaceInfo

log = logs.get_logger(__name__)

active_project = None
CNEXT_PROJECT_DIR = ''
FILE_CONFIG = 'config.json'


def get_open_files():
    open_files = []
    try:
        active_project = get_active_project()
        config_path = active_project['config_path']
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
        raise Exception  # this will be seen in the web app #


def close_file(path):
    open_files = []
    try:
        active_project = get_active_project()
        config_path = active_project['config_path']
        if exists(config_path):
            config = read_config(config_path)
            if hasattr(config, 'open_files'):
                for f in config.open_files:
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
        raise Exception  # this will be seen in the web app #


def open_file(path):
    open_files = []
    try:
        active_project = get_active_project()
        config_path = active_project['config_path']
        if exists(config_path):
            config = read_config(config_path)
            if hasattr(config, 'open_files') and isinstance(config.open_files, list):
                open_files = config.open_files
                ## Note that we dont set the timestamp when open the file #
            file = FileMetadata(path,
                                name=path.split('/')[-1],
                                executor=(config.executor == path))
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
        raise Exception  # this will be seen in the web app #


def set_project_dir(path):
    global CNEXT_PROJECT_DIR
    CNEXT_PROJECT_DIR = path
    return True


def set_active_project(project_id: str):
    config = read_config(WORKSPACE_CONFIG_PATH)
    config_dict = config.__dict__
    config_dict['active_project'] = project_id
    return save_workspace_config(config=config_dict)


def get_active_project():
    config = read_config(WORKSPACE_CONFIG_PATH)
    config_dict = config.__dict__
    active_project = [project for project in config_dict['open_projects']
                      if project['id'] == config_dict['active_project']]
    if len(active_project) == 0:
        log.error("Not found active project!")
        raise Exception
    return active_project[0]


def set_working_dir(path):
    try:
        os.chdir(path)
        return True
    except Exception:
        raise Exception


def save_project_config(content):
    try:
        # config_file_path = os.path.join(project_path, FILE_CONFIG)
        active_project = get_active_project()
        config_file_path = os.path.join(
            active_project['path'], FILE_CONFIG)
        os.makedirs(os.path.dirname(config_file_path), exist_ok=True)
        with open(config_file_path, 'w') as outfile:
            outfile.write(json.dumps(content, indent=4))
        return FileMetadata(config_file_path, name=FILE_CONFIG, timestamp=os.path.getmtime(config_file_path))
    except Exception as ex:
        log.error("Save config error: {}".format(ex))
        raise Exception


def get_project_config():
    active_project = get_active_project()
    config_file_path = os.path.join(
        active_project['path'], FILE_CONFIG)
    if os.path.exists(config_file_path):
        config_file_data = open(config_file_path, "r")
        data = json.loads(config_file_data.read())
        return data
    return


def add_project(path):
    try:
        project_name = path.split('/')[-1]

        if not os.path.exists(path):
            os.mkdir(path)

        # Update workspace config
        config = read_config(WORKSPACE_CONFIG_PATH)
        workspace_info = WorkspaceInfo(config.__dict__)
        # config_dict = config.__dict__
        exist_project = [
            project for project in workspace_info.open_projects if project.path == path]
        if len(exist_project) > 0:
            project_id = exist_project[0].id
        else:
            project_id = str(uuid.uuid1())
            new_project = {
                'id': project_id,
                'name': project_name,
                'path': path
            }
            workspace_info.open_projects.append(new_project)
            workspace_info.active_project = project_id
            save_config(workspace_info, WORKSPACE_CONFIG_PATH)

            # # Create main.py file
            # main_file_path = os.path.join(path, 'main.py')
            # if not os.path.exists(main_file_path):
            #     with open(main_file_path, 'w'):
            #         pass

        # Assign project
        active_project = ProjectMetadata(
            path=path,
            name=project_name,
            id=project_id,
            data_path=os.path.join(path, CNEXT_PROJECT_FOLDER),
            config_path=None
        )

        active_project.config_path = os.path.join(
            active_project.data_path, CNEXT_PROJECT_CONFIG_FILE)

        # Set activate project
        # set_active_project(active_project)

        # Create .cnext/cnext.yaml if not exsists
        cnext_project_path = os.path.join(path, CNEXT_PROJECT_FOLDER)
        if not os.path.exists(cnext_project_path):
            os.mkdir(cnext_project_path)
        cnext_config_path = os.path.join(
            cnext_project_path, CNEXT_PROJECT_CONFIG_FILE)
        if not os.path.exists(cnext_config_path):
            with open(cnext_config_path, 'w'):
                pass

        return workspace_info
    except Exception as ex:
        raise ex


def get_workspace_config():
    config = read_config(WORKSPACE_CONFIG_PATH)
    return config.__dict__
    # open_projects = []
    # if hasattr(config, 'open_projects') and isinstance(config.open_projects, list):
    #     open_projects = config.open_projects
    # return open_projects


def save_workspace_config(config):
    workspace_info = WorkspaceInfo(config)
    save_config(workspace_info, WORKSPACE_CONFIG_PATH)
    return workspace_info
