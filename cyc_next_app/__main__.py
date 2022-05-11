import os
import sys
from subprocess import Popen
from contextlib import contextmanager
import time


web_path = os.path.dirname(os.path.realpath(__file__))  # cyc-next
server_path = os.path.join(web_path, 'server')
FILE_NAME = '.server.yaml'
CHANGE_LINE_NUMBER = 14
FIELD_LENGTH = 10


def change_path(path):
    os.chdir(server_path)
    my_file = open(FILE_NAME)

    string_list = my_file.readlines()
    # Get file's content as a list
    my_file.close()
    content = string_list[CHANGE_LINE_NUMBER]
    print(string_list[CHANGE_LINE_NUMBER])
    string_list[CHANGE_LINE_NUMBER] = content[:FIELD_LENGTH] + \
        'path: ' + '\'' + path + '\'' + '\n'
    print(string_list[CHANGE_LINE_NUMBER])
    my_file = open(FILE_NAME, 'w')
    new_file_contents = ''.join(string_list)
    # Convert `string_list` to a single string
    my_file.write(new_file_contents)
    my_file.close()
    print('map path done!')


def main():
    path()
    os.chdir(web_path)
    os.system('npm i --force')
    os.system('npm run build')
    os.chdir(server_path)
    os.system('npm i')


def path():
    path = input('Please enter your project directory\'s path:')
    print('Checking your path: ' + path)
    if os.path.isdir(path):
        os.chdir(path)
        folder_name = os.path.basename(path)
        print('folder_name', folder_name)
        change_path(path)
    else:
        print('Your path isn\'t correct, Please try again')


@contextmanager
def run_and_terminate_process():
    try:
        print("cnext starting !")

        os.chdir(web_path)
        web_proc = Popen('npm start', shell=True)

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
    main()
