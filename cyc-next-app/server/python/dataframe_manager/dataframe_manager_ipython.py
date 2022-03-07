import base64
import traceback
import simplejson as json
from libs.message_handler import BaseMessageHandler
from libs.message import ContentType, DFManagerCommand, SubContentType
from cycdataframe.mime_types import CnextMimeType

from libs import logs
from user_space.user_space import ExecutionMode
log = logs.get_logger(__name__)


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue,  user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    # TODO: unify this with _create_plot_data
    def _create_plot_data(self, df_id, col_name, result):
        return {'df_id': df_id, 'col_name': col_name, 'plot': result.to_json()}

    @classmethod
    def _get_mime_file_content(file_path, mime_type):
        with open(file_path, 'rb') as file:
            return file.read()

    @staticmethod
    def _create_table_data(df_id, df):
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
                        'binary': base64.b64encode(MessageHandler._get_mime_file_content(file_path, t.name))
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

    @staticmethod
    def _create_countna_data(df_id, len, countna_series):
        countna = {}
        for k, v in countna_series.to_dict().items():
            countna[k] = {'na': v, 'len': len}
        return {'df_id': df_id, 'countna': countna}
    
    @staticmethod
    def _get_count_na(df_id):
        output = None
        countna = eval("%s.isna().sum()" % df_id)
        len = eval("%s.shape[0]" % df_id)
        if (countna is not None) and (len is not None):
            log.info("get countna data")
            output = MessageHandler._create_countna_data(df_id, len, countna)
        return json.dumps(output, ignore_nan=True)

    @staticmethod
    def _get_table_data(df_id, code):
        output = None
        result = eval(code)
        if result is not None:
            log.info("get table data %s" % result)
            output = MessageHandler._create_table_data(df_id, result)
        return json.dumps(output, ignore_nan=True)

    @staticmethod
    def _get_metadata(df_id):
        print(1111111111111)
        shape = eval("%s.shape" % df_id)
        dtypes = eval("%s.dtypes" % df_id)
        countna = eval("%s.isna().sum()" % df_id)
        describe = eval("%s.describe(include='all')" % df_id)
        columns = {}
        for col_name, ctype in dtypes.items():
            # print(col_name, ctype)
            # FIXME: only get at most 100 values here, this is hacky, find a better way
            # unique = eval("%s['%s'].unique().tolist()"%(df_id, col_name), client_globals)[:100]
            unique = eval("%s['%s'].unique().tolist()" % (df_id, col_name))
            columns[col_name] = {'name': col_name, 'type': str(ctype.name), 'unique': unique,
                                 'describe': describe[col_name].to_dict(), 'countna': countna[col_name].item()}
        output = {'df_id': df_id, 'shape': shape, 'columns': columns}        
        return json.dumps(output, ignore_nan=True)

    def handle_message(self, message):
        send_reply = False
        # message execution_mode will always be `eval` for this sender
        log.info('eval... %s' % message)
        # log.info('Globals: %s' % client_globals)
        try:
            if message.command_name == DFManagerCommand.plot_column_histogram:
                # result = eval(message.content, client_globals)
                result = self.user_space.execute(
                    message.content, ExecutionMode.EVAL)
                if result is not None:
                    log.info("get plot data")
                    output = self._create_plot_data(
                        message.metadata['df_id'], message.metadata['col_name'], result)
                    # type = ContentType.PLOTLY_FIG
                    type = ContentType.RICH_OUTPUT
                    sub_type = SubContentType.PLOTLY_FIG
                    send_reply = True

            elif message.command_name == DFManagerCommand.plot_column_quantile:
                # result = eval(message.content, client_globals)
                result = self.user_space.execute(
                    message.content, ExecutionMode.EVAL)
                if result is not None:
                    log.info("get plot data")
                    output = self._create_plot_data(
                        message.metadata['df_id'], message.metadata['col_name'], result)
                    # type = ContentType.PLOTLY_FIG
                    type = ContentType.RICH_OUTPUT
                    sub_type = SubContentType.PLOTLY_FIG
                    send_reply = True

            elif message.command_name == DFManagerCommand.get_table_data:
                output = self.user_space.execute(
                    "_dm.MessageHandler._get_table_data('{}', message.content)".format(message.metadata['df_id']))
                if output is not None:
                    type = ContentType.PANDAS_DATAFRAME
                    sub_type = SubContentType.NONE
                    send_reply = True

            elif message.command_name == DFManagerCommand.get_countna:
                output = self.user_space.execute(
                    "_dm.MessageHandler._get_count_na('{}')".format(message.metadata['df_id']))
                if output is not None:
                    log.info("get countna data")
                    type = ContentType.DICT
                    sub_type = SubContentType.NONE
                    send_reply = True

            elif message.command_name == DFManagerCommand.get_df_metadata:
                # output = self.user_space.execute(
                #     "_dm.MessageHandler._get_metadata('{}')".format(message.metadata['df_id']))
                output = self.user_space.execute(
                    "print('something')")
                print('OUTPUTTTTTTTT', output)
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
