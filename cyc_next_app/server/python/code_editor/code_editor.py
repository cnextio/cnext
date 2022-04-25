import traceback
import simplejson as json

import plotly
from libs.message_handler import BaseMessageHandler
from libs.message import ContentType, SubContentType, Message

from libs import logs
from libs.message import DFManagerCommand, WebappEndpoint
from user_space.ipython.constants import IPythonKernelConstants as IPythonConstants, IpythonResultMessage
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

    def _process_rich_ouput(self, message, result_data):
        if type(result_data) is dict:
            message.type = ContentType.RICH_OUTPUT
        else:
            message.type = ContentType.STRING
        message.content = result_data

        # remove 'text/html' key if the output is plotly to improve the efficiency.
        # TODO: revisit this later #
        if type(message.content) is dict and SubContentType.APPLICATION_PLOTLY in message.content:
            message.content.pop('text/html', None)
        return message

    def _create_return_message(self, output, message):
        """
            Get single message from IPython,
            classify it according to the message type then return it to the client
        """
        msg_ipython = IpythonResultMessage(**output)

        # Add header message from ipython to message metadata
        if message.metadata is None:
            message.metadata = {}

        message.metadata['msg_id'] = msg_ipython.header['msg_id']
        message.metadata['msg_type'] = msg_ipython.header['msg_type']
        message.metadata['session'] = msg_ipython.header['session']

        # Handle error message
        if self._is_error_message(msg_ipython.header):
            log.error("Error %s" % (msg_ipython.content['traceback']))
            if isinstance(msg_ipython.content['traceback'], list):
                content = '\n'.join(msg_ipython.content['traceback'])
            else:
                content = msg_ipython.content['traceback']
            error_message = self._create_error_message(
                message.webapp_endpoint,
                content,
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
            return self._process_rich_ouput(message, msg_ipython.content['data'])
        elif self._is_stream_result(msg_ipython.header):
            message.type = ContentType.STRING
            if 'text' in msg_ipython.content:
                message.content = msg_ipython.content['text']
            elif 'data' in msg_ipython.content:
                message.content = msg_ipython.content['data']
            return message
        elif self._is_display_data_result(msg_ipython.header):
            return self._process_rich_ouput(message, msg_ipython.content['data'])

    def handle_message(self, message):
        """
            Use Ipython Kernel to handle message
        """
        log.info('message: {}'.format(message))
        try:
            outputs = self.user_space.execute(message.content, None)
            # log.info('Execution result: {}'.format(outputs))
            for output in outputs:
                # print("MESSAGE", output)
                msg = self._create_return_message(
                    output=output, message=message)
                if msg is not None:
                    self._send_to_node(msg)
            self._process_active_dfs_status()
        except:
            trace = traceback.format_exc()
            log.error("Exception %s" % (trace))
            error_message = self._create_error_message(
                message.webapp_endpoint, trace, message.metadata)
            self._send_to_node(error_message)

    def _process_active_dfs_status(self):
        active_df_status = self.user_space.get_active_dfs_status()
        active_df_status_message = Message(**{"webapp_endpoint": WebappEndpoint.DFManager,
                                              "command_name": DFManagerCommand.update_df_status,
                                              "seq_number": 1,
                                              "type": "dict",
                                              "content": active_df_status,
                                              "error": False})
        self._send_to_node(active_df_status_message)
