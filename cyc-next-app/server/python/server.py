from libs import logs
from code_editor import code_editor as ce
from dataframe_manager import dataframe_manager as dm
from experiment_manager import experiment_manager as em
from cassist import cassist as ca
from file_explorer import file_explorer as fe
from file_manager import file_manager as fm
from project_manager import projects

from libs.message import Message, WebappEndpoint, DFManagerCommand, ContentType
from libs.zmq_message import MessageQueue
import traceback
from cycdataframe.df_status_hook import DataFrameStatusHook
from libs.config import read_config
import sys
import simplejson as json

from user_space.user_space import BaseKernel, UserSpace

log = logs.get_logger(__name__)

def create_error_message(webapp_endpoint, trace, metadata=None):
    return Message(**{
        "webapp_endpoint": webapp_endpoint,
        "type": ContentType.STRING,
        "content": trace,
        "error": True,
        "metadata": metadata,
    })


def send_to_node(message: Message):
    # the current way of communicate with node server is through stdout with a json string
    # log.info("Send to node server: %s" % message)
    # log.info("Send output to node server... %s"%message.toJSON())
    log.info("Send output to node server...")
    p2n_queue.send(message.toJSON())

def process_active_df_status(user_space):
    if DataFrameStatusHook.update_active_df_status(user_space.get_global_df_list()):
        active_df_status_message = Message(**{"webapp_endpoint": WebappEndpoint.DFManager,
                                              "command_name": DFManagerCommand.active_df_status,
                                              "seq_number": 1,
                                              "type": "dict",
                                              "content": DataFrameStatusHook.get_active_df(),
                                              "error": False})
        send_to_node(active_df_status_message)


class StdoutHandler:
    def __init__(self):
        self.message = None

    def handler(self):
        while self.message != None:
            # if self.message != None:
            # log.info('Getting message on stdout')
            for output in sys.stdout:
                log.info('Got message on stdout: %s' % output)
                self.message.type = ContentType.STRING
                self.message.content = output
                self.message.error = False
                send_to_node(self.message)

if __name__ == "__main__":
    try:
        config = read_config('.server.yaml', {'code_executor_comm': {
                            'host': '127.0.0.1', 'n2p_port': 5001, 'p2n_port': 5002}})
        log.info('Server config: %s' % config)

        p2n_queue = MessageQueue(
            config.p2n_comm['host'], config.p2n_comm['p2n_port'])
        
        user_space = UserSpace(BaseKernel())
        
        message_handler = {
            WebappEndpoint.CodeEditor: ce.MessageHandler(p2n_queue, user_space).handle_message,
            WebappEndpoint.DFManager: dm.MessageHandler(p2n_queue, user_space).handle_message,
            WebappEndpoint.ExperimentManager: em.MessageHandler(p2n_queue, user_space).handle_message,
            WebappEndpoint.FileManager: fm.MessageHandler(p2n_queue, user_space, config).handle_message,
            WebappEndpoint.MagicCommandGen: ca.MessageHandler(p2n_queue, user_space).handle_message,
            WebappEndpoint.FileExplorer: fe.MessageHandler(p2n_queue, user_space).handle_message,
        }

    except Exception as error:
        log.error("%s - %s" % (error, traceback.format_exc()))
        exit(1)

    while True:
        for line in sys.stdin:
            try:
                log.info('Got message %s' % line)
                message = Message(**json.loads(line))

                message_handler[message.webapp_endpoint](message)
                if message.webapp_endpoint == WebappEndpoint.CodeEditor:
                    process_active_df_status(user_space)

            except OSError as error:  # TODO check if this has to do with buffer error
                # since this error might be related to the pipe, we do not send this error to nodejs
                log.error("OSError: %s" % (error))

            except:
                log.error("Failed to execute the command %s",
                          traceback.format_exc())
                message = create_error_message(
                    message.webapp_endpoint, traceback.format_exc())
                send_to_node(message)

            try:
                sys.stdout.flush()
            except Exception as error:
                log.error("Failed to flush stdout %s - %s" %
                          (error, traceback.format_exc()))
