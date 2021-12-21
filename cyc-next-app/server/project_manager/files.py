import os
from os.path import isfile, join, exists
import send2trash
import simplejson as json
import logs
from message import FileMetadata

log = logs.get_logger(__name__)

class Directory:
    def __init__(self, **entries): 
        self.path = None
        self.name = None
        self.is_file = None
        self.__dict__.update(entries) 
    
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, ignore_nan=True)

    def __repr__(self) -> str:
        return self.toJSON() 

def list_dir(path):
    dir_list: Directory = []
    try:
        for f in os.listdir(path):
            fpath = join(path, f)
            dir_list.append(Directory(**{'path': fpath, 'name': f, 'is_file': isfile(fpath)}))
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

def read_file(path):
    try:
        log.info('Read file %s' % path)
        with open(path) as file:
            contents = file.read().splitlines()
        return contents
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
        return True
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
        return FileMetadata(**{'path': path, 'name': path.split('/')[-1]})
    except Exception:
        raise Exception

def set_working_dir(path):
    try:
        os.chdir(path)
        return True
    except Exception:
        raise Exception        

