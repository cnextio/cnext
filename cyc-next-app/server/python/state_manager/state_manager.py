import traceback
import simplejson as json
from libs.message_handler import BaseMessageHandler
from libs.message import SubContentType, StateManagerCommand, StateManagerContentType

from libs import logs
log = logs.get_logger(__name__)

STATE_JSON_PATH = 'state_data.json'


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    def load_state_data(self):
        with open(STATE_JSON_PATH) as json_file:
            data = json.load(json_file)
            return data

    def save_state_data(self, data):
        data_formatted = json.dumps(data) if type(data) is dict else data
        if data_formatted is not None:
            # files.save_file(STATE_JSON_PATH, data_formatted)
            with open(STATE_JSON_PATH, 'w') as outfile:
                json.dump(data_formatted, outfile)
                log.info("Write state: {}".format(STATE_JSON_PATH))

    def handle_message(self, message):
        if message.command_name == StateManagerCommand.execute_load_state:
            state_data = self.load_state_data()
            message.type = StateManagerContentType.reply_load_state
            message.sub_type = SubContentType.NONE
            message.content = state_data
            message.error = False
            self._send_to_node(message)
        elif message.command_name == StateManagerCommand.execute_save_state:
            self.save_state_data(data=message.content)
