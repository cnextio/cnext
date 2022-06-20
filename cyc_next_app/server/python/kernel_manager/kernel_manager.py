import threading
import traceback
import simplejson as json

from libs.message_handler import BaseMessageHandler
from libs.message import Message

from libs import logs
from libs.message import WebappEndpoint
from libs.config import read_config
from libs.zmq_message import MessageQueuePull
from project_manager.interfaces import SERVER_CONFIG_PATH
from libs.message import KernelManagerCommand
from project_manager.interfaces import WORKSPACE_METADATA_PATH, WorkspaceMetadata
from server import set_executor_working_dir
log = logs.get_logger(__name__)


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)
        kernel_manager_thread = threading.Thread(
            target=self.handle_message, args=(user_space,), daemon=True)
        kernel_manager_thread.start()

    def handle_message(self, message):
        log.info("Kernel control thread started")
        ## reading config here to get the most updated version #
        server_config = read_config(SERVER_CONFIG_PATH)
        n2p_queue = MessageQueuePull(
            server_config.n2p_comm['host'], server_config.n2p_comm['kernel_control_port'])
        try:
            while True:
                strMessage = n2p_queue.receive_msg()
                message = Message(**json.loads(strMessage))
                log.info("Received control message: %s" % message)
                if message.command_name == KernelManagerCommand.restart_kernel:
                    result = self.user_space.restart_executor()
                    if result:
                        # get the lastest config to make sure that it is updated with the lastest open project
                        workspace_info = read_config(WORKSPACE_METADATA_PATH)
                        workspace_metadata = WorkspaceMetadata(
                            workspace_info.__dict__)
                        set_executor_working_dir(self.user_space, workspace_metadata)
                elif message.command_name == KernelManagerCommand.interrupt_kernel:
                    result = self.user_space.interrupt_executor()

                message = Message(**{'webapp_endpoint': WebappEndpoint.KernelManager,
                                     'command_name': message.command_name,
                                     'content': {'success': result}})
                self._send_to_node(message)
        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))
            error_message = BaseMessageHandler._create_error_message(
                message.webapp_endpoint, trace, message.command_name, {})
            self._send_to_node(error_message)
