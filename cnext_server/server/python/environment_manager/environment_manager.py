import hashlib
import os
import subprocess
import traceback
import jupyter_client
from pathlib import Path
from libs.message_handler import BaseMessageHandler
from libs.message import ContentType, EnvironmentManagerCommand
from libs import logs

log = logs.get_logger(__name__)

class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    def handle_message(self, message):
        try:
            if message.command_name == EnvironmentManagerCommand.list:
                conda_environments_file = os.path.join(Path.home(), '.conda', 'environments.txt')
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

            elif message.command_name == EnvironmentManagerCommand.start_conda:
                conda_env_name = message.content
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
                    jupyter_client.kernelspec.get_kernel_spec(kernel_spec_name)
                except jupyter_client.kernelspec.NoSuchKernel:
                    proc = subprocess.run(
                        ['conda', 'install', '-n', conda_env_name, '-y', '-c', 'anaconda', 'ipykernel'],
                    check=True,
                        capture_output=True
                    )

                    if proc.returncode != 0:
                        message.error = True
                        message.content = 'Failed to install ipykernel: ' + proc.stderr.decode()
                        self._send_to_node(message)
                        return

                    proc = subprocess.run(
                        ['conda', 'run', '-n', conda_env_name, 'python', '-m', 'ipykernel', 'install', '--user', '--name', kernel_spec_name, '--display-name', kernel_spec_name],
                        check=True,
                        capture_output=True
                    )

                    if proc.returncode != 0:
                        message.error = True
                        message.content = 'Failed to create kernel spec: ' + proc.stderr.decode()
                        self._send_to_node(message)
                        return

                message.content = self.user_space.start_executor(kernel_spec_name)
                message.error = False
                self._send_to_node(message)

            elif message.command_name == EnvironmentManagerCommand.start:
                kernel_name = message.content

                message.type = ContentType.KERNEL_START_RESULT
                message.content = self.user_space.start_executor(kernel_name)
                message.error = False
                self._send_to_node(message)

        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))
            error_message = BaseMessageHandler._create_error_message(
                message.webapp_endpoint, trace, message.command_name, {})
            self._send_to_node(error_message)
