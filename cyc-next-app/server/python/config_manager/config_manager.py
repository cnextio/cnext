import os
import traceback
import simplejson as json
from libs.message_handler import BaseMessageHandler
from libs import logs
from libs.config import read_config
from libs.message import ConfigManagerCommand
from project_manager.interfaces import FileMetadata
from libs.message import ContentType
log = logs.get_logger(__name__)

FILE_CONFIG = 'config.json'


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space, config):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    @staticmethod
    def save_config(project_path, content):
        try:
            config_file_path = os.path.join(project_path, FILE_CONFIG)
            os.makedirs(os.path.dirname(config_file_path), exist_ok=True)
            with open(config_file_path, 'w') as outfile:
                outfile.write(json.dumps(content))
            return FileMetadata(config_file_path, name=FILE_CONFIG, timestamp=os.path.getmtime(config_file_path))
        except Exception as ex:
            log.error("Save config error: {}".format(ex))
            raise Exception

    @staticmethod
    def load_config(project_path):
        config_file_path = os.path.join(project_path, FILE_CONFIG)
        if os.path.exists(config_file_path):
            config_file_data = open(config_file_path, "r")
            data = json.loads(config_file_data.read())
            return data
        return

    def handle_message(self, message):
        log.info('ConfigManager handle message: %s %s %s' %
                 (message.command_name, message.type, message.sub_type))
        try:
            metadata = message.metadata
            result = None
            if message.command_name == ConfigManagerCommand.save_config:
                result = self.save_config(
                    project_path=metadata['projectPath'],
                    content=message.content)
                type = ContentType.FILE_METADATA
            elif message.command_name == ConfigManagerCommand.load_config:
                result = self.load_config(metadata['projectPath'])

            # create reply message
            message.type = type
            message.content = result
            message.error = False
            self._send_to_node(message)
        except:
            trace = traceback.format_exc()
            log.error("Exception %s" % (trace))
            error_message = self._create_error_message(
                message.webapp_endpoint, trace, message.metadata)
            self._send_to_node(error_message)
