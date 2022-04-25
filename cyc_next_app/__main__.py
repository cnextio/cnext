import os
from subprocess import Popen


web_path = os.path.dirname(os.path.realpath(__file__))  # cyc-next
server_path = os.path.join(web_path, 'server')
FILE_NAME = '.server.yaml'


def change_path(path):
    os.chdir(server_path)
    my_file = open(FILE_NAME)

    string_list = my_file.readlines()
    # Get file's content as a list
    my_file.close()
    content = string_list[11]
    print("test", content[:10])
    print(string_list[11])
    string_list[11] = content[:10] + 'path: ' + '\'' + path + '\'' + '\n'
    print(string_list[11])
    my_file = open(FILE_NAME, 'w')
    new_file_contents = ''.join(string_list)
    # Convert `string_list` to a single string
    my_file.write(new_file_contents)
    my_file.close()
    print('map path done')


def main():
    os.chdir(web_path)
    os.system('npm i --force')
    os.system('npm run build')
    os.chdir(server_path)
    os.system('npm i')


def path():
    path = input('Please enter your Skywalker directory\'s path: ')
    print('Checking your path: ' + path)
    if os.path.isdir(path):
        os.chdir(path)
        folder_name = os.path.basename(path)
        print('folder_name', folder_name)
        # check correct dir
        if folder_name != 'Skywalker':
            print('Your path isn\'t correct, Please try again, please make sure the distination is Skywalker folder')
        else:
            # save to yaml
            change_path(path)
    else:
        print('Your path isn\'t correct, Please try again')


def start():
    os.chdir(web_path)
    web_proc = Popen('npm start', shell=True)
    os.chdir(server_path)
    ser_proc = Popen('npm start', shell=True)


if __name__ == '__main__':
    main()
