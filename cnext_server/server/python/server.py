import sys
import traceback
import threading
import signal
import traceback
import sentry_sdk
from libs import logs
import logging
import pandas as pd
from libs import logs
import simplejson as json
from libs.config import read_config
from code_editor import code_editor as ce
from executor_manager import executor_manager as execm
from dataframe_manager import dataframe_manager as dm
from experiment_manager import experiment_manager as em
from model_manager import model_manager as mm
from cassist import cassist as ca
from file_explorer import file_explorer as fe
from file_manager import file_manager as fm
from logs_manager import logs_manager as lm
from jupyter_server_manager import jupyter_server_manager as jsm
from libs.zmq_message import MessageQueuePush, MessageQueuePull
from libs.message import Message, WebappEndpoint, ExecutorManagerCommand, ExecutorType
from libs.message_handler import BaseMessageHandler
from libs.constants import TrackingModelType, TrackingDataframeType
from project_manager.interfaces import SERVER_CONFIG_PATH, WORKSPACE_METADATA_PATH, WorkspaceMetadata
from user_space.user_space import IPythonUserSpace, BaseKernelUserSpace
import cnextlib.dataframe as cd


log = logs.get_logger(__name__)


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


def get_active_project_path(workspace_info: WorkspaceMetadata):
    project_path = None
    if workspace_info.active_project is not None:
        for project in workspace_info.open_projects:
            if workspace_info.active_project == project.id:
                project_path = project.path
    return project_path


def set_executor_working_dir(user_space, workspace_info: WorkspaceMetadata):
    project_path = get_active_project_path(workspace_info)
    log.info('Project path: {}'.format(project_path))
    if project_path:
        user_space.set_executor_working_dir(project_path)

def create_message_handlers_for_user_space(user_space, p2n_queue):
    message_handler = {
        WebappEndpoint.CodeEditor: ce.MessageHandler(p2n_queue, user_space),
        WebappEndpoint.DFManager: dm.MessageHandler(p2n_queue, user_space),
        WebappEndpoint.ModelManager: mm.MessageHandler(p2n_queue, user_space),
        WebappEndpoint.MagicCommandGen: ca.MessageHandler(p2n_queue, user_space)
    }
    return message_handler

def main(argv):
    try:
        if argv and len(argv) > 0:
            server_config = read_config(SERVER_CONFIG_PATH)
            # workspace_metadata = read_config(WORKSPACE_METADATA_PATH)
            workspace_metadata = WorkspaceMetadata(
                read_config(WORKSPACE_METADATA_PATH).__dict__)

            executor_type = argv[0]
            user_space = None
            message_handler = None
            p2n_queue = MessageQueuePush(
                server_config.p2n_comm['host'], server_config.p2n_comm['port'])
            jupyter_server_config = server_config.jupyter_server

            try:
                if executor_type == ExecutorType.NONCODE:
                    user_space = BaseKernelUserSpace()
                    message_handler = {
                        WebappEndpoint.ExperimentManager: em.MessageHandler(p2n_queue, user_space),
                        WebappEndpoint.FileManager: fm.MessageHandler(p2n_queue, user_space, workspace_metadata),
                        WebappEndpoint.FileExplorer: fe.MessageHandler(
                            p2n_queue, user_space),
                        WebappEndpoint.Terminal: jsm.MessageHandler(p2n_queue, user_space, workspace_metadata, jupyter_server_config),
                        WebappEndpoint.LogsManager: lm.MessageHandler(p2n_queue, user_space),
                    }

            except Exception as error:
                log.error("%s - %s" % (error, traceback.format_exc()))
                exit(0)

            shutdowHandler = ShutdownSignalHandler(message_handler, user_space)
            print('Server started')
            # this condition here is meaningless for now because the process will be exit inside ShutdownSignalHandler.exit_gracefully 

            default_user_space = IPythonUserSpace(
                                (TrackingDataframeType.PANDAS, TrackingDataframeType.CNEXT, TrackingDataframeType.DASK), 
                                (TrackingModelType.PYTORCH_NN, TrackingModelType.TENSORFLOW_KERAS))
            user_sapce_message_handlers = {
                'default': create_message_handlers_for_user_space(default_user_space, p2n_queue),
            }

            try:
                # while shutdowHandler.running:
                for line in sys.stdin:
                    try:
                        # log.info('Got message %s' % line)
                        message = Message(**json.loads(line))
                        log_content = ""
                        if isinstance(message.content, str):
                            if len(message.content) > 50:
                                log_content = message.content[:50]
                            else:
                                log_content = message.content
                        log.info('Got message from %s command: "%s", content: \'%s\'' %
                                 (message.webapp_endpoint, message.command_name, log_content))

                        if message.webapp_endpoint == WebappEndpoint.AddRemoteIPythonKernel:
                            user_space_name = message.content.name
                            connection_info = message.content.connection_info
                            user_space = IPythonUserSpace(
                                (TrackingDataframeType.PANDAS, TrackingDataframeType.CNEXT, TrackingDataframeType.DASK), 
                                (TrackingModelType.PYTORCH_NN, TrackingModelType.TENSORFLOW_KERAS),
                                connection_info)
                            user_sapce_message_handlers[user_space_name] = create_message_handlers_for_user_space(user_space, p2n_queue)
                            set_executor_working_dir(user_space, workspace_metadata)

                        elif message.webapp_endpoint == WebappEndpoint.SelectIPythonKernel:
                            user_space_name = message.content.name
                            if not user_space_name in user_sapce_message_handlers:
                                raise Exception('User space {} not found'.format(user_space_name))

                            message_handler = user_sapce_message_handlers[user_space_name]

                        else:
                            message_handler[message.webapp_endpoint].handle_message(message)

                    except OSError as error:  # TODO check if this has to do with buffer error
                        # since this error might be related to the pipe, we do not send this error to nodejs
                        log.error("OSError: %s" % (error))

                    except:
                        log.error("Failed to execute the command %s",
                                  traceback.format_exc())
                        message = BaseMessageHandler._create_error_message(
                            message.webapp_endpoint, traceback.format_exc(), message.command_name)
                        # send_to_node(message)
                        BaseMessageHandler.send_message(
                            p2n_queue, message.toJSON())

                    try:
                        sys.stdout.flush()
                    except Exception as error:
                        log.error("Failed to flush stdout %s - %s" %
                                  (error, traceback.format_exc()))
            except Exception as error:
                log.error("Exception %s - %s" %
                          (error, traceback.format_exc()))
                ## make sure all the message handler shut down properly #
                shutdowHandler.exit_gracefully()
                exit(0)

    except Exception as error:
        log.error("Failed to flush stdout %s - %s" %
                  (error, traceback.format_exc()))
        exit(0)


if __name__ == "__main__":

    # Initialize sentry
    # sentry_sdk.init(
    #     "https://318e8d1b2b0b43fbbbd38ea0426378b4@o1259763.ingest.sentry.io/6435268",

    #     # Set traces_sample_rate to 1.0 to capture 100%
    #     # of transactions for performance monitoring.
    #     # We recommend adjusting this value in production.
    #     traces_sample_rate=0.1
    # )

    main(sys.argv[1:])
