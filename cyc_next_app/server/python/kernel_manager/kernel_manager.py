import traceback
from libs.message_handler import BaseMessageHandler
from libs.message import ContentType
from libs import logs
from libs.message import KernelManagerCommand
from user_space.ipython.kernel import IPythonKernel


log = logs.get_logger(__name__)


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    def handle_message(self, message):
        log.info('FileManager handle message: %s %s %s' %
                 (message.command_name, message.type, message.sub_type))
        try:
            ipython_kernel = IPythonKernel.get_instance()
            if message.command_name == KernelManagerCommand.restart_kernel:
                ipython_kernel.restart_kernel()
            elif message.command_name == KernelManagerCommand.interrupt_kernel:
                ipython_kernel.interrupt_kernel()

            # create reply message
            message.type = type
            message.content = ""
            message.error = False
            self._send_to_node(message)

        except:
            trace = traceback.format_exc()
            log.error("%s" % (trace))
            error_message = MessageHandler._create_error_message(
                message.webapp_endpoint, trace)
            self._send_to_node(error_message)
