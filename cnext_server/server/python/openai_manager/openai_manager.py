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
    def __init__(self, p2n_queue, user_space):
        super(MessageHandler, self).__init__(p2n_queue, user_space)
        openai.api_key = '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'

    def handle_message(self, message):
        try:
            if message.command_name == OpenAiCommand.exc_text:
                content = asyncio.run(self._getDataOpenAi())
                data = Message(**{"webapp_endpoint": WebappEndpoint.OpenAiManager, "command_name": OpenAiCommand.exc_text,
                                  "content": content, "error": False})
                self._send_to_node(data)
        except:
            pass

    async def _getDataOpenAi(message):
        messsage =message.content
        return openai.Completion.create(
            model="code-davinci-002",
            prompt=messsage,
            temperature=0,
            max_tokens=64,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )
