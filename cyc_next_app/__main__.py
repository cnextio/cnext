import os
import subprocess
from subprocess import Popen

web_path = os.path.dirname(os.path.realpath(__file__))  # cyc-next
server_path = os.path.join(web_path, 'server')
FILE_NAME = '.server.yaml'


def main():
    os.chdir(web_path)
    os.system('npm i --force')
    os.system('npm run build')
    os.chdir(server_path)
    os.system('npm i')

    os.chdir(server_path)
    my_file = open(FILE_NAME)
    print('auto intinialize default Skywalker folder path inside server')

    string_list = my_file.readlines()
    # Get file's content as a list
    my_file.close()
    string_list[11] = string_list[11].replace(
        'cnext_sample_projects/Skywalker', server_path + '/Skywalker')
    print(string_list[11])
    my_file = open(FILE_NAME, 'w')
    new_file_contents = ''.join(string_list)
    # Convert `string_list` to a single string
    my_file.write(new_file_contents)
    my_file.close()
    # readable_file = open(FILE_NAME)
    # read_file = readable_file.read()
    # print(read_file)


def path():
    var = input('Please enter something: ')
    print('You entered: ' + var)


def start():
    os.chdir(web_path)
    web_proc = Popen('npm start', shell=True)
    os.chdir(server_path)
    ser_proc = Popen('npm start', shell=True)


if __name__ == '__main__':
    main()
