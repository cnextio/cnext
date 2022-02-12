import os
from os.path import isfile, join, exists
import send2trash
import simplejson as json
from libs import logs
from project_manager.interfaces import FileMetadata, DirMetatdata
from project_manager.interfaces import FileContent

log = logs.get_logger(__name__)

def list_dir(path):
    dir_list: DirMetatdata = []
    try:
        for f in os.listdir(path):
            fpath = join(path, f)
            dir_list.append(DirMetatdata(fpath, name=f, is_file = isfile(fpath), timestamp = os.path.getmtime(path)))
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

def read_file(path, timestamp = None):
    try:
        result: FileContent = None
        log.info('Read file %s, old timestamp %s' % (path, timestamp))
        if (timestamp != os.path.getmtime(path)):
            timestamp = os.path.getmtime(path)
            log.info('Read file have new timestamp %s, %s' % (path, timestamp))
            with open(path) as file:
                result = FileContent(file.read().splitlines(), timestamp)            
        else:
            log.info('Read file have the same timestamp %s, %s' % (path, timestamp))
        return result
    except Exception:
        raise Exception

def create_file(path):
    try:
        log.info('Create file %s' % path)
        if exists(path): #TODO return error here
            log.info('File already exists %s' % path)
        else:
            with open(path, 'w') as file:
                pass
        return FileMetadata(path, name = path.split('/')[-1], timestamp = os.path.getmtime(path))
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
    """Save file and return file metadata
    """
    try:
        log.info('Save file %s' % path)
        with open(path, 'w') as file:
            file.write(content)
        # return FileMetadata(**{'path': path, 'name': path.split('/')[-1], 'timestamp': os.path.getmtime(path) })
        return FileMetadata(path, name = path.split('/')[-1], timestamp = os.path.getmtime(path))
    except Exception:
        raise Exception        

