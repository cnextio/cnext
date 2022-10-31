import traceback

from libs.message_handler import BaseMessageHandler
from libs.message import ContentType

from libs import logs
from libs.message import LogsCommand
from os import path
import requests
root_url = "http://logs-01.loggly.com/inputs/c58f8bb2-2332-4915-b9f3-70c1975956bb/tag/"
log = logs.get_logger(__name__)

class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    def handle_message(self, message):
        log.info('LogsManager handle message: %s' %(message.command_name))
        try:
            result = None
            if message.command_name == LogsCommand.send_logs:
                result = send_logs(message.content)
                type = ContentType.NONE

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
       

def send_json_logs(json_data, tag):
    url = root_url + tag
    x = requests.post(url, json = json_data)
    log.info('Send log with tag: %s' %(tag) + " " + x.text)


def send_server_logs(tag):
    url = root_url + tag
    basepath = path.dirname(__file__)
    filepath = path.abspath(path.join(basepath, "..", "..", "server.log"))

    file =  open(filepath, "r")
    lines = file.readlines()
    if len(lines) > 10000:
        lines = lines[-10000:]
    
    x = requests.post(url, data = "\n".join(lines))
    log.info('Send log with tag: %s' %(tag) + " " + x.text)


def send_workspace(tag):
    basepath = path.dirname(__file__)
    filepath = path.abspath(path.join(basepath, "..", "..", "..", "workspace.yaml"))
    url = root_url + tag
    file =  open(filepath, "rb").read()
    x = requests.post(url, data = file)
    log.info('Send log with tag: %s' %(tag) + " " + x.text)


def send_logs(message):
    send_json_logs(message["clientLogs"], "clientLogs")
    send_json_logs(message["rootState"], "rootState")
    send_server_logs("serverLogs")
    send_workspace("workspace")
    return True
