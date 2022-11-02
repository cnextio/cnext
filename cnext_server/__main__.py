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
import json
import argparse
from os import path
import requests
root_url = "http://logs-01.loggly.com/inputs/c58f8bb2-2332-4915-b9f3-70c1975956bb/tag/"
from datetime import datetime


current_dir_path = os.getcwd()
basepath = _path.dirname(__file__)
path = Path(basepath)
current_dir_path = path.absolute()

DEFAULT_PROJECTS_PATH = os.path.abspath(os.path.join(current_dir_path,"projects"))
SERVER_PATH = os.path.abspath(os.path.join(current_dir_path,"server"))
NODE_MODULES_PATH = os.path.abspath(os.path.join(current_dir_path,"server","node_modules"))
PACKAGE_PATH = os.path.abspath(os.path.join(current_dir_path,"server","package.json"))
PACKAGE_LOCK_PATH = os.path.abspath(os.path.join(current_dir_path,"server","package-lock.json"))
STORE_MD5_FILE_PATH = os.path.abspath(os.path.join(current_dir_path,"server","track-md5.txt"))

DEFAULT_PORT = 4000
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
        "active_project": project_id,
        "open_projects": [{"id": project_id, "name": name, "path": path}],
    }
    
    os.chdir(current_dir_path)
    with open(r"workspace.yaml", "w") as file:
        yaml.dump(data, file, default_flow_style=False)


def update_md5():
    md5 = hashlib.md5(open(PACKAGE_LOCK_PATH,"rb").read()).hexdigest()
    f = open(STORE_MD5_FILE_PATH, "w")
    f.write(md5)
    f.close()


def install():
    os.chdir(SERVER_PATH)
    os.system("npm i")

    #track md5 package lock
    update_md5()
    

def download_and_unzip(url, project_name, extract_to="."):
    if not os.path.exists(DEFAULT_PROJECTS_PATH): 
        os.makedirs(DEFAULT_PROJECTS_PATH)

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
    return (glob.glob(os.path.expanduser(text+"*"))+[None])[state]


readline.set_completer_delims(" \t\n;")
readline.parse_and_bind("tab: complete")
readline.set_completer(complete)


def is_cnext_updated():
    if(os.path.exists(STORE_MD5_FILE_PATH)):
        md5 = hashlib.md5(open(PACKAGE_LOCK_PATH,"rb").read()).hexdigest()
        with open(STORE_MD5_FILE_PATH, "r") as file:
            data = file.read()
            if data == md5:
                return False
            else:
                return True
    else:
        return True
    

def main(args=sys.argv):
    parser = argparse.ArgumentParser(description="Process Cnext Commands.")
    parser.add_argument("-v", "--version", action = "store_true" , help= "show the version")
    parser.add_argument("-l", "--path" , help = "Download the sample project to PATH")
    parser.add_argument("-p", "--port" , help = "Start the CNext at port", default = DEFAULT_PORT, type = int)
    parser.add_argument("-e", "--no_event_log", action = "store_true" , help = "disable event log")
    
    args = parser.parse_args()
    if args.version:
        show_the_version()
    else:
        start_with_command(args.path, args.port, args.no_event_log)


def show_the_version():
    f = open(PACKAGE_PATH)
    data = json.load(f)
    print(data["version"])


def asking_choice():
    answer = input('Would you like to download the sample project? [(y)/n]: ')
    if(answer == 'y' or answer == 'Y'):
        return HAVE_PROJECT
    elif not answer:
        return HAVE_PROJECT
    elif (answer == 'n' or answer == 'N'):
        return WITHOUT_PROJECT
    else:
        asking_choice()


def asking_path(command):
    path = input(
        'Please enter the directory to store the sample project: ')
    if(len(path) > 0):
        abs_paths = os.path.abspath(path)
        if os.path.isdir(abs_paths):
            start_with_sample_project(command, abs_paths)
        else:
            print('The path is not a directory. Please try again!')
            asking_path(command)
    else:
        asking_path(command)


def start_with_command(path= None, port = DEFAULT_PORT, no_event_log = False):
    global command
    if no_event_log: 
        command = "set PORT="+ f"{port} " + "set EVENT_LOG_DISABLE= true " + "&& node server.js"
    else:
        command = "set PORT="+ f"{port}" + "&& node server.js"

    if path:
        start_with_sample_project(command, path)
    else:
        if(is_first_time()):
            status = asking_choice()
            if(status == WITHOUT_PROJECT):
                start(command)
            else:
                asking_path(command)
        else: start(command)


def download_project(project_name, download_to_path):
    download_and_unzip(DOWNLOAD_PATH, project_name, download_to_path)
    project_path = os.path.join(download_to_path, project_name)
    change_workspace(project_name, os.path.normpath(project_path).replace(os.sep, "/"))


def is_first_time():
    if(os.path.exists(NODE_MODULES_PATH)):
        return False
    else:
        tag = "install"
        url = root_url + tag
        requests.post(url, data = { "time": datetime.utcnow().strftime('%d-%m-%Y %H:%M:%S') })
        return True


def start_with_sample_project(command, path):
    abs_paths = os.path.abspath(path)
    if os.path.isdir(abs_paths):
        download_project(DEFAULT_PROJECT,abs_paths)
        start(command)
    else:
        print("your path isn't correctly")


@contextmanager
def run_and_terminate_process(command):
    
    try:
        if is_cnext_updated():
            install()

        os.chdir(SERVER_PATH)
        my_env = os.environ.copy()
        my_env["PATH"] = os.path.dirname(
        sys.executable) + os.path.pathsep + my_env["PATH"]
        ser_proc = Popen(command, shell=True, env=my_env)
        yield

    finally:
        ser_proc.terminate()  # send sigterm, or ...
        ser_proc.kill()      # send sigkill


def start(command):
    with run_and_terminate_process(command) as running_proc:
        while True:
            time.sleep(1000)


if __name__ == "__main__":
    start()
