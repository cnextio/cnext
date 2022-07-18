import glob
import os
from site import abs_paths
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
if sys.platform.startswith("win"):
    from pyreadline import Readline
    readline = Readline()
else:
    import readline


web_path = os.path.dirname(os.path.realpath(__file__))  # cyc-next
server_path = os.path.join(web_path, 'server')
FILE_NAME = 'workspace.yaml'
WITHOUT_PROJECT = 0
HAVE_PROJECT = 1
DOWNLOAD_PATH = 'https://bitbucket.org/robotdreamers/cnext_sample_projects/get/master.zip'


def change_permissions_recursive(path, mode):
    for root, dirs, files in os.walk(path, topdown=False):
        for dir in [os.path.join(root, d) for d in dirs]:
            os.chmod(dir, mode)
    for file in [os.path.join(root, f) for f in files]:
        os.chmod(file, mode)


def change_path(path):
    os.chdir(server_path)
    project_id = str(uuid.uuid1())
    data = {
        'active_project': project_id,
        'open_projects': [{"id": project_id, 'name': 'Skywalker', 'path': path}],
    }
    with open(r'workspace.yaml', 'w') as file:
        documents = yaml.dump(data, file, default_flow_style=False)
    print('Adding sample project done!')


def clear_content():
    os.chdir(server_path)
    my_file = open(FILE_NAME, 'w')
    new_file_contents = ''
    # Convert `string_list` to a single string
    my_file.write(new_file_contents)
    my_file.close()


def ask():
    answer = input('Would you like to download the sample project? [(y)/n]: ')
    if(answer == 'y' or answer == 'Y'):
        return HAVE_PROJECT
    elif not answer:
        return HAVE_PROJECT
    elif (answer == 'n' or answer == 'N'):
        clear_content()
        return WITHOUT_PROJECT
    else:
        ask()


def build():
    # TODO(huytq): remove
    # os.chdir(web_path)
    # os.system('npm i --force')
    # os.system('npm run build')
    os.chdir(server_path)
    os.system('npm i')


def download_and_unzip(url, extract_to='.'):
    http_response = urlopen(url)
    zipfile = ZipFile(BytesIO(http_response.read()))
    zipfile.extractall(path=extract_to)

    # grand per
    change_permissions_recursive(extract_to, 0o777)

    # cut - paste
    shutil.copytree(src=os.path.join(extract_to, zipfile.namelist()[
                    0], 'Skywalker'), dst=os.path.join(extract_to, 'Skywalker'), dirs_exist_ok=True)
    sample_project_path = os.path.join(extract_to, 'Skywalker')
    # remove old folder
    shutil.rmtree(path=os.path.join(extract_to, zipfile.namelist()[0]))
    change_path(os.path.normpath(sample_project_path).replace(os.sep, '/'))


def complete(text, state):
    return (glob.glob(os.path.expanduser(text+'*'))+[None])[state]


readline.set_completer_delims(' \t\n;')
readline.parse_and_bind("tab: complete")
readline.set_completer(complete)


def build_path():
    path = input(
        'Please enter the directory to store the sample project: ')
    abs_paths = os.path.abspath(path)

    if not os.path.exists(abs_paths):
        os.makedirs(abs_paths)

    if os.path.isdir(abs_paths):
        os.chdir(abs_paths)
        # folder_name = os.path.basename(abs_paths)
        print('The sample project will be downloaded to', abs_paths)
        download_and_unzip(DOWNLOAD_PATH, abs_paths)
    else:
        print('The path is not a directory. Please try again!')
        build_path()




def main():
    status = ask()
    if(status == WITHOUT_PROJECT):
        # remove all in workspace.yaml
        clear_content()
        build()
    else:
        build_path()
        build()


@contextmanager
def run_and_terminate_process():
    try:
        print("cnext starting !")

        # TODO(huytq): remove
        # os.chdir(web_path)
        # web_proc = Popen('npm start', shell=True)

        os.chdir(server_path)
        my_env = os.environ.copy()
        my_env["PATH"] = os.path.dirname(
            sys.executable) + os.path.pathsep + my_env["PATH"]

        ser_proc = Popen('npm run start-prod', shell=True, env=my_env)
        yield

    finally:
        web_proc.terminate()  # send sigterm, or ...
        web_proc.kill()      # send sigkill

        ser_proc.terminate()  # send sigterm, or ...
        ser_proc.kill()      # send sigkill


def start():
    with run_and_terminate_process() as running_proc:
        while True:
            time.sleep(1000)


if __name__ == '__main__':
    start()
