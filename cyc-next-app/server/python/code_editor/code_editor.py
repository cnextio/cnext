import io
import base64
import traceback
import simplejson as json
from xmlrpc.client import boolean

import pandas
import plotly
import matplotlib.pyplot as plt
from libs.message_handler import BaseMessageHandler
from libs.message import ContentType, SubContentType, Message

from libs import logs
from user_space.user_space import ExecutionMode
from user_space.user_space import BaseKernel, UserSpace
from libs.ipython.constants import IPythonKernelConstants as IPythonConstants, MIME_TYPES
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
    # def _create_matplotlib_data(result):
    #     figfile = io.BytesIO()
    #     plt.savefig(figfile, format='svg')
    #     figfile.seek(0)  # rewind to beginning of file
    #     plot_binary_data = base64.b64encode(figfile.getvalue())
    #     # make sure the result type is json data same as result of _create_plot_data function.
    #     # It help the code in client: CodeEditorRedux.addPlotResult() keep simplest
    #     return PlotResult(plot=json.dumps({'data': plot_binary_data})).toJSON()

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
    def _result_is_matplotlib_fig(result) -> bool:
        # because matplotlib return array of objects
        if isinstance(result, list) and len(result) > 0:
            matplotlib_object = result[0]
            result_str_type = str(type(matplotlib_object))
            if 'matplotlib' in result_str_type and hasattr(matplotlib_object, 'figure') and matplotlib_object.figure.number > 0:
                return True
        return False

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
                header = output['header']
                content = output['content']
                message.error = False
                if self._is_execute_result(header):
                    message.type = ContentType.STRING
                    message.content = content['data']
                    self._send_to_node(message)
                elif self._is_stream_result(header):
                    message.type = ContentType.STRING
                    if 'text' in content:
                        message.content = content['text']
                    elif 'data' in content:
                        message.content = content['data']
                    self._send_to_node(message)
                elif self._is_display_data_result(header):
                    message.type = ContentType.RICH_OUTPUT
                    for key, value in content['data'].items():
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
                        message.content = content
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
                    # elif self._result_is_matplotlib_fig(result):
                    #     output = self._create_matplotlib_data(result)
                    #     type = ContentType.MATPLOTLIB_FIG
                    else:
                        type = ContentType.STRING
                        output = str(result)
            # log.info('Globals: %s' % globals())

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
