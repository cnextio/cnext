import sys
import zmq
import traceback
import threading
import pandas as pd
from libs import logs
import simplejson as json
from code_editor import code_editor as ce
from dataframe_manager import dataframe_manager as dm
from experiment_manager import experiment_manager as em
from cassist import cassist as ca
from file_explorer import file_explorer as fe
from file_manager import file_manager as fm
from kernel_manager import kernel_manager as km
from libs.message import Message, WebappEndpoint
from libs.zmq_message import MessageQueuePush, MessageQueuePull
import cycdataframe.cycdataframe as cd
from libs.config import read_config
from libs.message_handler import BaseMessageHandler
from libs.message import ExecutorType
from user_space.user_space import BaseKernel, UserSpace
from user_space.ipython.kernel import IPythonKernel

log = logs.get_logger(__name__)

config = read_config('.server.yaml', {'code_executor_comm': {
    'host': '127.0.0.1', 'n2p_port': 5001, 'p2n_port': 5002}})


def control_kernel():
    n2p_queue = MessageQueuePull()
    user_space = UserSpace(IPythonKernel.get_instance(),
                           [cd.DataFrame, pd.DataFrame])
    message_recv = n2p_queue.receive_msg()
    print("Message recv", message_recv)
    if message_recv:
        p2n_queue = (
            config.p2n_comm['host'], config.p2n_comm['p2n_port'])
        message = Message(**json.loads(message_recv))
        log.info('Got message from %s command %s' %
                 (message.webapp_endpoint, message.command_name))
        km.MessageHandler(
            p2n_queue, user_space).handle_message(message)
        # log.error("Failed to execute the control message %s",
        #           traceback.format_exc())
        # message = BaseMessageHandler._create_error_message(
        #     message.webapp_endpoint, traceback.format_exc())
        # BaseMessageHandler.send_message(
        #     p2n_queue, message.toJSON())
        # finally:
        #     n2p_queue.close()
        #     n2p_queue.context.term()


def main(argv):
    if argv and len(argv) > 0:
        executor_type = argv[0]
        try:

            # Start control kernel thread

            p2n_queue = MessageQueuePush()

            if executor_type == ExecutorType.CODE:
                user_space = UserSpace(
                    IPythonKernel(), [cd.DataFrame, pd.DataFrame])
                message_handler = {
                    WebappEndpoint.CodeEditor: ce.MessageHandler(p2n_queue, user_space),
                    WebappEndpoint.DFManager: dm.MessageHandler(p2n_queue, user_space),
                    WebappEndpoint.MagicCommandGen: ca.MessageHandler(p2n_queue, user_space)}
            elif executor_type == ExecutorType.NONCODE:
                noncode_user_space = UserSpace(
                    BaseKernel(), [cd.DataFrame, pd.DataFrame])
                message_handler = {
                    WebappEndpoint.ExperimentManager: em.MessageHandler(p2n_queue, noncode_user_space),
                    WebappEndpoint.FileManager: fm.MessageHandler(p2n_queue, noncode_user_space, config),
                    WebappEndpoint.FileExplorer: fe.MessageHandler(p2n_queue, noncode_user_space),
                }
        except Exception as error:
            log.error("%s - %s" % (error, traceback.format_exc()))
            exit(1)

        while True:
            for line in sys.stdin:
                try:
                    # log.info('Got message %s' % line)
                    message = Message(**json.loads(line))
                    log.info('Got message from %s command %s' %
                             (message.webapp_endpoint, message.command_name))
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
    # try:
    # context = zmq.Context()
    # host = config.p2n_comm['host']
    # port = config.p2n_comm['n2p_port']
    # addr = '{}:{}'.format(host, port)
    # socket: zmq.Socket = context.socket(zmq.PULL)
    # socket.bind("tcp://*:7005")
    # control_kernel()
    # except Exception as ex:
    #     print(ex)
    # control_kernel_thread = threading.Thread(
    #     target=control_kernel, daemon=True)
    # control_kernel_thread.start()
    main(sys.argv[1:])
