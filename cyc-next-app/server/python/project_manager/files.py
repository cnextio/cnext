import os
from os.path import isfile, join, exists
import send2trash
import simplejson as json
from libs import logs
from project_manager.interfaces import FileMetadata, DirMetatdata
from project_manager.interfaces import FileContent

log = logs.get_logger(__name__)

# The folder that consist the state, configuration files
CNEXT_FOLDER_PATH = '.cnext/'


def list_dir(path):
    dir_list: DirMetatdata = []
    try:
        for f in os.listdir(path):
            fpath = join(path, f)
            dir_list.append(DirMetatdata(fpath, name=f, is_file=isfile(
                fpath), timestamp=os.path.getmtime(path)))
    except Exception:
        raise Exception
    return dir_list


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


def read_file(path, project_path, timestamp=None):
    try:
        result: FileContent = None
        log.info('Read file %s, old timestamp %s' % (path, timestamp))
        if (timestamp != os.path.getmtime(path)):
            timestamp = os.path.getmtime(path)
            log.info('Read file have new timestamp %s, %s' % (path, timestamp))

            # Read file content
            with open(path) as file:
                content = file.read()
                content_lines = content.splitlines()
                if content_lines == [] or content[-1] == '\n':
                    content_lines.append('')
                result = FileContent(
                    content=content_lines, timestamp=timestamp)

            # If state file path is exists that mean, the state already saved.
            # Read data from state file path.
            state_path = get_state_path(path, project_path)
            if os.path.exists(state_path):
                with open(state_path) as state_file:
                    data = json.load(state_file)
                    result.code_lines = data
        else:
            log.info('Read file have the same timestamp %s, %s' %
                     (path, timestamp))
        return result
    except Exception:
        raise Exception


def create_file(path):
    try:
        log.info('Create file %s' % path)
        if exists(path):  # TODO return error here
            log.info('File already exists %s' % path)
        else:
            with open(path, 'w') as file:
                pass
        return FileMetadata(path, name=path.split('/')[-1], timestamp=os.path.getmtime(path))
    except Exception:
        raise Exception


def delete(path, is_file):
    try:
        log.info('Send item to trash %s' % path)
        send2trash.send2trash(path)
        return True
    except Exception:
        raise Exception


def save_file(path, content):
    """
        Save file and return file metadata
    """
    try:
        log.info('Save file {}'.format(path))
        with open(path, 'w') as file:
            file.write(content)
        # return FileMetadata(**{'path': path, 'name': path.split('/')[-1], 'timestamp': os.path.getmtime(path) })
        return FileMetadata(path, name=path.split('/')[-1], timestamp=os.path.getmtime(path))
    except Exception:
        raise Exception


def save_state(path, project_path, content):
    """
        Save state and return file metadata
    """
    try:
        log.info('Save state {}'.format(path))
        state_path = get_state_path(path, project_path)
        state_file_name = state_path.split('/')[-1]
        os.makedirs(os.path.dirname(state_path), exist_ok=True)
        with open(state_path, 'w') as outfile:
            outfile.write(json.dumps(content))
        return FileMetadata(state_path, name=state_file_name, timestamp=os.path.getmtime(path))
    except Exception as ex:
        log.error("Save state error: {}".format(ex))
        raise Exception


def get_state_path(path, project_path):
    """
        Get state path from file path
    """
    if project_path not in path:
        err = "Project path is not match with file path: {project_path} path: {path}".format(
            project_path=project_path, path=path)
        log.error(err)
        raise Exception(err)
    sub_path = path.replace(project_path, "")
    # If the first character is slash, must remove this to make the os.path.join function work properly
    # If It start with a slash, then python is considered an "absolute path" and everything before it is discarded
    if sub_path[0] == '/':
        sub_path = sub_path[1::]  # Remove the first character is slash
    file_path = os.path.join(
        project_path, CNEXT_FOLDER_PATH, 'states', sub_path)
    state_path = os.path.splitext(file_path)[0] + '.json'
    return state_path
