from message import ContentType, Message
import logs
log = logs.get_logger(__name__)

class BaseMessageHandler:
    def __init__(self, p2n_queue):
        self.p2n_queue = p2n_queue
        pass
    
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
        log.info("Send output to node server...")
        self.p2n_queue.send(message.toJSON())

    def handle_message(self, message, client_globals):
        ''' `ext_globals` is the user namespace where the user executes their command'''
        raise "Abstract function must be implemented by subclass"