import os
import traceback

from libs.message_handler import BaseMessageHandler
from libs.message import ContentType

from libs import logs
from libs.message import ProjectCommand
from project_manager import files, projects
from project_manager.interfaces import FileManagerMessageParams

log = logs.get_logger(__name__)


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    def handle_message(self, message):
        log.info('Handle FileExplorer message: %s' % message)
        try:
            messageParams = FileManagerMessageParams(message.metadata)
            output = None
            type = None
            if message.command_name == ProjectCommand.list_dir:
                output = files.list_dir(
                    messageParams.norm_project_path, messageParams.norm_path)
                type = ContentType.DIR_LIST
            elif message.command_name == ProjectCommand.create_file:
                files.create_file(
                    messageParams.norm_project_path, messageParams.norm_path)
                output = projects.open_file(
                    messageParams.path, messageParams.open_order)
                type = ContentType.FILE_METADATA
            elif message.command_name == ProjectCommand.create_folder:
                file_metadata = files.create_folder(
                    messageParams.norm_project_path, messageParams.norm_path)
                if file_metadata != None:
                    output = file_metadata.path
                    type = ContentType.FILE_METADATA
            elif message.command_name == ProjectCommand.delete:
                file_metadata = files.delete(messageParams.norm_project_path,
                                messageParams.norm_path)

                # Delete state file
                state_file_path = files.get_state_path(
                    messageParams.norm_project_path, messageParams.norm_path)
                if os.path.exists(state_file_path):
                    files.delete(messageParams.norm_project_path,
                                 state_file_path)

                if messageParams.is_file:
                    output = projects.close_file(
                        messageParams.path, messageParams.open_order)
                else:  # TODO: handle the case where a dir is deleted and deleted files were opened
                    output = projects.get_open_files()
                type = ContentType.FILE_METADATA
            elif message.command_name == ProjectCommand.list_projects:
                output = projects.list_projects()
                type = ContentType.PROJECT_LIST

            # create reply message
            message.type = type
            message.content = output
            message.error = False
            self._send_to_node(message)

        except:
            trace = traceback.format_exc()
            log.error("%s" % (trace))
            error_message = MessageHandler._create_error_message(
                message.webapp_endpoint, trace, message.command_name)
            self._send_to_node(error_message)
