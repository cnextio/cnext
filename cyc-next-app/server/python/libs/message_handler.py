from libs.message import ContentType, Message
from libs import logs
from user_space.user_space import BaseKernel, UserSpace
log = logs.get_logger(__name__)

class BaseMessageHandler:
    def __init__(self, p2n_queue, user_space = None):
        self.p2n_queue = p2n_queue
        if user_space == None:
            self.user_space = UserSpace(BaseKernel())
        else:
            self.user_space = user_space
    
    def _create_error_message(self, webapp_endpoint, trace, metadata=None):
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
        self.p2n_queue.send(message.toJSON())

    def handle_message(self, message, client_globals):
        ''' `ext_globals` is the user namespace where the user executes their command'''
        raise "Abstract function must be implemented by subclass"