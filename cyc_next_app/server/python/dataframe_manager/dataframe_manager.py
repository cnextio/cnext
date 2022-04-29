import requests
import base64
import collections
import itertools
import sys
import traceback

from libs.message_handler import BaseMessageHandler
from libs.message import ContentType, DFManagerCommand, SubContentType
from libs.json_serializable import ipython_internal_output, JsonSerializable
from cnext_libs.mime_types import CnextMimeType

from libs import logs
from libs.message import Message, WebappEndpoint
from user_space.ipython.constants import IPythonInteral, IPythonConstants, IpythonResultMessage
from user_space.ipython.kernel import IPythonKernel
from user_space.user_space import ExecutionMode
log = logs.get_logger(__name__)


def total_size(o, handlers={}, verbose=False):
    """ Returns the approximate memory footprint an object and all of its contents.

    Automatically finds the contents of the following builtin containers and
    their subclasses:  tuple, list, deque, dict, set and frozenset.
    To search other containers, add handlers to iterate over their contents:

        handlers = {SomeContainerClass: iter,
                    OtherContainerClass: OtherContainerClass.get_elements}

    """
    def dict_handler(d): return itertools.chain.from_iterable(d.items())
    all_handlers = {tuple: iter,
                    list: iter,
                    collections.deque: iter,
                    dict: dict_handler,
                    set: iter,
                    frozenset: iter,
                    }
    all_handlers.update(handlers)     # user handlers take precedence
    seen = set()                      # track which object id's have already been seen
    # estimate sizeof object without __sizeof__
    default_size = sys.getsizeof(0)

    def sizeof(o):
        if id(o) in seen:       # do not double count the same object
            return 0
        seen.add(id(o))
        s = sys.getsizeof(o, default_size)

        if verbose:
            print(s, type(o), repr(o), file=sys.stderr)

        for typ, handler in all_handlers.items():
            if isinstance(o, typ):
                s += sum(map(sizeof, handler(o)))
                break
        return s

    return sizeof(o)


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue,  user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    def _get_file_content(self, file_path, mime_type):
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
        #  We chose to do this outside of the dataframe, but it can also be done with a dataframe
        #  see https://stackoverflow.com/questions/41710501/is-there-a-way-to-have-a-dictionary-as-an-entry-of-a-pandas-dataframe-in-python ##
        for i, t in enumerate(df.dtypes):
            if t.name in [CnextMimeType.FILE_PNG, CnextMimeType.FILE_JPG, CnextMimeType.FILE_JPEG]:
                log.info('Load file for mime %s' % t.name)
                for r in range(df.shape[0]):
                    file_path = df[df.columns[i]].iloc[r]
                    log.info('Load file for mime %s path %s' %
                             (t.name, file_path))
                    tableData['rows'][r][i] = {
                        'file_path': file_path,
                        'binary': base64.b64encode(self._get_file_content(file_path, t.name))
                    }
            elif t.name in [CnextMimeType.URL_PNG, CnextMimeType.URL_JPG, CnextMimeType.URL_JPEG]:
                log.info('Load file for mime %s' % t.name)
                for r in range(df.shape[0]):
                    url = df[df.columns[i]].iloc[r]
                    response = requests.get(url)
                    # img = Image.open(BytesIO(response.content))
                    log.info('Load file for mime %s path %s' %
                             (t.name, url))
                    tableData['rows'][r][i] = {
                        'url': url,
                        'binary': base64.b64encode(response.content)
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

    @ipython_internal_output
    def _get_table_data(self, df_id, code):
        output = None
        result = self.user_space.execute(code, ExecutionMode.EVAL)
        # print("get table data %s" % result)
        # log.info("get table data %s" % result)
        if result is not None:
            # log.info("get table data %s" % result)
            output = self._create_table_data(df_id, result)
        return output

    @ipython_internal_output
    def _get_metadata(self, df_id):
        shape = self.user_space.execute("%s.shape" % df_id, ExecutionMode.EVAL)
        dtypes = self.user_space.execute(
            "%s.dtypes" % df_id, ExecutionMode.EVAL)
        countna = self.user_space.execute(
            "%s.isna().sum()" % df_id, ExecutionMode.EVAL)
        describe = self.user_space.execute(
            "%s.describe(include='all')" % df_id, ExecutionMode.EVAL)
        columns = {}
        MAX_UNIQUE_LENGTH = 1000
        for col_name, ctype in dtypes.items():
            unique = self.user_space.execute(
                "%s['%s'].unique().tolist()" % (df_id, col_name), ExecutionMode.EVAL)
            # only send unique list that has length smaller than MAX_UNIQUE_LENGTH
            if len(unique) > MAX_UNIQUE_LENGTH:
                unique = []
            columns[col_name] = {'name': col_name, 'type': str(ctype.name), 'unique': unique,
                                 'describe': describe[col_name].to_dict(), 'countna': countna[col_name].item()}
        output = {'df_id': df_id, 'shape': shape, 'columns': columns}
        return output

    MAX_PLOTLY_SIZE = 1024*1024  # 1MB

    def _create_return_message(self, ipython_message, stream_type, client_message):
        result = self.get_execute_result(ipython_message)
        if result is not None:
            ipython_message = IpythonResultMessage(**ipython_message)
            message = Message(**{'webapp_endpoint': WebappEndpoint.DFManager,
                                 'command_name': client_message.command_name})
            # Add header message from ipython to message metadata
            if message.metadata == None:
                message.metadata = {}
            message.metadata.update(client_message.metadata)
            message.metadata.update(dict((k, ipython_message.header[k])
                                         for k in ('msg_id', 'msg_type', 'session')))
            message.metadata.update({'stream_type': stream_type})

            if client_message.command_name == DFManagerCommand.plot_column_histogram:
                if total_size(result) < MessageHandler.MAX_PLOTLY_SIZE:
                    message.content = result
                    message.type = ContentType.RICH_OUTPUT
                    message.sub_type = SubContentType.APPLICATION_PLOTLY
                else:
                    message.content = "Warning: column histogram plot size is bigger than 1MB -> discard it"
                    message.type = ContentType.STRING
                    message.sub_type = SubContentType.NONE
                message.error = False

            elif client_message.command_name == DFManagerCommand.plot_column_quantile:
                message.content = result
                message.type = ContentType.RICH_OUTPUT
                message.sub_type = SubContentType.APPLICATION_PLOTLY
                message.error = False

            elif client_message.command_name == DFManagerCommand.get_table_data:
                log.info('DFManagerCommand.get_table_data: %s' % result)
                message.content = result
                message.type = ContentType.PANDAS_DATAFRAME
                message.sub_type = SubContentType.NONE
                message.error = False

            elif client_message.command_name == DFManagerCommand.get_df_metadata:
                log.info('DFManagerCommand.get_df_metadata: %s' % result)
                message.content = result
                message.type = ContentType.DICT
                message.sub_type = SubContentType.NONE
                message.error = False
            
            return message
        
    def message_handler_callback(self, ipython_message, stream_type, client_message):
        try:
            # if self.request_metadata is not None:
            message = self._create_return_message(
                ipython_message=ipython_message, stream_type=stream_type, client_message=client_message)
            log.info('Message: %s' % message)
            if message != None:                
                self._send_to_node(message)
        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))
            error_message = BaseMessageHandler._create_error_message(
                client_message.webapp_endpoint, trace, {})
            self._send_to_node(error_message)

    def handle_message(self, message):
        # send_reply = False
        # message execution_mode will always be `eval` for this sender
        log.info('Got message %s' % message)
        # log.info('Globals: %s' % client_globals)

        ## this step is important to make sure the query work properly in the backend #
        if (isinstance(message.content, str)):
            message.content = message.content.replace("'", '"')

        try:
            if message.command_name == DFManagerCommand.plot_column_histogram:
                # result = eval(message.content, client_globals)
                self.user_space.execute(
                    message.content, ExecutionMode.EVAL, self.message_handler_callback, message)

            elif message.command_name == DFManagerCommand.plot_column_quantile:
                self.user_space.execute(
                    message.content, ExecutionMode.EVAL, self.message_handler_callback, message)

            elif message.command_name == DFManagerCommand.get_table_data:
                # TODO: turn _df_manager to variable
                self.user_space.execute("{}._get_table_data('{}', '{}')".format(
                    IPythonInteral.DF_MANAGER.value, message.metadata['df_id'], message.content), ExecutionMode.EVAL, self.message_handler_callback, message)

            elif message.command_name == DFManagerCommand.get_df_metadata:
                self.user_space.execute("{}._get_metadata('{}')".format(
                    IPythonInteral.DF_MANAGER.value, message.metadata['df_id']), ExecutionMode.EVAL, self.message_handler_callback, message)

            elif message.command_name == DFManagerCommand.reload_df_status:
                active_df_status = self.user_space.get_active_dfs_status()
                active_df_status_message = Message(**{"webapp_endpoint": WebappEndpoint.DFManager, "command_name": message.command_name,
                                                      "seq_number": 1, "type": "dict", "content": active_df_status, "error": False})
                self._send_to_node(active_df_status_message)

        except:
            trace = traceback.format_exc()
            log.error("%s" % (trace))
            error_message = MessageHandler._create_error_message(
                message.webapp_endpoint, trace)
            self._send_to_node(error_message)
