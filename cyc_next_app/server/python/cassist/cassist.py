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
from libs.json_serializable import ipython_internal_output
from libs.message import SubContentType
from user_space.ipython.constants import IPythonInteral, IpythonResultMessage
from user_space.user_space import ExecutionMode

log = logs.get_logger(__name__)


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    def _create_get_cardinal_data(self, result):
        return {'cardinals': result}

    @ipython_internal_output
    def _get_cardinal(self, metadata):
        df_id = metadata['df_id']
        col_name = metadata['col_name']
        if 'groupby' in metadata:
            groupby = metadata['groupby']

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
                command_str = 'len(%s["%s"].unique())' % (
                    df_id, col_name)
                # unique_counts[col_name] = eval(command_str, globals())
                unique_counts[col_name] = self.user_space.execute(
                    command_str, ExecutionMode.EVAL)
                command_str = '%s["%s"].is_monotonic' % (
                    df_id, col_name)
                # monotonics[col_name] = eval(command_str, globals())
                # monotonics[col_name] = eval(command_str, globals())
                monotonics[col_name] = self.user_space.execute(
                    command_str, ExecutionMode.EVAL)
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

        if result:
            return self._create_get_cardinal_data(result)
        else:
            return None

    def handle_message(self, message):
        send_reply = False
        # message execution_mode will always be `eval` for this sender
        try:
            if message.command_name == DFManagerCommand.get_cardinal:
                # message.metadata = message.metadata.replace("'", '"')
                output_messages = self.user_space.execute(
                    "{}._get_cardinal({})".format(IPythonInteral.CASSIST.value, message.metadata))
                ipython_message = IpythonResultMessage(**output_messages)
                output = self.get_execute_result(ipython_message)
                if output is not None:
                    # log.info("get table data")
                    log.info('cAssist get cardinal: %s' % output)
                    type = ContentType.COLUMN_CARDINAL
                    sub_type = SubContentType.NONE
                    send_reply = True

            if send_reply:
                message.type = type
                message.content = output
                message.error = False
                self._send_to_node(message)
        except:
            trace = traceback.format_exc()
            log.error("%s" % (trace))
            error_message = MessageHandler._create_error_message(
                message.webapp_endpoint, trace)
            self._send_to_node(error_message)
