import base64
import traceback
from libs.message_handler import BaseMessageHandler
from libs.message import ContentType, DFManagerCommand, SubContentType
from cnextlib.mime_types import CnextMimeType
import simplejson as json

from libs import logs
from user_space.user_space import ExecutionMode
log = logs.get_logger(__name__)


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue,  user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    #TODO: unify this with _create_plot_data
    def _create_plot_data(self, df_id, col_name, result):
        return {'df_id': df_id, 'col_name': col_name, 'plot': result.to_json()}

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
        log.info('DF Columns', df.columns)
        tableData['column_names'] = list(df.columns)

        ## Convert datetime to string so it can be displayed in the frontend #
        for i, t in enumerate(df.dtypes):
            if t.name == 'datetime64[ns]':
                df[df.columns[i]] = df[df.columns[i]
                                       ].dt.strftime('%Y-%m-%d %H:%M:%S')

        tableData['rows'] = df.values.tolist()
        ## Modify data field of column with mime type of file/*. See note above
        # We chose to do this outside of the dataframe, but it can also be done with a dataframe
        # see https://stackoverflow.com/questions/41710501/is-there-a-way-to-have-a-dictionary-as-an-entry-of-a-pandas-dataframe-in-python #
        for i, t in enumerate(df.dtypes):
            if t.name in [CnextMimeType.FILE_PNG, CnextMimeType.FILE_JPG]:
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

    # def _get_file_content(self, message, client_globals):
    #     message_content: LoadFileMessageContent = LoadFileMessageContent(message.content)
    #     file_content = None
    #     with open(message_content.file_path, 'rb') as file:
    #         file_content = file.read()
    #     output = {'file_content': file_content, 'mime_type': message_content.mime_type}
    #     return output, ContentType.BINARY, True

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

    def _get_table_data(self, df_id, code):
        output = None
        result = self.user_space.execute(code, ExecutionMode.EVAL)
        if result is not None:
            log.info("get table data %s" % result)
            output = self._create_table_data(df_id, result)
        return output

    def _get_metadata(self, df_id):
        shape = self.user_space.execute(
            "%s.shape" % df_id, ExecutionMode.EVAL)
        dtypes = self.user_space.execute(
            "%s.dtypes" % df_id, ExecutionMode.EVAL)
        countna = self.user_space.execute(
            "%s.isna().sum()" % df_id, ExecutionMode.EVAL)
        describe = self.user_space.execute(
            "%s.describe(include='all')" % df_id, ExecutionMode.EVAL)
        columns = {}
        for col_name, ctype in dtypes.items():
            # print(col_name, ctype)
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
                result = self.user_space.executor.execute(
                    message.content, ExecutionMode.EVAL)
                if result is not None:
                    log.info("get plot data")
                    output = self._create_plot_data(
                        message.metadata['df_id'], message.metadata['col_name'], result)
                    # type = ContentType.PLOTLY_FIG
                    type = ContentType.RICH_OUTPUT
                    sub_type = SubContentType.IMAGE_PLOTLY
                    send_reply = True

            elif message.command_name == DFManagerCommand.plot_column_quantile:
                # result = eval(message.content, client_globals)
                result = self.user_space.executor.execute(
                    message.content, ExecutionMode.EVAL)
                if result is not None:
                    log.info("get plot data")
                    output = self._create_plot_data(
                        message.metadata['df_id'], message.metadata['col_name'], result)
                    # type = ContentType.PLOTLY_FIG
                    type = ContentType.RICH_OUTPUT
                    sub_type = SubContentType.IMAGE_PLOTLY
                    send_reply = True

            elif message.command_name == DFManagerCommand.get_table_data:
                output = self._get_table_data(
                    message.metadata['df_id'], message.content)
                if output is not None:
                    type = ContentType.PANDAS_DATAFRAME
                    sub_type = SubContentType.NONE
                    send_reply = True

            elif message.command_name == DFManagerCommand.get_countna:
                output = self._get_count_na(message.metadata['df_id'])
                if output is not None:
                    log.info("get countna data")
                    type = ContentType.DICT
                    sub_type = SubContentType.NONE
                    send_reply = True

            elif message.command_name == DFManagerCommand.get_df_metadata:
                output = self._get_metadata(message.metadata['df_id'])
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
                message.webapp_endpoint, trace, message.command_name)
            self._send_to_node(error_message)
