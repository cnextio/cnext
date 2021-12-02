import os

from message import FileMetadata

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
        with open(path) as f:
            contents = f.readlines()
        return contents
    except Exception:
        raise Exception

def save_file(path):
    """Save file and return file metadata

    Args:
        path ([type]): [description]
        file_name ([type]): [description]
    """
    try:
        dirs = os.listdir(path)
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
open_files = [FileMetadata(**{'path': PROJECT_DIR+'/data-loader.py', 'name': 'data-loader.py', 'executor': False, 'type': 'python'}),
    FileMetadata(**{'path': PROJECT_DIR+'/demo.py', 'name': 'demo.py', 'executor': True, 'type': 'python'})]        