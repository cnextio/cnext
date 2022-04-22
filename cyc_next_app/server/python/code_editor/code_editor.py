import threading
import traceback
import simplejson as json

import plotly
from libs.message_handler import BaseMessageHandler
from libs.message import ContentType, SubContentType, Message

from libs import logs
from libs.message import DFManagerCommand, WebappEndpoint, CodeEditorCommand
from user_space.ipython.constants import IPythonConstants as IPythonConstants, IpythonResultMessage
log = logs.get_logger(__name__)


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

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

    @staticmethod
    def _result_is_plotly_fig(content) -> bool:
        try:
            # Because IPython return plotly as json format, have to convert it to figure instance
            # Use plotly_io (low-level interface for displaying, reading and writing figures)
            plotly_figure = plotly.io.from_json(json.dumps(content))
            return hasattr(plotly.graph_objs, '_figure') and (type(plotly_figure) == plotly.graph_objs._figure.Figure)
        except Exception:
            return False

    # PRIORITIXED_MIME_LIST = [SubContentType.APPLICATION_PLOTLY, SubContentType.APPLICATION_JSON, SubContentType.IMAGE_PLOTLY,
    #                          SubContentType.IMAGE_JPG, SubContentType.IMAGE_PNG, SubContentType.IMAGE_SVG, SubContentType.TEXT_HTML]

    def _process_rich_ouput(self, message, msg_ipython):
        message.error = False
        if type(msg_ipython.content['data']) is dict:
            message.type = ContentType.RICH_OUTPUT
        else:
            message.type = ContentType.STRING
        message.content = msg_ipython.content['data']

        # remove 'text/html' key if the output is plotly to improve the efficiency.
        # TODO: revisit this later #
        if type(message.content) is dict and SubContentType.APPLICATION_PLOTLY in message.content:
            message.content.pop('text/html', None)
        return message

    def _process_error_message(self, message, ipython_msg):
        # log.error("Error %s" % (msg_ipython.content['traceback']))
        if isinstance(ipython_msg.content['traceback'], list):
            content = '\n'.join(ipython_msg.content['traceback'])
        else:
            content = ipython_msg.content['traceback']
        return self._create_error_message(
            WebappEndpoint.CodeEditor, content, message.metadata)

    def _process_stream_message(self, message, ipython_msg):
        message.error = False
        message.type = ContentType.STRING
        if 'text' in ipython_msg.content:
            message.content = ipython_msg.content['text']
        elif 'data' in ipython_msg.content:
            message.content = ipython_msg.content['data']
        return message

    def _process_other_message(self, message, ipython_msg):
        message.error = False
        message.type = ContentType.IPYTHON_MSG
        message.sub_type = SubContentType.NONE
        message.content = ipython_msg.content
        return message

    def _create_return_message(self, output, request_metadata):
        """
            Get single message from IPython,
            classify it according to the message type then return it to the client
        """
        ipython_msg = IpythonResultMessage(**output)
        message = Message(
            **{'webapp_endpoint': WebappEndpoint.CodeEditor, 'metadata': request_metadata})

        log.info('Got message from ipython: %s %s',
                 ipython_msg.header['msg_type'], ipython_msg.content['status'] if 'status' in ipython_msg.content else None)

        # Add header message from ipython to message metadata
        if message.metadata == None:
            message.metadata = {}

        message.metadata.update(dict((k, ipython_msg.header[k])
             for k in ('msg_id', 'msg_type', 'session')))        
        
        if self._is_error_message(ipython_msg.header):
            message = self._process_error_message(message, ipython_msg)
        elif self._is_stream_result(ipython_msg.header):
            message = self._process_stream_message(message, ipython_msg)
        elif self._is_execute_result(ipython_msg.header) or self._is_display_data_result(ipython_msg.header):
            message = self._process_rich_ouput(message, ipython_msg)
        else:
            message = self._process_other_message(message, ipython_msg)

        return message

    def exception_handler(func):
        def wrapper_func(*args, **kwargs):
            try:
                func(*args, **kwargs)
            except:
                trace = traceback.format_exc()
                log.error("Exception %s" % (trace))
                error_message = args[0]._create_error_message(
                    args[0].message.webapp_endpoint, trace, args[0].message.metadata)
                args[0]._send_to_node(error_message)
        return wrapper_func

    @exception_handler
    def message_handler_callback(self, ipython_message, request_metadata):
        # if self.request_metadata is not None:
        message = self._create_return_message(
            output=ipython_message, request_metadata=request_metadata)
        # log.info('Message: %s %s', self.message)
        self._send_to_node(message)

    def handle_message(self, message):
        """
            Use Ipython Kernel to handle message
        """
        # log.info('Got client message: {}'.format(message))
        try:
            self.user_space.execute(
                message.content, None, self.message_handler_callback, message.metadata)

            # self._process_active_dfs_status()
        except:
            trace = traceback.format_exc()
            log.error("Exception %s" % (trace))
            error_message = self._create_error_message(
                message.webapp_endpoint, trace, message.metadata)
            self._send_to_node(error_message)

    def _process_active_dfs_status(self):
        active_df_status = self.user_space.get_active_dfs_status()
        active_df_status_message = Message(**{"webapp_endpoint": WebappEndpoint.DFManager, "command_name": DFManagerCommand.update_df_status,
                                              "seq_number": 1, "type": "dict", "content": active_df_status, "error": False})
        self._send_to_node(active_df_status_message)
