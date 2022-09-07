import glob
import os
import sys
from subprocess import Popen
from contextlib import contextmanager
import time

from urllib.request import urlopen
from io import BytesIO
from zipfile import ZipFile
import uuid
import shutil
import yaml
import os
from os import path as _path
import hashlib
from pathlib import Path
if sys.platform.startswith("win"):
    from pyreadline import Readline
    readline = Readline()
else:
    import readline

current_dir_path = os.getcwd()
basepath = _path.dirname(__file__)
path = Path(basepath)
current_dir_path = path.absolute()

PROJECTS_PATH = os.path.abspath(os.path.join(current_dir_path,"projects"))
SERVER_PATH = os.path.abspath(os.path.join(current_dir_path,"server"))
NODE_MODULES_PATH = os.path.abspath(os.path.join(current_dir_path,"server","node_modules"))
PACKAGE_LOCK_PATH = os.path.abspath(os.path.join(current_dir_path,"server","package-lock.json"))
STORE_MD5_FILE_PATH = os.path.abspath(os.path.join(current_dir_path,"server","track-md5.txt"))
DEFAULT_PROJECT = "Skywalker"
WITHOUT_PROJECT = 0
HAVE_PROJECT = 1
DOWNLOAD_PATH = 'https://bitbucket.org/robotdreamers/cnext_sample_projects/get/master.zip'

def change_permissions_recursive(path, mode):
    for root, dirs, files in os.walk(path, topdown=False):
        for dir in [os.path.join(root, d) for d in dirs]:
            os.chmod(dir, mode)
    for file in [os.path.join(root, f) for f in files]:
        os.chmod(file, mode)


def change_workspace(name, path):
    project_id = str(uuid.uuid1())
    data = {
        'active_project': project_id,
        'open_projects': [{"id": project_id, 'name': name, 'path': path}],
    }
    
    os.chdir(current_dir_path)
    with open(r'workspace.yaml', 'w') as file:
        documents = yaml.dump(data, file, default_flow_style=False)


def update_md5():
    md5 = hashlib.md5(open(PACKAGE_LOCK_PATH,'rb').read()).hexdigest()
    f = open(STORE_MD5_FILE_PATH, "w")
    f.write(md5)
    f.close()


def install():
    os.chdir(SERVER_PATH)
    os.system('npm i')

    #track md5 package lock
    update_md5()
    

samples = {
    "skywalker": "Skywalker",
}

def download_and_unzip(url, project_name, extract_to='.'):
    if not os.path.exists(PROJECTS_PATH): 
        os.makedirs(PROJECTS_PATH)

    http_response = urlopen(url)
    zipfile = ZipFile(BytesIO(http_response.read()))
    zipfile.extractall(path=extract_to)

    # grand per
    change_permissions_recursive(extract_to, 0o777)

    # cut - paste
    shutil.copytree(src=os.path.join(extract_to, zipfile.namelist()[
                    0], project_name), dst=os.path.join(extract_to, project_name), dirs_exist_ok=True)
    
    # remove old folder
    shutil.rmtree(path=os.path.join(extract_to, zipfile.namelist()[0]))
  

def complete(text, state):
    return (glob.glob(os.path.expanduser(text+'*'))+[None])[state]


readline.set_completer_delims(' \t\n;')
readline.parse_and_bind("tab: complete")
readline.set_completer(complete)

def is_first_time():
    if(os.path.exists(NODE_MODULES_PATH)):
        return False
    else:
        return True


def is_updated():
    if(os.path.exists(STORE_MD5_FILE_PATH)):
        md5 = hashlib.md5(open(PACKAGE_LOCK_PATH,'rb').read()).hexdigest()
        with open(STORE_MD5_FILE_PATH, 'r') as file:
            data = file.read()
            if data == md5:
                return False
            else:
                return True
    else:
        return True
    

def main(args=sys.argv):
        if(len(args) == 1):
            # cnext the 1rst time
            if(is_first_time()):
                status = ask()
                if(status == WITHOUT_PROJECT):
                    install()
                    start()
                else:
                    run_with_aks_path()
            else:
                # cnext many times - check is any update?
                if(is_updated()):
                    install()
                start()

        elif(len(args) == 2):
            # cnext with mode
            if(args[1].isnumeric()):
                run_at_port(int(args[1]))
            else:
                switch(args[1])
        elif(len(args) == 3):
            # cnext with mode and param
            switch(args[1],args[2])
        else:
            default()

def run_help(choice):
    message = """
        Installation command
        - cnext -s                     : START with `Skywalker` project
        # - cnext -s Skywalker                : START with `Skywalker` project
        - cnext -s G:\DEV\PROJECTS     : START with `Skywalker` inside PROJECTS

        Using command
        - cnext                        : RESUME APPLICATION or START
        - cnext 8888                   : RESUME APPLICATION at PORT 8888
        """
    print(message)
    
def default(data):
    run_help(data)
    
def run_at_port(port):
    start(port)
   

def download_project(project_name, download_to_path):
    download_and_unzip(DOWNLOAD_PATH, project_name, download_to_path)
    project_path = os.path.join(download_to_path, project_name)
    change_workspace(project_name, os.path.normpath(project_path).replace(os.sep, '/'))


def download(path_or_name):
    if(path_or_name):
        abs_paths = os.path.abspath(path_or_name)
        if os.path.isdir(abs_paths):
            # cnext -s G:\DEV\PROJECTS
            download_project(DEFAULT_PROJECT,abs_paths)
        elif(path_or_name.lower() in list(samples.keys())):
            # cnext -s skywalker|Jedi
            download_project(samples[path_or_name.lower()], PROJECTS_PATH)
        else:
            print("your path or name isn't correctly")
            return
    else:
        # cnext -s == cnext -s skywalker
        download_project(DEFAULT_PROJECT,PROJECTS_PATH)

def start_with_sample_project(path_or_name):
    download(path_or_name)
    install()
    start()

switcher = {
    "-h": run_help, 
    "-s": start_with_sample_project, 
    # full case
    "help": run_help,
    "start": start_with_sample_project,
}

def ask():
    answer = input('Would you like to download the sample project? [(y)/n]: ')
    if(answer == 'y' or answer == 'Y'):
        return HAVE_PROJECT
    elif not answer:
        return HAVE_PROJECT
    elif (answer == 'n' or answer == 'N'):
        return WITHOUT_PROJECT
    else:
        ask()

def run_with_aks_path():
    path = input(
        'Please enter the directory to store the sample project: ')
    if(len(path) > 0):
        abs_paths = os.path.abspath(path)
        if os.path.isdir(abs_paths):
            start_with_sample_project(abs_paths)
        else:
            print('The path is not a directory. Please try again!')
            run_with_aks_path()
    else:
        run_with_aks_path()


def switch(command, data = None ):
    return switcher.get(command, default)(data)


@contextmanager
def run_and_terminate_process(port):
    try:
        os.chdir(SERVER_PATH)
        my_env = os.environ.copy()
        my_env["PATH"] = os.path.dirname(
            sys.executable) + os.path.pathsep + my_env["PATH"]
        command = "set PORT="+ f'{port}' + "&& node server.js"
        ser_proc = Popen(command, shell=True, env=my_env)
        yield

    finally:
        ser_proc.terminate()  # send sigterm, or ...
        ser_proc.kill()      # send sigkill


def start(port=4000):
    with run_and_terminate_process(port) as running_proc:
        while True:
            time.sleep(1000)


if __name__ == '__main__':
    start()
