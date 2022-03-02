import io
import base64
import traceback
import simplejson as json
from xmlrpc.client import boolean

import pandas
import plotly
import matplotlib.pyplot as plt
from libs.message_handler import BaseMessageHandler
from libs.message import ContentType, Message

from libs import logs
from libs.message import DFManagerCommand
from user_space.user_space import ExecutionMode
from user_space.user_space import BaseKernel, _UserSpace
from code_editor.interfaces import PlotResult
log = logs.get_logger(__name__)


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    @staticmethod
    def _create_plot_data(result):
        return PlotResult(plot=result.to_json()).toJSON()

    @staticmethod
    def _create_matplotlib_data(result):
        figfile = io.BytesIO()
        plt.savefig(figfile, format='svg')
        figfile.seek(0)  # rewind to beginning of file
        plot_binary_data = base64.b64encode(figfile.getvalue())
        # make sure the result type is json data same as result of _create_plot_data function.
        # It help the code in client: CodeEditorRedux.addPlotResult() keep simplest
        return PlotResult(plot=json.dumps({'data': plot_binary_data})).toJSON()

    # @staticmethod
    # def _result_is_dataframe(result) -> bool:
    #     return type(result) == pandas.core.frame.DataFrame

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

    def _create_get_cardinal_data(self, result):
        return {'cardinals': result}

    def handle_message(self, message):
        send_reply = False
        # message execution_mode will always be `eval` for this sender
        log.info('eval... %s' % message)
        try:
            if message.command_name == DFManagerCommand.get_cardinal:
                df_id = message.metadata['df_id']
                col_name = message.metadata['col_name']
                if 'groupby' in message.metadata:
                    groupby = message.metadata['groupby']

                    # Get stat for groupby x0
                    groupby_cols = ''
                    groupby_cols += '"%s",' % groupby[0]
                    command_str = '%s.groupby([%s])["%s"].count()' % (
                        df_id, groupby_cols, col_name)
                    # result = {'groupby_x0': eval(
                    #     command_str, globals()).describe().to_dict()}
                    result = {'groupby_x0': self.user_space.execute(
                        command_str, ExecutionMode.EVAL).describe().to_dict()}
                    # Get stat for groupby all x
                    groupby_cols = ''
                    for c in groupby:
                        groupby_cols += '"%s",' % c
                    command_str = '%s.groupby([%s])["%s"].count()' % (
                        df_id, groupby_cols, col_name)
                    # result.update({'groupby_all': eval(
                    #     command_str, globals()).describe().to_dict()})
                    result = {'groupby_all': self.user_space.execute(
                        command_str, ExecutionMode.EVAL).describe().to_dict()}
                    # Count unique and get monotonic for all x
                    unique_counts = {}
                    monotonics = {}
                    for col_name in groupby:
                        command_str = 'len(%s["%s"].unique())' % (df_id, col_name)
                        # unique_counts[col_name] = eval(command_str, globals())
                        unique_counts[col_name] = self.user_space.execute(command_str, ExecutionMode.EVAL)
                        command_str = '%s["%s"].is_monotonic' % (df_id, col_name)
                        # monotonics[col_name] = eval(command_str, globals())
                        # monotonics[col_name] = eval(command_str, globals())
                        monotonics[col_name] = self.user_space.execute(command_str, ExecutionMode.EVAL)
                    result.update({'unique_counts': unique_counts,
                                'monotonics': monotonics})
                    # log.info('Result:  %s' % (result))
                else:
                    # TODO: consider to remove this because it is not used
                    # return a describe dict to make it consistent with the groupby case above
                    command_str = '%s["%s"].shape[0]' % (df_id, col_name)
                    # result = pandas.DataFrame(
                    #     [eval(command_str, globals())]).describe().to_dict()
                    result = pandas.DataFrame(
                        [self.user_space.execute(command_str, ExecutionMode.EVAL)]).describe().to_dict()

                if result is not None:
                    # log.info("get cardinal data: %s"%type(result))
                    log.info("get cardinal data")
                    output = self._create_get_cardinal_data(result)
                    type = ContentType.COLUMN_CARDINAL
                    send_reply = True

            if send_reply:
                message.type = type
                message.content = output
                message.error = False
                self._send_to_node(message)
        except:
            trace = traceback.format_exc()
            log.error("%s" % (trace))
            error_message = MessageHandler._create_error_message(message.webapp_endpoint, trace)
            self._send_to_node(error_message)
