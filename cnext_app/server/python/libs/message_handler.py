import traceback
import simplejson as json
from libs.message import ContentType, Message, SubContentType
from libs import logs
# from server.python.libs.message import WebappEndpoint
from user_space.user_space import BaseKernel, IPythonUserSpace
from user_space.ipython.constants import IPythonConstants as IPythonConstants

log = logs.get_logger(__name__)


class BaseMessageHandler:
    def __init__(self, p2n_queue, user_space=None):
        self.p2n_queue = p2n_queue
        if user_space == None:
            self.user_space = IPythonUserSpace(BaseKernel())
        else:
            self.user_space = user_space

    @staticmethod
    def _is_execute_result(header) -> bool:
        return header['msg_type'] == IPythonConstants.MessageType.EXECUTE_RESULT

    @staticmethod
    def _is_execute_reply(header) -> bool:
        return header['msg_type'] == IPythonConstants.MessageType.EXECUTE_REPLY

    @staticmethod
    def _is_stream_result(header) -> bool:
        return header['msg_type'] == IPythonConstants.MessageType.STREAM

    @staticmethod
    def _is_display_data_result(header) -> bool:
        return header['msg_type'] == IPythonConstants.MessageType.DISPLAY_DATA

    @staticmethod
    def _is_error_message(header) -> bool:
        return header['msg_type'] == IPythonConstants.MessageType.ERROR
        
    ## TODO: this needs to be designed #
    # @staticmethod
    # def get_execute_result(messages):
    #     """
    #         Get result from list of messages are responsed by IPython kernel
    #         For result type rather than 'application/json' we have to convert the output
    #         to the original object before sending to client because we already json.dumps
    #         them inside ipython. A better way to handle this is to output 'application/json' 
    #         instead. That will be done later.
    #     """
    #     result = None
    #     for message in messages:
    #         log.info('Message type %s' % message['header']['msg_type'])
    #         if message['header']['msg_type'] == IPythonConstants.MessageType.EXECUTE_RESULT:
    #             if message['content']['data']['text/plain'] is not None:
    #                 result = message['content']['data']['text/plain']
    #                 result = json.loads(result)
    #         elif message['header']['msg_type'] == IPythonConstants.MessageType.STREAM:
    #             # log.info('Stream result: %s' % result)
    #             if 'text' in message['content']:
    #                 result = message['content']['text']
    #                 result = json.loads(result)
    #         elif message['header']['msg_type'] == IPythonConstants.MessageType.DISPLAY_DATA:
    #             if SubContentType.APPLICATION_PLOTLY in message['content']['data']:
    #                 result = message['content']['data'][SubContentType.APPLICATION_PLOTLY]
    #     return result

    @staticmethod
    def get_execute_result(message):
        """
            Get result from list of messages are responsed by IPython kernel
            For result type rather than 'application/json' we have to convert the output
            to the original object before sending to client because we already json.dumps
            them inside ipython. A better way to handle this is to output 'application/json' 
            instead. That will be done later.
        """
        result = None
        log.info('Message type %s' % message.header['msg_type'])
        if message.header['msg_type'] == IPythonConstants.MessageType.EXECUTE_RESULT:
            if message.content['data']['text/plain'] is not None:
                result = message.content['data']['text/plain']
                result = json.loads(result)
        # elif message['header']['msg_type'] == IPythonConstants.MessageType.STREAM:
        #     # log.info('Stream result: %s' % result)
        #     if 'text' in message['content']:
        #         result = message['content']['text']
        #         result = json.loads(result)
        elif message.header['msg_type'] == IPythonConstants.MessageType.DISPLAY_DATA:
            if SubContentType.APPLICATION_PLOTLY in message.content['data']:
                result = message.content['data'][SubContentType.APPLICATION_PLOTLY]
        return result

    @staticmethod
    def _create_error_message(webapp_endpoint, trace, command_name=None, metadata=None):
        return Message(**{
            "webapp_endpoint": webapp_endpoint,
            "command_name": command_name,
            "type": ContentType.STRING,
            "content": trace,
            "error": True,
            "metadata": metadata,
        })

    def _send_to_node(self, message: Message):
        # the current way of communicate with node server is through stdout with a json string
        log.info("Send to node server: %s command_name: %s type: %s subt_type: %s metadata: %s" %
                 (message.webapp_endpoint, message.command_name, message.type, message.sub_type, message.metadata))
        BaseMessageHandler.send_message(self.p2n_queue, message)

    @staticmethod
    def send_message(channel, message: Message):
        channel.send(message.toJSON())

    def handle_message(self, message):
        ''' `ext_globals` is the user namespace where the user executes their command'''
        raise "Abstract function must be implemented by subclass"

    def shutdown(self):
        self.user_space.shutdown_executor()
        pass
