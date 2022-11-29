import openai
import os

from libs.message_handler import BaseMessageHandler
from libs.message import ContentType
import asyncio
from libs import logs
from libs.message import OpenAiCommand, Message, WebappEndpoint
from project_manager import files, projects
from project_manager.interfaces import WorkspaceMetadata

log = logs.get_logger(__name__)


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space, openai_api_key):
        super(MessageHandler, self).__init__(p2n_queue, user_space)
        openai.api_key = openai_api_key

    def handle_message(self, message):
        try:
            if message.command_name == OpenAiCommand.exc_text:
                print(message)
                content = openai.Completion.create(
                    model="code-davinci-002",
                    prompt=message.content,
                    temperature=0.0,
                    max_tokens=256,
                    top_p=1.0,
                    frequency_penalty=1.5,
                    presence_penalty=0.0,
                    best_of=1
                )
                data = Message(**{"webapp_endpoint": WebappEndpoint.OpenAiManager, "command_name": OpenAiCommand.exc_text,
                                  "content": content, "error": False, "metadata": message.metadata})
                print("data", data)
                self._send_to_node(data)
        except:
            pass

    def _getDataOpenAi():
        return openai.Completion.create(
            model="code-davinci-002",
            prompt="convert column i of data frame df to str using loc function",
            temperature=0.7,
            max_tokens=256,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0,
            best_of=1
        )
