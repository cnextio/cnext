import os
import logs
from message import FileMetadata

log = logs.get_logger(__name__)

def list_dir(path):
    try:
        pass
    except Exception:
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

def read_file(path):
    try:
        log.info('Read file %s' % path)
        with open(path) as file:
            contents = file.read().splitlines()
        return contents
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

def get_open_files():
    try:
        return open_files
    except Exception:
        raise Exception

def set_working_dir(path):
    try:
        os.chdir(path)
        return True
    except Exception:
        raise Exception        

PROJECT_DIR = '/Users/bachbui/works/cycai/cnext-working-dir'
open_files = [FileMetadata(**{'path': PROJECT_DIR+'/data_loader.py', 'name': 'data_loader.py', 'executor': False, 'type': 'python'}),
    FileMetadata(**{'path': PROJECT_DIR+'/demo.py', 'name': 'demo.py', 'executor': True, 'type': 'python'})] 
# os.chdir(PROJECT_DIR)       