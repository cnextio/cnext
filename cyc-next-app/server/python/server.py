from libs import logs
from code_editor import code_editor as ce
from dataframe_manager import dataframe_manager as dm
from experiment_manager import experiment_manager as em
from project_manager import files, projects
from mlflow.tracking.client import MlflowClient
import mlflow.tensorflow
import mlflow
from libs.message import CommandType, ExperimentManagerCommand, Message, WebappEndpoint, DFManagerCommand, ContentType, ProjectCommand, CodeEditorCommand
from libs.zmq_message import MessageQueue
import re
import traceback
from cycdataframe.df_status_hook import DataFrameStatusHook
import cycdataframe.cycdataframe as cd
from libs.config import read_config
import platform
import sys
import logging
import simplejson as json
import io
import os
import pandas
import plotly
import plotly.express as px
import plotly.io as pio

from user_space.user_space import BaseKernel, UserSpace
pio.renderers.default = "json"


log = logs.get_logger(__name__)

try:
    config = read_config('.server.yaml', {'code_executor_comm': {
                         'host': '127.0.0.1', 'n2p_port': 5001, 'p2n_port': 5002}})
    log.info('Server config: %s' % config)
    open_projects = []
    active_project: projects.ProjectMetadata = None
    if hasattr(config, 'projects'):
        if 'open_projects' in config.projects:
            if isinstance(config.projects['open_projects'], list):
                open_projects = config.projects['open_projects']
        if 'active_project' in config.projects:
            for project_config in open_projects:
                if config.projects['active_project'] == project_config['id']:
                    active_project = projects.ProjectMetadata(**project_config)
    if active_project:
        projects.set_active_project(active_project)

except Exception as error:
    log.error("%s - %s" % (error, traceback.format_exc()))
    exit(1)


def assign_exec_mode(message: Message):
    message.execution_mode = 'eval'
    if message.metadata and ('line_range' in message.metadata):
        line_range = message.metadata['line_range']
        # always 'exec' if there are more than 1 line in the code
        if line_range['fromLine'] < line_range['toLine']-1:
            message.execution_mode = 'exec'

    try:
        compile(message.content, '<stdin>', 'eval')
    except SyntaxError as error:
        log.error(error)
        message.execution_mode = 'exec'

    log.info("assigned command type: %s" % message.execution_mode)

# have to do this here. do it in df_status_hook does not work
# def get_global_df_list():
#     names = list(globals())
#     df_list = []
#     for name in names:
#         if type(globals()[name]) == cd.DataFrame:
#             df_list.append((name, id(globals()[name])))
#     log.info('Current global df list: %s' % df_list)
#     return df_list


def _create_get_cardinal_data(result):
    return {'cardinals': result}


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


def handle_FileManager_message(message, client_globals=None):
    log.info('Handle FileManager message: %s' % message)
    try:
        metadata = message.metadata
        result = None
        if message.command_name == ProjectCommand.list_dir:
            result = []
            if 'path' in metadata.keys():
                result = files.list_dir(metadata['path'])
                type = ContentType.DIR_LIST
        elif message.command_name == ProjectCommand.get_open_files:
            result = projects.get_open_files()
            type = ContentType.FILE_METADATA
        elif message.command_name == ProjectCommand.set_working_dir:
            if 'path' in metadata.keys():
                result = projects.set_working_dir(metadata['path'])
            type = ContentType.NONE
        elif message.command_name == ProjectCommand.set_project_dir:
            if 'path' in metadata.keys():
                result = projects.set_project_dir(metadata['path'])
            type = ContentType.NONE
        elif message.command_name == ProjectCommand.read_file:
            if 'path' in metadata.keys():
                timestamp = metadata['timestamp'] if 'timestamp' in metadata else None
                result = files.read_file(metadata['path'], timestamp)
                if result == None:
                    type = ContentType.NONE
                else:
                    type = ContentType.FILE_CONTENT
        elif message.command_name == ProjectCommand.save_file:
            if 'path' in metadata.keys():
                result = files.save_file(metadata['path'], message.content)
            type = ContentType.FILE_METADATA
        elif message.command_name == ProjectCommand.close_file:
            result = projects.close_file(metadata['path'])
            type = ContentType.FILE_METADATA
        elif message.command_name == ProjectCommand.open_file:
            result = projects.open_file(metadata['path'])
            type = ContentType.FILE_METADATA
        elif message.command_name == ProjectCommand.get_active_project:
            result = projects.get_active_project()
            type = ContentType.PROJECT_METADATA

        # create reply message
        message.type = type
        message.content = result
        message.error = False
        send_to_node(message)

    except:
        trace = traceback.format_exc()
        log.error("%s" % (trace))
        error_message = create_error_message(message.webapp_endpoint, trace)
        send_to_node(error_message)


