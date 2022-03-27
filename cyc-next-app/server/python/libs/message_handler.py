import simplejson as json
from libs.message import ContentType, Message
from libs import logs
from user_space.user_space import BaseKernel, UserSpace
from user_space.ipython.constants import IPythonKernelConstants as IPythonConstants

log = logs.get_logger(__name__)

class BaseMessageHandler:
    def __init__(self, p2n_queue, user_space = None):
        self.p2n_queue = p2n_queue
        if user_space == None:
            self.user_space = UserSpace(BaseKernel())
        else:
            self.user_space = user_space
    
    @staticmethod
    def get_execute_result(messages):
        """
            Get result from list of messages are responsed by IPython kernel
            For result type rather than 'application/json' we have to convert the output
            to the original object before sending to client because we already json.dumps
            them inside ipython. A better way to handle this is to output 'application/json' 
            instead. That will be done later.
        """
        result = None
        for message in messages:
            if message['header']['msg_type'] == IPythonConstants.MessageType.EXECUTE_RESULT:
                if message['content']['data']['text/plain'] is not None:
                    result = message['content']['data']['text/plain']
                    result = json.loads(result)
            elif message['header']['msg_type'] == IPythonConstants.MessageType.STREAM:
                if 'text' in message['content']:
                    result = message['content']['text']
                    result = json.loads(result)
            elif message['header']['msg_type'] == IPythonConstants.MessageType.DISPLAY_DATA:
                if 'application/json' in message['content']['data']:
                    result = message['content']['data']['application/json']
        return result

    @staticmethod
    def _create_error_message(webapp_endpoint, trace, metadata=None):
        return Message(**{
            "webapp_endpoint": webapp_endpoint, 
            "type": ContentType.STRING,
            "content": trace,
            "error": True,
            "metadata": metadata,
        })

    def _send_to_node(self, message: Message):
        # the current way of communicate with node server is through stdout with a json string
        log.info("Send to node server: %s %s %s" % (message.command_name, message.type, message.sub_type))
        BaseMessageHandler.send_message(self.p2n_queue, message)

    @staticmethod
    def send_message(channel, message: Message):
        channel.send(message.toJSON())

    def handle_message(self, message):
        ''' `ext_globals` is the user namespace where the user executes their command'''
        raise "Abstract function must be implemented by subclass"
