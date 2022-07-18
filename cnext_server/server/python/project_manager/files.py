import os
from os.path import isfile, join, exists
import traceback
import send2trash
import simplejson as json
from libs import logs
from project_manager.interfaces import FileMetadata, DirMetatdata
from project_manager.interfaces import FileContent

log = logs.get_logger(__name__)

# The folder that consist the state, configuration files
CNEXT_FOLDER_PATH = '.cnext'

UNDELETABLE_FILES = ['main.py', 'config.json']


def list_dir(project_path, relative_dir_path):
    dir_list: DirMetatdata = []
    try:
        if project_path != None and relative_dir_path != None:
            dir_path = os.path.join(project_path, relative_dir_path)
            log.info('list_dir paths: %s %s %s' %
                     (project_path, relative_dir_path, dir_path))
            for file_name in os.listdir(dir_path):
                relative_file_path = os.path.join(relative_dir_path, file_name)
                file_path = os.path.join(dir_path, file_name)
                new_file = DirMetatdata(
                    relative_file_path,
                    name=file_name,
                    is_file=isfile(file_path),
                    deletable=False if relative_file_path in UNDELETABLE_FILES else True,
                    timestamp=os.path.getmtime(file_path)
                )
                dir_list.append(new_file)
        return dir_list
    except Exception as error:
        log.error("%s - %s" % (error, traceback.format_exc()))
        raise Exception


def get_file_metadata(path):
    try:
        pass
    except Exception:
        raise Exception


def set_name(path):
    try:
        pass
    except Exception:
        raise Exception


def read_file(project_path, relative_file_path, timestamp=None):
    try:
        result: FileContent = None
        if project_path != None and relative_file_path != None:
            log.info('Read file %s, old timestamp %s' %
                     (relative_file_path, timestamp))
            file_path = get_abs_file_path(project_path, relative_file_path)
            if (timestamp != os.path.getmtime(file_path)):
                timestamp = os.path.getmtime(file_path)
                log.info('Read file have new timestamp %s, %s' %
                         (file_path, timestamp))
                # Read file content
                with open(file_path) as file:
                    content = file.read()
                    content_lines = content.splitlines()
                    if content_lines == [] or content[-1] == '\n':
                        content_lines.append('')
                    result = FileContent(
                        content=content_lines, timestamp=timestamp)

                # If state file path is exists that mean, the state already saved.
                # Read data from state file path.
                state_path = get_state_path(project_path, relative_file_path)
                if os.path.exists(state_path):
                    with open(state_path) as state_file:
                        data = json.load(state_file)
                        result.code_lines = data
            else:
                log.info('Read file have the same timestamp %s, %s' %
                         (relative_file_path, timestamp))
        return result
    except Exception:
        raise Exception


def create_file(project_path, relative_file_path):
    try:
        if project_path != None and relative_file_path != None:
            log.info('Create file %s' % relative_file_path)
            file_path = get_abs_file_path(project_path, relative_file_path)
            if exists(file_path):  # TODO return error here
                log.info('File already exists %s' % file_path)
            else:
                with open(file_path, 'w') as file:
                    pass
            return FileMetadata(path=relative_file_path, name=os.path.basename(relative_file_path), timestamp=os.path.getmtime(file_path))
        return None
    except Exception as error:
        log.error("%s - %s" % (error, traceback.format_exc()))
        raise Exception


def create_folder(project_path, relative_folder_path):
    try:
        if project_path != None and relative_folder_path != None:
            log.info('Create folder %s' % relative_folder_path)
            folder_path = get_abs_file_path(project_path, relative_folder_path)
            if exists(folder_path):  # TODO return error here
                log.info('Folder already exists %s' % folder_path)
            else:
                os.mkdir(folder_path)
            return FileMetadata(path=relative_folder_path, name=relative_folder_path, timestamp=os.path.getmtime(folder_path))
        return None
    except Exception as error:
        log.error("%s - %s" % (error, traceback.format_exc()))
        raise Exception


def delete(project_path, relative_file_path):
    try:
        if project_path != None and relative_file_path != None:
            file_path = get_abs_file_path(project_path, relative_file_path)
            log.info('Send item to trash %s' % file_path)
            send2trash.send2trash(file_path)
            return FileMetadata(path=project_path, name=relative_file_path, timestamp=None)
        return None
    except Exception as error:
        log.error("%s - %s" % (error, traceback.format_exc()))
        raise Exception


def save_file(project_path, relative_file_path, content):
    """
        Save file and return file metadata
    """
    try:
        if project_path != None and relative_file_path != None:
            log.info('Save file {}'.format(relative_file_path))
            file_path = get_abs_file_path(project_path, relative_file_path)
            file_name = os.path.basename(relative_file_path)
            with open(file_path, 'w') as file:
                file.write(content)
            return FileMetadata(path=relative_file_path, name=file_name, timestamp=os.path.getmtime(file_path))
        else:
            return None
    except Exception as error:
        log.error("%s - %s" % (error, traceback.format_exc()))
        raise Exception


def save_state(project_path, relative_file_path, content):
    """
        Save state and return file metadata
    """
    try:
        if project_path != None and relative_file_path != None:
            log.info('Save state {}'.format(relative_file_path))
            state_file_path = get_state_path(project_path, relative_file_path)
            state_file_name = os.path.basename(state_file_path)
            os.makedirs(os.path.dirname(state_file_path), exist_ok=True)
            with open(state_file_path, 'w') as outfile:
                outfile.write(json.dumps(content))
            # TODO return the relative state path instead
            return FileMetadata(path=relative_file_path, name=state_file_name, timestamp=os.path.getmtime(state_file_path))
        else: 
            return None
    except Exception as ex:
        log.error("Save state error: {}".format(ex))
        raise Exception


def get_abs_file_path(project_path, relative_file_path):
    return os.path.join(project_path, relative_file_path)


def get_state_path(project_path, relative_file_path):
    """
        Get state path from file path
    """
    # if project_path not in relative_file_path:
    #     err = "Project path is not match with file path: {project_path} path: {path}".format(
    #         project_path=project_path, path=relative_file_path)
    #     log.error(err)
    #     raise Exception(err)
    # sub_path = relative_file_path.replace(project_path, "")
    # # If the first character is slash, must remove this to make the os.path.join function work properly
    # # If It start with a slash, then python is considered an "absolute path" and everything before it is discarded
    # if sub_path[0] == '/':
    #     sub_path = sub_path[1::]  # Remove the first character is slash
    file_path = os.path.join(
        project_path, CNEXT_FOLDER_PATH, 'states', relative_file_path)
    state_path = os.path.splitext(file_path)[0] + '.json'
    return state_path
