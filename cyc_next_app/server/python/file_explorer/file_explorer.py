import os
import traceback

from libs.message_handler import BaseMessageHandler
from libs.message import ContentType

from libs import logs
from libs.message import ProjectCommand
from project_manager import files, projects

log = logs.get_logger(__name__)


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    def handle_message(self, message):
        log.info('Handle FileExplorer message: %s' % message)
        try:
            metadata = message.metadata
            if 'path' in metadata.keys():
                ## avoid creating `./` when the path is empty
                if metadata['path']=="":
                    norm_path = metadata['path']
                else:
                    norm_path = os.path.normpath(metadata['path'])
            if 'project_path' in metadata.keys():
                norm_project_path = os.path.normpath(metadata['project_path'])

            output = None
            if message.command_name == ProjectCommand.list_dir:
                output = []
                if 'path' in metadata.keys() and 'project_path' in metadata.keys():
                    output = files.list_dir(norm_project_path, norm_path)
                    type = ContentType.DIR_LIST
            elif message.command_name == ProjectCommand.create_file:
                if 'path' in metadata.keys() and 'project_path' in metadata.keys():
                    files.create_file(norm_project_path, norm_path)
                output = projects.open_file(metadata['path'])
                type = ContentType.FILE_METADATA
            elif message.command_name == ProjectCommand.delete:
                if 'path' in metadata.keys() and 'project_path' in metadata.keys():
                    files.delete(norm_project_path, norm_path)

                    # Delete state file
                    state_file_path = files.get_state_path(
                        norm_project_path, norm_path)
                    if os.path.exists(state_file_path):
                        files.delete(norm_project_path, state_file_path)
                if ('is_file' in metadata) and metadata['is_file']:
                    output = projects.close_file(metadata['path'])
                else:  # TODO: handle the case where a dir is deleted and deleted files were opened
                    output = projects.get_open_files()
                type = ContentType.FILE_METADATA
            # create reply message
            message.type = type
            message.content = output
            message.error = False
            self._send_to_node(message)

        except:
            trace = traceback.format_exc()
            log.error("%s" % (trace))
            error_message = MessageHandler._create_error_message(
                message.webapp_endpoint, trace)
            self._send_to_node(error_message)
