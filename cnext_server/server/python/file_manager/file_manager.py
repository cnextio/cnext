import os
import traceback

from libs.message_handler import BaseMessageHandler
from libs.message import ContentType

from libs import logs
from libs.config import read_config
from libs.message import ProjectCommand
from project_manager import files, projects
from project_manager.interfaces import WorkspaceMetadata
from project_manager.interfaces import FileManagerMessageParams

log = logs.get_logger(__name__)


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space, workspace_info: WorkspaceMetadata):
        super(MessageHandler, self).__init__(p2n_queue, user_space)
        # active_project: projects.ProjectMetadata = None
        # open_projects = workspace_info.open_projects
        # if workspace_info.active_project is not None:
        #     for project in open_projects:
        #         if workspace_info.active_project == project.id:
        #             active_project = project
        # if active_project:
        #     projects.set_active_project(active_project)

    def handle_message(self, message):
        log.info('FileManager handle message: %s %s %s' %
                 (message.command_name, message.type, message.sub_type))
        try:
            messageParams = FileManagerMessageParams(message.metadata)

            result = None
            if message.command_name == ProjectCommand.list_dir:
                result = files.list_dir(
                    messageParams.norm_project_path, messageParams.norm_path)
                type = ContentType.DIR_LIST
            elif message.command_name == ProjectCommand.get_open_files:
                result = projects.get_open_files()
                type = ContentType.FILE_METADATA
            elif message.command_name == ProjectCommand.set_working_dir:
                result = projects.set_working_dir(messageParams.norm_path)
                type = ContentType.NONE
            elif message.command_name == ProjectCommand.set_project_dir:
                result = projects.set_project_dir(messageParams.norm_path)
                type = ContentType.NONE
            elif message.command_name == ProjectCommand.read_file:
                result = files.read_file(messageParams.norm_project_path, messageParams.norm_path,
                                         messageParams.timestamp)
                if result == None:
                    type = ContentType.NONE
                else:
                    type = ContentType.FILE_CONTENT
            elif message.command_name == ProjectCommand.save_file:
                result = files.save_file(
                    messageParams.norm_project_path, messageParams.norm_path, content=message.content)
                type = ContentType.FILE_METADATA
            elif message.command_name == ProjectCommand.close_file:
                result = projects.close_file(
                    messageParams.norm_path, messageParams.open_order)
                type = ContentType.FILE_METADATA
            elif message.command_name == ProjectCommand.open_file:
                result = projects.open_file(
                    messageParams.norm_path, messageParams.open_order)
                type = ContentType.FILE_METADATA
            # elif message.command_name == ProjectCommand.get_active_project:
            #     result = projects.get_active_project()
            #     type = ContentType.PROJECT_METADATA
            elif message.command_name == ProjectCommand.save_state:
                result = files.save_state(
                    messageParams.norm_project_path, messageParams.norm_path, content=message.content)
                type = ContentType.FILE_METADATA
            elif message.command_name == ProjectCommand.save_project_settings:
                result = projects.save_project_settings(
                    content=message.content)
                type = ContentType.PROJECT_METADATA
            elif message.command_name == ProjectCommand.get_project_settings:
                result = projects.get_project_settings()
                type = ContentType.PROJECT_METADATA
            elif message.command_name == ProjectCommand.get_workspace_metadata:
                result = projects.get_workspace_metadata()
                type = ContentType.WORKSPACE_METADATA
            elif message.command_name == ProjectCommand.set_workspace_metadata:
                result = projects.save_workspace_metadata(message.content)
                type = ContentType.WORKSPACE_METADATA
            elif message.command_name == ProjectCommand.set_active_project:
                result = projects.set_active_project(message.content)
                type = ContentType.WORKSPACE_METADATA
            elif message.command_name == ProjectCommand.add_project:
                result = projects.add_project(message.content)
                type = ContentType.WORKSPACE_METADATA

            # create reply message
            message.type = type
            message.content = result
            message.error = False
            self._send_to_node(message)

        except:
            trace = traceback.format_exc()
            log.error("%s" % (trace))
            error_message = MessageHandler._create_error_message(
                message.webapp_endpoint, trace, command_name=message.command_name)
            self._send_to_node(error_message)
