import base64
import traceback
import simplejson as json
from libs.message_handler import BaseMessageHandler
from libs.message import ContentType, DFManagerCommand, SubContentType
from cycdataframe.mime_types import CnextMimeType

from libs import logs
from user_space.ipython.constants import IPythonInteral
from user_space.ipython.kernel import IPythonKernel
from user_space.user_space import ExecutionMode
log = logs.get_logger(__name__)


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue,  user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    def ipython_internal(func):
        '''
        Wrapper to return json string instead of original object when running inside ipython
        '''
        def json_output(*args, **kwargs):
            output = func(*args, **kwargs)
            return json.dumps(output, ignore_nan=True)
        return json_output

    # TODO: unify this with _create_plot_data
    def _create_plot_data(self, df_id, col_name, result):
        # return {'df_id': df_id, 'col_name': col_name, 'plot': result.to_json()}
        return {'df_id': df_id, 'col_name': col_name, 'plot': result}

    def _get_mime_file_content(self, file_path, mime_type):
        with open(file_path, 'rb') as file:
            return file.read()

    def _create_table_data(self, df_id, df):
        ''' The tableData will be the same as the original `df` except for two exceptions
            1. if column type is datatime64[ns], the data will be reformated
            2. if the column type is mime type such as file/png, we store the data of 
            that field in  dictionary of this format {file_path: file_path, binary: binary_data}.
            This is to ensure that we have access to both original data in the dataframe and the 
            binary data in the frontend for this special case'''
        tableData = {}
        tableData['df_id'] = df_id
        tableData['column_names'] = list(df.columns)

        ## Convert datetime to string so it can be displayed in the frontend #
        for i, t in enumerate(df.dtypes):
            if t.name == 'datetime64[ns]':
                df[df.columns[i]] = df[df.columns[i]
                                       ].dt.strftime('%Y-%m-%d %H:%M:%S')

        tableData['rows'] = df.values.tolist()
        # Modify data field of column with mime type of file/*. See note above
        # We chose to do this outside of the dataframe, but it can also be done with a dataframe
        # see https://stackoverflow.com/questions/41710501/is-there-a-way-to-have-a-dictionary-as-an-entry-of-a-pandas-dataframe-in-python #
        for i, t in enumerate(df.dtypes):
            if t.name in [CnextMimeType.FILEPNG, CnextMimeType.FILEJPG]:
                log.info('Load file for mime %s' % t.name)
                for r in range(df.shape[0]):
                    file_path = df[df.columns[i]].iloc[r]
                    log.info('Load file for mime %s path %s' %
                             (t.name, file_path))
                    tableData['rows'][r][i] = {
                        'file_path': file_path,
                        'binary': base64.b64encode(self._get_mime_file_content(file_path, t.name))
                    }

        tableData['index'] = {}
        tableData['index']['name'] = df.index.name
        tableData['index']['data'] = []
        if str(df.index.dtype) == 'datetime64[ns]':
            [tableData['index']['data'].append(str(idx)) for idx in df.index]
        else:
            tableData['index']['data'] = df.index.tolist()
        # log.info(tableData)
        return tableData

    def _create_countna_data(self, df_id, len, countna_series):
        countna = {}
        for k, v in countna_series.to_dict().items():
            countna[k] = {'na': v, 'len': len}
        return {'df_id': df_id, 'countna': countna}

    @ipython_internal
    def _get_count_na(self, df_id):
        output = None
        countna = self.user_space.execute(
            "%s.isna().sum()" % df_id, ExecutionMode.EVAL)
        len = self.user_space.execute(
            "%s.shape[0]" % df_id, ExecutionMode.EVAL)
        if (countna is not None) and (len is not None):
            log.info("get countna data")
            output = self._create_countna_data(df_id, len, countna)
        return output

    @ipython_internal
    def _get_table_data(self, df_id, code):
        output = None
        result = self.user_space.execute(code, ExecutionMode.EVAL)
        # print("get table data %s" % result)
        # log.info("get table data %s" % result)
        if result is not None:
            # log.info("get table data %s" % result)
            output = self._create_table_data(df_id, result)
        return output

    @ipython_internal
    def _get_metadata(self, df_id):
        shape = self.user_space.execute("%s.shape" % df_id, ExecutionMode.EVAL)
        dtypes = self.user_space.execute(
            "%s.dtypes" % df_id, ExecutionMode.EVAL)
        countna = self.user_space.execute(
            "%s.isna().sum()" % df_id, ExecutionMode.EVAL)
        describe = self.user_space.execute(
            "%s.describe(include='all')" % df_id, ExecutionMode.EVAL)
        columns = {}
        for col_name, ctype in dtypes.items():
            # FIXME: only get at most 100 values here, this is hacky, find a better way
            # unique = eval("%s['%s'].unique().tolist()"%(df_id, col_name), client_globals)[:100]
            unique = self.user_space.execute(
                "%s['%s'].unique().tolist()" % (df_id, col_name), ExecutionMode.EVAL)
            columns[col_name] = {'name': col_name, 'type': str(ctype.name), 'unique': unique,
                                 'describe': describe[col_name].to_dict(), 'countna': countna[col_name].item()}
        output = {'df_id': df_id, 'shape': shape, 'columns': columns}
        return output

    def handle_message(self, message):
        send_reply = False
        # message execution_mode will always be `eval` for this sender
        log.info('eval... %s' % message)
        # log.info('Globals: %s' % client_globals)
        try:
            if message.command_name == DFManagerCommand.plot_column_histogram:
                # result = eval(message.content, client_globals)
                result_messages = self.user_space.execute(
                    message.content, ExecutionMode.EVAL)
                # log.info("PLOT DATA", result_messages)
                result = IPythonKernel.get_execute_result_from_ipython(
                    result_messages)
                if result is not None:
                    output = self._create_plot_data(
                        message.metadata['df_id'], message.metadata['col_name'], result)
                    log.info("get plot data")
                    type = ContentType.RICH_OUTPUT
                    sub_type = SubContentType.PLOTLY_FIG
                    send_reply = True

            elif message.command_name == DFManagerCommand.plot_column_quantile:
                # result = eval(message.content, client_globals)
                result_messages = self.user_space.execute(
                    message.content, ExecutionMode.EVAL)
                # log.info("Plot Column Quantile", result_messages)
                result = IPythonKernel.get_execute_result_from_ipython(
                    result_messages)
                if result is not None:
                    log.info("get plot data")
                    output = self._create_plot_data(
                        message.metadata['df_id'], message.metadata['col_name'], result)
                    type = ContentType.RICH_OUTPUT
                    sub_type = SubContentType.PLOTLY_FIG
                    send_reply = True

            elif message.command_name == DFManagerCommand.get_table_data:
                # TODO: turn _df_manager to variable
                output_messages = self.user_space.execute("{}._get_table_data('{}', '{}')".format(
                    IPythonInteral.DF_MANAGER.value, message.metadata['df_id'], message.content))
                output = IPythonKernel.get_execute_result_from_ipython(
                    output_messages)
                if output is not None:
                    # log.info("get table data")
                    log.info('DFManagerCommand.get_table_data: %s' % output)
                    type = ContentType.PANDAS_DATAFRAME
                    sub_type = SubContentType.NONE
                    send_reply = True

            elif message.command_name == DFManagerCommand.get_countna:
                output_messages = self.user_space.execute(
                    "{}._get_count_na('{}')".format(IPythonInteral.DF_MANAGER.value, message.metadata['df_id']))
                output = IPythonKernel.get_execute_result_from_ipython(
                    output_messages)
                if output is not None:
                    log.info("get countna data")
                    # log.info('DFManagerCommand.get_countna: %s' % output)
                    type = ContentType.DICT
                    sub_type = SubContentType.NONE
                    send_reply = True

            elif message.command_name == DFManagerCommand.get_df_metadata:
                output_messages = self.user_space.execute(
                    "{}._get_metadata('{}')".format(IPythonInteral.DF_MANAGER.value, message.metadata['df_id']))
                output = IPythonKernel.get_execute_result_from_ipython(
                    output_messages)
                # log.info("get df metadata")
                log.info('DFManagerCommand.get_df_metadata: %s' % output)
                type = ContentType.DICT
                sub_type = SubContentType.NONE
                send_reply = True

            # elif message.command_name == DFManagerCommand.get_file_content:
            #     output, type, send_reply = self._get_file_content(message, client_globals)

            if send_reply:
                message.type = type
                message.sub_type = sub_type
                message.content = output
                message.error = False
                self._send_to_node(message)
        except:
            trace = traceback.format_exc()
            log.error("%s" % (trace))
            error_message = MessageHandler._create_error_message(
                message.webapp_endpoint, trace)
            self._send_to_node(error_message)
