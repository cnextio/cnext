import traceback
import simplejson as json

import plotly
import matplotlib.pyplot as plt
from libs.message_handler import BaseMessageHandler
from libs.message import ContentType, SubContentType, Message

from libs import logs
from user_space.user_space import ExecutionMode
from libs.ipython.constants import IPythonKernelConstants as IPythonConstants, MIME_TYPES, IpythonResultMessage
from libs.ipython.kernel import IPythonKernel
from code_editor.interfaces import PlotResult
log = logs.get_logger(__name__)


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    @staticmethod
    def _create_plot_data(result):
        return PlotResult(plot=result.to_json()).toJSON()

    # @staticmethod
    # def _result_is_dataframe(result) -> bool:
    #     return type(result) == pandas.core.frame.DataFrame

    @staticmethod
    def _assign_exec_mode(message: Message):
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

    @staticmethod
    def _is_execute_result(header) -> bool:
        return header['msg_type'] == IPythonConstants.MessageType.EXECUTE_RESULT

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

    def handle_message_v2(self, message):
        """ Use Ipython Kernel to handle message
        """
        log.info('message: {}'.format(message))
        try:
            outputs = self.user_space.execute(message.content, None)
            for output in outputs:
                # Handle error message
                msg_ipython = IpythonResultMessage(**output)
                if self._is_error_message(msg_ipython.header):
                    log.error("Error {}" % (msg_ipython.content['traceback']))
                    error_message = self._create_error_message(
                        message.webapp_endpoint,
                        msg_ipython.content['traceback'],
                        message.metadata
                    )
                    self._send_to_node(error_message)

                # Handle success message
                message.error = False
                if self._is_execute_result(msg_ipython.header):
                    message.type = ContentType.STRING
                    message.content = msg_ipython.content['data']
                    self._send_to_node(message)
                if self._is_stream_result(msg_ipython.header):
                    message.type = ContentType.STRING
                    if 'text' in msg_ipython.content:
                        message.content = msg_ipython.content['text']
                    elif 'data' in msg_ipython.content:
                        message.content = msg_ipython.content['data']
                    self._send_to_node(message)
                if self._is_display_data_result(msg_ipython.header):
                    message.type = ContentType.RICH_OUTPUT
                    for key, value in msg_ipython.content['data'].items():
                        # All returned rich output in IPython is formatted in mime types
                        if key in MIME_TYPES:
                            message.content = value
                            message.sub_type = key
                            if key == 'application/json':
                                message.sub_type = SubContentType.PLOTLY_FIG if self._result_is_plotly_fig(
                                    value) else key

                    # If message doesn't have sub type, assign content to message.content prevent none value
                    # This is just a temporary solution to get all response from IPython,
                    # I need more practice with Ipython result with alot of cases then improve later.
                    if message.sub_type == None:
                        message.content = msg_ipython.content
                    self._send_to_node(message)
        except:
            trace = traceback.format_exc()
            log.error("Exception %s" % (trace))
            error_message = self._create_error_message(
                message.webapp_endpoint, trace, message.metadata)
            self._send_to_node(error_message)
        finally:
            IPythonKernel().shutdown_kernel()

    def handle_message(self, message):
        # message execution_mode will always be `eval` for this sender
        log.info('eval... %s' % message)
        # log.info('Globals: %s' % client_globals)
        try:
            self._assign_exec_mode(message)
            type = ContentType.NONE
            output = ''
            if message.execution_mode == 'exec':
                log.info('exec mode...')
                # exec(message.content, client_globals)
                self.user_space.execute(message.content, ExecutionMode.EXEC)
                type = ContentType.STRING
                # output = sys.stdout.getvalue()
            elif message.execution_mode == 'eval':
                log.info('eval mode...')
                # result = eval(message.content, client_globals)
                result = self.user_space.execute(
                    message.content, ExecutionMode.EVAL)
                if result is not None:
                    # log.info("eval result: \n%s" % (result))
                    log.info("got eval results")
                    # if self._result_is_dataframe(result):
                    #     df_id = self._get_dataframe_id(message.content)
                    #     output = self._create_table_data(df_id, result)
                    #     type = ContentType.PANDAS_DATAFRAME
                    if self._result_is_plotly_fig(result):
                        output = self._create_plot_data(result)
                        type = ContentType.PLOTLY_FIG
                    else:
                        type = ContentType.STRING
                        output = str(result)

            message.type = type
            message.content = output
            message.error = False
            self._send_to_node(message)

        except:
            trace = traceback.format_exc()
            log.error("Exception %s" % (trace))
            error_message = self._create_error_message(
                message.webapp_endpoint, trace, message.metadata)
            self._send_to_node(error_message)
