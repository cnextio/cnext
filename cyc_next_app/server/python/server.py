from libs import logs
import pandas as pd
from code_editor import code_editor_basekernel as ce_base
from code_editor import code_editor as ce
from dataframe_manager import dataframe_manager_basekernel as dm_base
from dataframe_manager import dataframe_manager as dm
from experiment_manager import experiment_manager as em
from cassist import cassist as ca
from file_explorer import file_explorer as fe
from file_manager import file_manager as fm

from libs.message import Message, WebappEndpoint
from libs.zmq_message import MessageQueue
import traceback
import cnext_libs.cycdataframe as cd
from libs.config import read_config
import sys
import simplejson as json
from libs.message_handler import BaseMessageHandler
from libs.message import ExecutorType

from user_space.user_space import BaseKernel, UserSpace
from user_space.ipython.kernel import IPythonKernel

log = logs.get_logger(__name__)


def main(argv):
    if argv and len(argv) > 0:
        executor_type = argv[0]
        try:
            config = read_config('.server.yaml', {'code_executor_comm': {
                'host': '127.0.0.1', 'n2p_port': 5001, 'p2n_port': 5002}})
            log.info('Server config: %s' % config)

            p2n_queue = MessageQueue(
                config.p2n_comm['host'], config.p2n_comm['p2n_port'])

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
                    WebappEndpoint.FileExplorer: fe.MessageHandler(
                        p2n_queue, noncode_user_space)
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
    main(sys.argv[1:])
