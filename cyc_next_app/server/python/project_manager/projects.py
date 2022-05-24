import os
import uuid
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
FILE_CONFIG = 'config.json'


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
        raise Exception  # this will be seen in the web app #


def close_file(path):
    open_files = []
    try:
        if active_project:
            config_path = active_project.config_path  # active_project.path+'/.cnext.yaml'
            if exists(config_path):
                config = read_config(config_path)
                if hasattr(config, 'open_files'):
                    for f in config.open_files:
                        # do not include the file that is being closed
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
        if active_project:
            config_path = active_project.config_path  # active_project.path+'/.cnext.yaml'
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


def save_project_config(content):
    try:
        # config_file_path = os.path.join(project_path, FILE_CONFIG)
        active_project = get_active_project()
        config_file_path = os.path.join(
            active_project.path, FILE_CONFIG)
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
        active_project.path, FILE_CONFIG)
    if os.path.exists(config_file_path):
        config_file_data = open(config_file_path, "r")
        data = json.loads(config_file_data.read())
        return data
    return


def add_project(path):
    project_name = path.split('/')[-1]

    if not os.path.exists(path):
        os.mkdir(path)

    try:
        # Update .server.yaml config
        config = read_config(
            '.server.yaml')
        config_dict = config.__dict__
        new_project_id = str(uuid.uuid1())
        new_project = {
            'id': new_project_id,
            'name': project_name,
            'path': path
        }
        config_dict['projects']['open_projects'].append(new_project)
        config_dict['projects']['active_project'] = new_project_id
        save_config(config_dict, '.server.yaml')

        # Assign project
        project_active = ProjectMetadata(
            path=path,
            name=project_name,
            id=new_project_id,
            data_path=os.path.join(path, '.cnext'),
            config_path=None
        )

        project_active.config_path = os.path.join(
            project_active.data_path, 'cnext.yaml')

        # Set activate project
        set_active_project(project_active)

        # Create main.py file
        main_file_path = os.path.join(path, 'main.py')
        if not os.path.exists(main_file_path):
            with open(main_file_path, 'w'):
                pass

        # Create cnext.yaml if not exsists
        cnext_config_folder_path = os.path.join(path, '.cnext')
        if not os.path.exists(cnext_config_folder_path):
            os.mkdir(cnext_config_folder_path)
        cnext_config_path = os.path.join(
            cnext_config_folder_path, 'cnext.yaml')
        if not os.path.exists(cnext_config_path):
            content = {
                'executor': 'main.py',
                'open_files': [{
                    'executor': True,
                    'name': 'main.py',
                    'path': 'main.py'
                }]
            }
            save_config(content, cnext_config_path)
        return project_active
    except Exception as ex:
        raise ex
