
import traceback
from project_manager.interfaces import WorkspaceMetadata
from libs.message_handler import BaseMessageHandler
from libs.message import ContentType
import git
from libs import logs
from libs.config import read_config
from libs.message import GitCommand, Message, WebappEndpoint

log = logs.get_logger(__name__)


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space):
        super(MessageHandler, self).__init__(p2n_queue)
        self.repo = git.repo.Repo('D:\CNext\cnext_app')

    def handle_message(self, message):
        try:
            output = None
            type = None
            if message.command_name == GitCommand.connect_repo:
                print("o=>123")
                o = self.repo.remotes.origin
                changedFiles = [
                    item.a_path for item in self.repo.index.diff(None)]
                # print(changedFiles)
                output = changedFiles
                print(self.repo.git.diff(self.repo.commit()))
                # for c in repo.iter_commits():
                #     print c.hexsha
                #     print c.summary
                #     for p in c.parents:
                #         handle_diff(c.diff(p))
            # create reply message
            message.type = type
            message.content = output
            message.error = False
            self._send_to_node(message)    
        except:
            trace = traceback.format_exc()
            log.info("Exceptiono=> %s" % (trace))
