import os
import traceback

from pathlib import Path
from libs.message_handler import BaseMessageHandler
from libs.message import ContentType, EnvManagerCommand
from libs import logs

log = logs.get_logger(__name__)

class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    def handle_message(self, message):
        try:
            if message.command_name == EnvManagerCommand.list:
                conda_enviroments_file = os.path.join(Path.home(), '.conda', 'environments.txt')
                enviroments = {
                    'conda': [],
                }

                if os.path.exists(conda_enviroments_file):
                    with open(conda_enviroments_file, 'r') as f:
                        enviroments['conda'] = f.read().splitlines()

                message.type = ContentType.ENV_LIST
                message.content = enviroments
                message.error = False
                self._send_to_node(message)

        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))
            error_message = BaseMessageHandler._create_error_message(
                message.webapp_endpoint, trace, message.command_name, {})
            self._send_to_node(error_message)
