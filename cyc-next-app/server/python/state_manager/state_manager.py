import traceback
import simplejson as json
from libs.message_handler import BaseMessageHandler
from libs.message import ContentType, SubContentType, Message, StateManagerCommand

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
            with open(STATE_JSON_PATH, 'w') as outfile:
                json.dump(data_formatted, outfile)
                log.info("Write state: {}".format(STATE_JSON_PATH))

    def handle_message(self, message):
        if message.command_name == StateManagerCommand.load_state:
            self.load_state_data()
        elif message.command_name == StateManagerCommand.save_state:
            self.save_state_data(data=message.content)
