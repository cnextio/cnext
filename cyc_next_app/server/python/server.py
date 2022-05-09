import sys
import traceback
import threading
import signal
import traceback
from libs import logs
import pandas as pd
from libs import logs
import simplejson as json
from libs.config import read_config
from code_editor import code_editor as ce
from dataframe_manager import dataframe_manager as dm
from experiment_manager import experiment_manager as em
from model_manager import model_manager as mm
from cassist import cassist as ca
from file_explorer import file_explorer as fe
from file_manager import file_manager as fm
from libs.zmq_message import MessageQueuePush, MessageQueuePull
from libs.message import Message, WebappEndpoint, KernelManagerCommand, ExecutorType
from libs.message_handler import BaseMessageHandler
from user_space.user_space import IPythonUserSpace, BaseKernelUserSpace
import cnextlib.dataframe as cd


log = logs.get_logger(__name__)

config = read_config('.server.yaml', {
    'p2n_comm': {'host': '127.0.0.1', 'port': 5001},
    'n2p_comm': {'host': '127.0.0.1', 'kernel_control_port': 5005, }})


def kernel_control_handler(user_space):
    log.info("Kernel control thread started")
    try:
        n2p_queue = MessageQueuePull(
            config.n2p_comm['host'], config.n2p_comm['kernel_control_port'])
        while True:
            strMessage = n2p_queue.receive_msg()
            message = Message(**json.loads(strMessage))
            log.info("Received control message: %s" % message)
            if message.command_name == KernelManagerCommand.restart_kernel:
                result = user_space.restart_executor()
            elif message.command_name == KernelManagerCommand.interrupt_kernel:
                result = user_space.interrupt_executor()
    except:
        trace = traceback.format_exc()
        log.info("Exception %s" % (trace))
        exit(1)


class ShutdownSignalHandler:
    running = True

    def __init__(self, message_handler, user_space):
        signal.signal(signal.SIGINT, self.exit_gracefully)
        signal.signal(signal.SIGTERM, self.exit_gracefully)
        self.user_space = user_space
        self.message_handler = message_handler

    def get_running_status(self):
        return self.running

    def exit_gracefully(self, *args):
        log.info('ShutdownSignalHandler {}'.format(args))

        if self.message_handler != None:
            for key, value in self.message_handler.items():
                log.info('Shutdown {}'.format(key))
                value.shutdown()
                # value.user_space.executor.interupt_kernel()

        self.running = False
        # currently we exit right here. In the future, consider option to stop message handler gracefully.
        sys.exit(0)


def main(argv):
    if argv and len(argv) > 0:
        executor_type = argv[0]
        user_space = None
        message_handler = None
        try:
            p2n_queue = MessageQueuePush(
                config.p2n_comm['host'], config.p2n_comm['port'])
            if executor_type == ExecutorType.CODE:
                user_space = IPythonUserSpace(
                    (cd.DataFrame, pd.DataFrame), ("torch.nn.Module", "tensorflow.keras.Model"))

                # Start kernel control thread
                kernel_control_thread = threading.Thread(
                    target=kernel_control_handler, args=(user_space,), daemon=True)
                kernel_control_thread.start()

                message_handler = {
                    WebappEndpoint.CodeEditor: ce.MessageHandler(p2n_queue, user_space),
                    WebappEndpoint.DFManager: dm.MessageHandler(p2n_queue, user_space),
                    WebappEndpoint.ModelManager: mm.MessageHandler(p2n_queue, user_space),
                    WebappEndpoint.MagicCommandGen: ca.MessageHandler(
                        p2n_queue, user_space)
                }
            elif executor_type == ExecutorType.NONCODE:
                user_space = BaseKernelUserSpace()
                message_handler = {
                    WebappEndpoint.ExperimentManager: em.MessageHandler(p2n_queue, user_space),
                    WebappEndpoint.FileManager: fm.MessageHandler(p2n_queue, user_space, config),
                    WebappEndpoint.FileExplorer: fe.MessageHandler(
                        p2n_queue, user_space)
                }

        except Exception as error:
            log.error("%s - %s" % (error, traceback.format_exc()))
            exit(1)

        shutdowHandler = ShutdownSignalHandler(message_handler, user_space)
        # this condition here is meaningless for now because the process will be exit inside ShutdownSignalHandler.exit_gracefully already
        while shutdowHandler.running:
            for line in sys.stdin:
                try:
                    # log.info('Got message %s' % line)
                    message = Message(**json.loads(line))
                    log.info('Got message from %s command %s' %
                             (message.webapp_endpoint, message.command_name))
                    if message.webapp_endpoint == WebappEndpoint.KernelManager:
                        if message.command_name == KernelManagerCommand.interrupt_kernel:
                            shutdowHandler.exit_gracefully()
                    else:
                        message_handler[message.webapp_endpoint].handle_message(
                            message)
                except OSError as error:  # TODO check if this has to do with buffer error
                    # since this error might be related to the pipe, we do not send this error to nodejs
                    log.error("OSError: %s" % (error))

                except:
                    log.error("Failed to execute the command %s",
                              traceback.format_exc())
                    message = BaseMessageHandler._create_error_message(
                        message.webapp_endpoint, traceback.format_exc())
                    # send_to_node(message)
                    BaseMessageHandler.send_message(
                        p2n_queue, message.toJSON())

                try:
                    sys.stdout.flush()
                except Exception as error:
                    log.error("Failed to flush stdout %s - %s" %
                              (error, traceback.format_exc()))


if __name__ == "__main__":
    main(sys.argv[1:])
