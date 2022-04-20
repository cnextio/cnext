import os
import subprocess
from subprocess import Popen

web_path = os.path.dirname(os.path.realpath(__file__))  # cyc-next
server_path = os.path.join(web_path, 'server')


def main():
    # holds the directory where python script is located
    os.chdir(web_path)
    os.system('npm i --force')
    os.system('npm run build')
    os.chdir(server_path)
    os.system('npm i')


def start():
    os.chdir(web_path)
    web_proc = Popen("npm start", shell=True)
    os.chdir(server_path)
    ser_proc = Popen("npm start", shell=True)

if __name__ == "__main__":
    main()
