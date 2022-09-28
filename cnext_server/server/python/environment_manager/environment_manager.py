import hashlib
import os
import subprocess
import sys
import traceback
import jupyter_client
from pathlib import Path
from libs.message_handler import BaseMessageHandler
from libs.message import ContentType, EnvironmentManagerCommand
from libs import logs

log = logs.get_logger(__name__)

def verify_kernel_spec(kernel_spec):
    """verify if the `kernel_spec` exists. If yes then return `kernel_spec`, else return None

    Returns:
        _type_: kernel spec | None
    """
    try:
        jupyter_client.kernelspec.get_kernel_spec(kernel_spec)
        return kernel_spec
    except jupyter_client.kernelspec.NoSuchKernel:
        return None

    
def get_cnext_default_kernel_spec():
    """Get default cnext kernel spec name. If failed, try spec with name `python`. If failed, return None.

    Returns:
        _type_: kernel spec | None
    """
    bin_path = sys.executable
    bin_path_hash = hashlib.md5(bin_path.encode()).hexdigest()
    cnext_ipython_kernel_spec = 'cnext-' + bin_path_hash

    try:
        jupyter_client.kernelspec.get_kernel_spec(cnext_ipython_kernel_spec)
        log.info("Get the default cnext kernel spec %s" %
                    cnext_ipython_kernel_spec)
    except jupyter_client.kernelspec.NoSuchKernel:
        try:
            subprocess.run([bin_path, '-m', 'ipykernel', 'install', '--user', '--name',
                            cnext_ipython_kernel_spec, '--display-name', cnext_ipython_kernel_spec])
            log.info("Create the default cnext kernel spec %s" %
                        cnext_ipython_kernel_spec)
        except:
            cnext_ipython_kernel_spec = "python"
            log.info(
                "Failed to get the default cnext kernel spec in the current env. Try with kernel spec name \"python\"")
            try:
                jupyter_client.kernelspec.get_kernel_spec(
                    cnext_ipython_kernel_spec)
            except jupyter_client.kernelspec.NoSuchKernel:
                cnext_ipython_kernel_spec = None
                log.info("Kernel spec name \"python\" does not exist")

    return cnext_ipython_kernel_spec


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    def handle_message(self, message):
        try:
            if message.command_name == EnvironmentManagerCommand.list:
                conda_environments_file = os.path.join(
                    Path.home(), '.conda', 'environments.txt')
                environments = {
                    'conda': [],
                    'ipython': jupyter_client.kernelspec.find_kernel_specs(),
                }

                if os.path.exists(conda_environments_file):
                    with open(conda_environments_file, 'r') as f:
                        environments['conda'] = f.read().splitlines()

                message.type = ContentType.ENVIRONMENT_LIST
                message.content = environments
                message.error = False
                self._send_to_node(message)

            elif message.command_name == EnvironmentManagerCommand.start:
                message_content = message.content
                kernel_spec_name = None

                # if the kernel spec is not specified
                if message_content['kernel_spec'] is None:
                    conda_env_name = message_content['conda_environment']
                    proc = subprocess.run(
                        ['conda', 'run', '-n', conda_env_name, 'which', 'python'],
                        check=True,
                        capture_output=True
                    )
                    message.type = ContentType.KERNEL_START_RESULT

                    if proc.returncode != 0:
                        err_message = proc.stderr.decode()
                        message.error = True

                        if "EnvironmentLocationNotFound" in err_message:
                            message.content = 'Environment not found'
                        else:
                            message.content = err_message

                        self._send_to_node(message)
                        return

                    result = proc.stdout.decode()
                    bin_path = result.strip()
                    bin_path_hash = hashlib.md5(bin_path.encode()).hexdigest()
                    kernel_spec_name = 'cnext-' + bin_path_hash

                    try:
                        jupyter_client.kernelspec.get_kernel_spec(
                            kernel_spec_name)
                    except jupyter_client.kernelspec.NoSuchKernel:
                        proc = subprocess.run(
                            ['conda', 'install', '-n', conda_env_name,
                                '-y', '-c', 'anaconda', 'ipykernel'],
                            check=True,
                            capture_output=True
                        )

                        if proc.returncode != 0:
                            message.error = True
                            message.content = 'Failed to install ipykernel: ' + proc.stderr.decode()
                            self._send_to_node(message)
                            return

                        proc = subprocess.run(
                            ['conda', 'run', '-n', conda_env_name, 'python', '-m', 'ipykernel', 'install',
                                '--user', '--name', kernel_spec_name, '--display-name', kernel_spec_name],
                            check=True,
                            capture_output=True
                        )

                        if proc.returncode != 0:
                            message.error = True
                            message.content = 'Failed to create kernel spec: ' + proc.stderr.decode()
                            self._send_to_node(message)
                            return
                else:
                    kernel_spec_name = message_content['kernel_spec']

                result = self.user_space.start_executor(kernel_spec_name)
                message.content = {
                    'kernel_spec': kernel_spec_name,
                    'conda_environment': message_content['conda_environment'],
                    'result': result,
                }
                message.error = False
                self._send_to_node(message)

        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))
            error_message = BaseMessageHandler._create_error_message(
                message.webapp_endpoint, trace, message.command_name, {})
            self._send_to_node(error_message)
