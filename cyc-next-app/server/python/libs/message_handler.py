from libs.message import ContentType, Message
from libs import logs
from user_space.user_space import BaseKernel, _UserSpace
log = logs.get_logger(__name__)

class BaseMessageHandler:
    def __init__(self, p2n_queue, user_space = None):
        self.p2n_queue = p2n_queue
        if user_space == None:
            self.user_space = _UserSpace(BaseKernel())
        else:
            self.user_space = user_space
    
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
        # log.info("Send to node server: %s" % message)
        # log.info("Send output to node server... %s"%message.toJSON())
        log.info("Send output to node server %s", message)
        # self.p2n_queue.send(message.toJSON())
        BaseMessageHandler.send_message(self.p2n_queue, message)

    @staticmethod
    def send_message(channel, message: Message):
        channel.send(message.toJSON())

    def handle_message(self, message):
        ''' `ext_globals` is the user namespace where the user executes their command'''
        raise "Abstract function must be implemented by subclass"