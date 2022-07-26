import os
import signal
import threading
import traceback
import subprocess

from libs.message_handler import BaseMessageHandler
from libs.message import ContentType

from libs import logs
from libs.config import read_config
from libs.message import JupyterServerCommand, Message, WebappEndpoint
from project_manager import files, projects
from project_manager.interfaces import WorkspaceMetadata
from project_manager.interfaces import FileManagerMessageParams

log = logs.get_logger(__name__)


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space, workspace_info: WorkspaceMetadata, jupyter_server_config):
        self.jupyter_server_config = jupyter_server_config
        run_string = f"jupyter server --port={jupyter_server_config['port']} --ServerApp.allow_origin=* --ServerApp.token={jupyter_server_config['token']}"
        log.info("Run: %s" % run_string)
        self.jupyter_server = subprocess.Popen(
            run_string, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        self.jupyter_stdout_handler_thread = threading.Thread(
            target=self.jupyter_stdout_handler, daemon=True)
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    def jupyter_stdout_handler(self):
        while True:
            line = self.jupyter_server.stdout.readline()
            if not line:
                break
            log.info(line.rstrip())

    def handle_message(self, message):
        try:
            if message.command_name == JupyterServerCommand.get_config:
                print('log')
                self._get_jupyter_server_config()
        except:
            pass

    def _get_jupyter_server_config(self):
        jupyter_server_config_message = Message(**{"webapp_endpoint": WebappEndpoint.Terminal, "command_name": JupyterServerCommand.get_config,
                                                "content": self.jupyter_server_config, "error": False})
        self._send_to_node(jupyter_server_config_message)

    def shutdown(self):
        try: 
            log.info('Shutting down pid=%s' % self.jupyter_server.pid)
            os.killpg(os.getpgid(self.jupyter_server.pid), signal.SIGTERM)
        except ProcessLookupError as error:
            ## Sometime the the jupyter server might be exited before shutdown 
            # so we have to catch this except to make sure the program will exit gracefully
            # FIXME: need to find out why this happened # 
            # log.error(error)
            pass            

    def restart(self):
        pass    