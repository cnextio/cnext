import os
import traceback
import jupyter_client
from pathlib import Path
from libs.message_handler import BaseMessageHandler
from libs.message import ContentType, EnvironmentManager
from libs import logs

log = logs.get_logger(__name__)

class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    def handle_message(self, message):
        try:
            if message.command_name == EnvironmentManager.list:
                conda_environments_file = os.path.join(Path.home(), '.conda', 'environments.txt')
                environments = {
                    'conda': [],
                    'ipython': jupyter_client.kernelspec.find_kernel_specs(),
                }

                if os.path.exists(conda_environments_file):
                    with open(conda_environments_file, 'r') as f:
                        environments['conda'] = f.read().splitlines()

                message.type = ContentType.ENV_LIST
                message.content = environments
                message.error = False
                self._send_to_node(message)

            elif message.command_name == EnvironmentManager.start:
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