def handle_FileExplorer_message(message, client_globals=None):
    log.info('Handle FileExplorer message: %s' % message)
    try:
        metadata = message.metadata
        output = None
        if message.command_name == ProjectCommand.list_dir:
            output = []
            if 'path' in metadata.keys():
                output = files.list_dir(metadata['path'])
                type = ContentType.DIR_LIST
        elif message.command_name == ProjectCommand.create_file:
            if 'path' in metadata.keys():
                files.create_file(metadata['path'])
            output = projects.open_file(metadata['path'])
            type = ContentType.FILE_METADATA
        elif message.command_name == ProjectCommand.delete:
            if 'path' in metadata.keys():
                files.delete(metadata['path'], metadata['is_file'])
            if ('is_file' in metadata) and metadata['is_file']:
                output = projects.close_file(metadata['path'])
            else:  # TODO: handle the case where a dir is deleted and deleted files were opened
                output = projects.get_open_files()
            type = ContentType.FILE_METADATA
        # create reply message
        message.type = type
        message.content = output
        message.error = False
        send_to_node(message)

    except:
        trace = traceback.format_exc()
        log.error("%s" % (trace))
        error_message = create_error_message(message.webapp_endpoint, trace)
        send_to_node(error_message)


def handle_MagicCommandGen_message(message, client_globals=None):
    send_reply = False
    # message execution_mode will always be `eval` for this sender
    log.info('eval... %s' % message)
    try:
        if message.command_name == DFManagerCommand.get_cardinal:
            df_id = message.metadata['df_id']
            col_name = message.metadata['col_name']
            if 'groupby' in message.metadata:
                groupby = message.metadata['groupby']

                # Get stat for groupby x0
                groupby_cols = ''
                groupby_cols += '"%s",' % groupby[0]
                command_str = '%s.groupby([%s])["%s"].count()' % (
                    df_id, groupby_cols, col_name)
                result = {'groupby_x0': eval(
                    command_str, globals()).describe().to_dict()}

                # Get stat for groupby all x
                groupby_cols = ''
                for c in groupby:
                    groupby_cols += '"%s",' % c
                command_str = '%s.groupby([%s])["%s"].count()' % (
                    df_id, groupby_cols, col_name)
                result.update({'groupby_all': eval(
                    command_str, globals()).describe().to_dict()})

                # Count unique and get monotonic for all x
                unique_counts = {}
                monotonics = {}
                for col_name in groupby:
                    command_str = 'len(%s["%s"].unique())' % (df_id, col_name)
                    unique_counts[col_name] = eval(command_str, globals())
                    command_str = '%s["%s"].is_monotonic' % (df_id, col_name)
                    monotonics[col_name] = eval(command_str, globals())
                result.update({'unique_counts': unique_counts,
                              'monotonics': monotonics})
                # log.info('Result:  %s' % (result))
            else:
                # TODO: consider to remove this because it is not used
                # return a describe dict to make it consistent with the groupby case above
                command_str = '%s["%s"].shape[0]' % (df_id, col_name)
                result = pandas.DataFrame(
                    [eval(command_str, globals())]).describe().to_dict()

            if result is not None:
                # log.info("get cardinal data: %s"%type(result))
                log.info("get cardinal data")
                output = _create_get_cardinal_data(result)
                type = ContentType.COLUMN_CARDINAL
                send_reply = True

        if send_reply:
            message.type = type
            message.content = output
            message.error = False
            send_to_node(message)
    except:
        trace = traceback.format_exc()
        log.error("%s" % (trace))
        error_message = create_error_message(message.webapp_endpoint, trace)
        send_to_node(error_message)


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
        p2n_queue = MessageQueue(
            config.p2n_comm['host'], config.p2n_comm['p2n_port'])
        user_space = UserSpace(BaseKernel())
        # TODO: refactor message handler to separate class like ExperimentManager
        message_handler = {
            WebappEndpoint.CodeEditor: ce.MessageHandler(p2n_queue, user_space).handle_message,
            WebappEndpoint.DFManager: dm.MessageHandler(p2n_queue, user_space).handle_message,
            WebappEndpoint.ExperimentManager: em.MessageHandler(p2n_queue, user_space).handle_message,
            WebappEndpoint.FileManager: handle_FileManager_message,
            WebappEndpoint.MagicCommandGen: handle_MagicCommandGen_message,
            WebappEndpoint.FileExplorer: handle_FileExplorer_message,
        }

    except Exception as error:
        log.error("Failed to make connection to node server %s - %s" %
                  (error, traceback.format_exc()))
        exit(1)

    while True:
        for line in sys.stdin:
            try:
                log.info('Got message %s' % line)
                message = Message(**json.loads(line))

                message_handler[message.webapp_endpoint](
                    message, client_globals=globals())
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
