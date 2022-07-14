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
        # log.info('p2n_queue' + p2n_queue)
        super(MessageHandler, self).__init__(p2n_queue, user_space)
        # os.system('jupyter server --port=5008 --ServerApp.allow_origin=* --ServerApp.token=token123')

        # active_project: projects.ProjectMetadata = None
        # open_projects = workspace_info.open_projects
        # if workspace_info.active_project is not None:
        #     for project in open_projects:
        #         if workspace_info.active_project == project.id:
        #             active_project = project
        # if active_project:
        #     projects.set_active_project(active_project)
