import traceback
import simplejson as json

import plotly
from libs.message_handler import BaseMessageHandler
from libs.message import ContentType, SubContentType, Message

from libs import logs
from libs.message import DFManagerCommand, WebappEndpoint
from user_space.ipython.constants import IPythonKernelConstants as IPythonConstants, IpythonResultMessage
from user_space.ipython.kernel import IPythonKernel
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

    def build_single_message(self, output, message):
        """
            Get single message from IPython,
            classify it according to the message type then return it to the client
        """
        msg_ipython = IpythonResultMessage(**output)

        # Handle error message
        if self._is_error_message(msg_ipython.header):
            log.error("Error {}" % (msg_ipython.content['traceback']))
            error_message = self._create_error_message(
                message.webapp_endpoint,
                msg_ipython.content['traceback'],
                message.metadata
            )
            return error_message

        # Handle success message
        message.error = False
        if self._is_execute_reply(msg_ipython.header):
            message.type = ContentType.NONE
            message.sub_type = SubContentType.NONE
            message.content = json.dumps(msg_ipython.content)
            return message
        elif self._is_execute_result(msg_ipython.header):
            # The case return video/ audio from IPython
            if type(msg_ipython.content['data']) is dict:
                if 'text/html' in msg_ipython.content['data']:
                    message.type = ContentType.RICH_OUTPUT
                    message.sub_type = SubContentType.HTML_STRING
                    message.content = msg_ipython.content['data']['text/html']
            else:
                message.type = ContentType.STRING
                message.content = msg_ipython.content['data']
            return message
        elif self._is_stream_result(msg_ipython.header):
            message.type = ContentType.STRING
            if 'text' in msg_ipython.content:
                message.content = msg_ipython.content['text']
            elif 'data' in msg_ipython.content:
                message.content = msg_ipython.content['data']
            return message
        elif self._is_display_data_result(msg_ipython.header):
            message.type = ContentType.RICH_OUTPUT
            # Ipython return rich output as mime types
            for key, value in msg_ipython.content['data'].items():
                message.content = value
                message.sub_type = key
                if key == 'application/json' and self._result_is_plotly_fig(value):
                    message.sub_type = SubContentType.PLOTLY_FIG
            return message

    def handle_message(self, message):
        """ 
            Use Ipython Kernel to handle message
        """
        log.info('message: {}'.format(message))
        try:
            outputs = self.user_space.execute(message.content, None)
            for output in outputs:
                msg = self.build_single_message(output=output, message=message)
                if msg is not None:
                    self._send_to_node(msg)
            self._process_active_dfs_status()
        except:
            trace = traceback.format_exc()
            log.error("Exception %s" % (trace))
            error_message = self._create_error_message(
                message.webapp_endpoint, trace, message.metadata)
            self._send_to_node(error_message)
        finally:
            IPythonKernel().shutdown_kernel()

    def _process_active_dfs_status(self):
        active_df_status = self.user_space.get_active_dfs_status()
        if len(active_df_status) > 0:
            for active_df in active_df_status:
                active_df_status_message = Message(**{"webapp_endpoint": WebappEndpoint.DFManager,
                                                      "command_name": DFManagerCommand.active_df_status,
                                                      "seq_number": 1,
                                                      "type": "dict",
                                                      "content": active_df,
                                                      "error": False})
                self._send_to_node(active_df_status_message)
