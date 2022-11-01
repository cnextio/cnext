import io
import base64
import traceback
import plotly
import matplotlib.pyplot as plt
from cnextlib.df_status_hook import DataFrameStatusHook
import cnextlib.dataframe as cd
from libs.message_handler import BaseMessageHandler
from libs.message import ContentType, Message, SubContentType

from libs import logs
from libs.message import DFManagerCommand, WebappEndpoint
from user_space.user_space import ExecutionMode
from user_space.user_space import BaseKernel, IPythonUserSpace
log = logs.get_logger(__name__)


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    @staticmethod
    def _create_plot_data(result):
        return result.to_json()

    @staticmethod
    def _create_matplotlib_data(result):
        figfile = io.BytesIO()
        plt.savefig(figfile, format='svg')
        figfile.seek(0)  # rewind to beginning of file
        plot_binary_data = base64.b64encode(figfile.getvalue())
        return plot_binary_data

    @staticmethod
    def _result_is_plotly_fig(result) -> bool:
        return hasattr(plotly.graph_objs, '_figure') and (type(result) == plotly.graph_objs._figure.Figure)

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

    def _get_active_dfs_status(self):
        active_dfs_status = self.user_space.get_active_dfs_status()
        if active_dfs_status:
            active_df_status_message = Message(**{"webapp_endpoint": WebappEndpoint.DataFrameManager,
                                                  "command_name": DFManagerCommand.update_df_status,
                                                  "seq_number": 1,
                                                  "type": "dict",
                                                  "content": active_dfs_status,
                                                  "error": False})
            self._send_to_node(active_df_status_message)

    def handle_message(self, message):
        # message execution_mode will always be `eval` for this sender
        log.info('eval... %s' % message)
        # log.info('Globals: %s' % client_globals)
        try:
            sub_type = SubContentType.NONE
            self._assign_exec_mode(message)
            type = ContentType.NONE
            output = ''
            if message.execution_mode == 'exec':
                log.info('exec mode...')
                # exec(message.content, globals())
                self.user_space.execute(message.content, ExecutionMode.EXEC)
                type = ContentType.STRING
                # output = sys.stdout.getvalue()
            elif message.execution_mode == 'eval':
                log.info('eval mode...')
                # result = eval(message.content, globals())
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
                        type = ContentType.RICH_OUTPUT
                        sub_type = SubContentType.IMAGE_PLOTLY
                    elif self._result_is_matplotlib_fig(result):
                        output = self._create_matplotlib_data(result)
                        type = ContentType.RICH_OUTPUT
                        sub_type = 'image/svg+xml'
                    else:
                        type = ContentType.STRING
                        output = str(result)
            # log.info('Globals: %s' % globals())

            message.type = type
            message.sub_type = sub_type
            message.content = output
            message.error = False
            self._send_to_node(message)

            self._get_active_dfs_status()

        except:
            trace = traceback.format_exc()
            log.error("Exception %s" % (trace))
            error_message = MessageHandler._create_error_message(
                message.webapp_endpoint, trace, message.command_name, message.metadata)
            self._send_to_node(error_message)
