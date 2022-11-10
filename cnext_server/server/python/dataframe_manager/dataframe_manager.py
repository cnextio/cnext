import re
import requests
import base64
import collections
import itertools
import sys
import traceback
import simplejson as json
import copy
import time

from libs.message_handler import BaseMessageHandler
from libs.message import ContentType, DFManagerCommand, SubContentType
from libs.json_serializable import ipython_internal_output, JsonSerializable
from cnextlib.mime_types import CnextMimeType
from .dataframe import DataFrame

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

    def _is_jsonable(self, obj):
        try:
            json.dumps(obj)
            return True
        except (TypeError, OverflowError):
            return False

    def _convert_to_str_if_not_jsonable(self, df):
        for c in df.columns:
            for r in df.index:
                if not self._is_jsonable(df.at[r, c]):
                    df.at[r, c] = str(df.at[r, c])
        return df

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

        for i, t in enumerate(df.dtypes):
            if t.name not in [CnextMimeType.FILE_PNG, CnextMimeType.FILE_JPG,
                              CnextMimeType.URL_PNG, CnextMimeType.URL_JPG,
                              CnextMimeType.INPUT_SELECTION, CnextMimeType.INPUT_CHECKBOX, CnextMimeType.INPUT_TEXT]:
                ## Convert everything else to string #
                # df[df.columns[i]] = df[df.columns[i]].apply(str)
                df.loc[:, df.columns[i]] = df.loc[:, df.columns[i]].astype(str)

        tableData['rows'] = df.values.tolist()
        # Modify data field of column with mime type of file/*. See note above
        #  We chose to do this outside of the dataframe, but it can also be done with a dataframe
        #  see https://stackoverflow.com/questions/41710501/is-there-a-way-to-have-a-dictionary-as-an-entry-of-a-pandas-dataframe-in-python ##
        # log.info('Processing data type %s' % df.dtypes)
        for i, t in enumerate(df.dtypes):
            # log.info('Processing data type %s' % t.name)
            if t.name in [CnextMimeType.FILE_PNG, CnextMimeType.FILE_JPG]:
                log.info('Load file for mime %s' % t.name)
                for r in range(df.shape[0]):
                    file_path = df[df.columns[i]].iloc[r]
                    log.info('Load file for mime %s path %s' %
                             (t.name, file_path))
                    tableData['rows'][r][i] = {
                        'file_path': file_path,
                        'binary': base64.b64encode(self._get_file_content(file_path, t.name))
                    }
            elif t.name in [CnextMimeType.URL_PNG, CnextMimeType.URL_JPG]:
                log.info('Load url for mime %s' % t.name)
                for r in range(df.shape[0]):
                    url = df[df.columns[i]].iloc[r]
                    # response = requests.get(url)
                    # img = Image.open(BytesIO(response.content))
                    log.info('Load file for mime %s path %s' %
                             (t.name, url))
                    tableData['rows'][r][i] = {
                        'url': url,
                        # 'binary': base64.b64encode(response.content)
                    }
            elif t.name in [CnextMimeType.INPUT_SELECTION, CnextMimeType.INPUT_CHECKBOX, CnextMimeType.INPUT_TEXT]:
                log.info('Create table for mime %s' % t.name)
                for r in range(df.shape[0]):
                    tableData['rows'][r][i] = json.loads(
                        df[df.columns[i]].iloc[r])
                    # log.info('Create table for mime %s' % tableData['rows'][r][i])

        tableData['index'] = {}
        tableData['index']['name'] = df.index.name
        tableData['index']['data'] = []
        if re.search(r'datetime', str(df.index.dtype)):
            [tableData['index']['data'].append(str(idx)) for idx in df.index]
        else:
            tableData['index']['data'] = df.index.tolist()
        tableData['size'] = df.shape[0]
        # log.info(tableData)
        return tableData

    @ipython_internal_output
    def _ipython_get_table_data(self, df_id, df_type, filter, from_index, to_index):
        output = None
        self.user_space.execute(
            "print('Get table data for dataframe %s...')" % df_id, ExecutionMode.EVAL)
        dataframe = DataFrame(self.user_space, df_id, df_type)
        result = dataframe.get_table_data(filter, from_index, to_index)
        # print("get table data %s" % result)
        # log.info("get table data %s" % result)
        if result is not None:
            # log.info("get table data %s" % result)
            output = self._create_table_data(df_id, result)
        return output

    @ipython_internal_output
    def _ipython_get_metadata(self, df_id, df_type):
        self.user_space.execute(
            "print('Get metadata for dataframe %s...')" % df_id, ExecutionMode.EVAL)
        dataframe = DataFrame(self.user_space, df_id, df_type)
        shape, dtypes, countna, describe, nuniques = dataframe.get_metadata()
        uniques = dataframe.uniques(df_id, dtypes, nuniques)
        columns = dataframe.get_column_summary(
            dtypes, countna, describe, uniques)
        output = {'df_id': df_id, 'type': str(df_type),
                  'shape': shape, 'columns': columns, 'timestamp': time.time()}
        self.user_space.execute(
            "print('Done!')", ExecutionMode.EVAL)
        return output

    # this function is run inside ipython but we don't have to wrap it with ipython_internal_output
    # because the UDF inherits JsonSerializable already #
    # @ipython_internal_output
    def _ipython_get_registered_udfs(self):
        result = self.user_space.execute("{}.get_registered_udfs()".format(
            IPythonInteral.UDF_MODULE.value), ExecutionMode.EVAL)
        return result

    # def _process_error_message(self, ipython_message, client_message):
    #     # log.error("Error %s" % (msg_ipython.content['traceback']))
    #     if isinstance(ipython_message.content['traceback'], list):
    #         content = '\n'.join(ipython_message.content['traceback'])
    #     else:
    #         content = ipython_message.content['traceback']
    #     return self._create_error_message(
    #         client_message.webapp_endpoint, content, client_message.command_name, client_message.metadata)

    MAX_PLOTLY_SIZE = 1024*1024  # 1MB

    def _compute_udf(self, message):
        udf_name = message.content
        metadata = message.metadata
        df_id = metadata["df_id"]
        col_list = metadata["col_list"]

        for col_name in col_list:
            return_message = copy.deepcopy(message)
            return_message.metadata['col_name'] = col_name
            return_message.metadata['udf_name'] = udf_name
            executing_code = "{}.run_udf(\"{}\", \"{}\", \"{}\")".format(
                IPythonInteral.UDF_MODULE.value, udf_name, df_id, col_name)
            self.user_space.execute(
                executing_code, ExecutionMode.EVAL, self.message_handler_callback, return_message)

    def _create_return_message(self, ipython_message, stream_type, client_message):
        ipython_message = IpythonResultMessage(**ipython_message)
        message = Message(**{'webapp_endpoint': client_message.webapp_endpoint,
                             'command_name': client_message.command_name})
        # Add header message from ipython to message metadata
        message.metadata = {}
        message.metadata.update(client_message.metadata)
        message.metadata.update(dict((k, ipython_message.header[k])
                                     for k in ('msg_id', 'msg_type', 'session')))
        message.metadata.update({'stream_type': stream_type})

        if self._is_error_message(ipython_message.header):
            content = self._get_error_message_content(
                ipython_message)
            message = BaseMessageHandler._create_error_message(
                message.webapp_endpoint, content, message.command_name, message.metadata)
        elif self._is_stream_result(ipython_message.header):
            message = self._create_stream_message(message, ipython_message)
        else:
            result = self.get_execute_result(ipython_message)
            if result is not None:
                if client_message.command_name == DFManagerCommand.get_table_data:
                    log.info('%s: %s' % (client_message, result))
                    # log.info('%s ', message)
                    message.content = result
                    message.type = ContentType.PANDAS_DATAFRAME
                    message.sub_type = SubContentType.NONE

                elif client_message.command_name == DFManagerCommand.get_df_metadata:
                    log.info('%s: %s' % (client_message.command_name, result))
                    message.content = result
                    message.type = ContentType.DICT
                    message.sub_type = SubContentType.NONE

                elif client_message.command_name == DFManagerCommand.get_registered_udfs:
                    log.info('%s: %s' % (client_message.command_name, result))
                    message.content = result
                    message.type = ContentType.DICT
                    message.sub_type = SubContentType.NONE

                elif client_message.command_name == DFManagerCommand.compute_udf:
                    message.content = result
                    message.type = ContentType.RICH_OUTPUT
                    # message.sub_type = SubContentType.APPLICATION_PLOTLY

                message.error = False
            else:
                message = None

        return message

    def message_handler_callback(self, ipython_message, stream_type, client_message):
        try:
            # if self.request_metadata is not None:
            log.info('message_handler_callback: %s' % ipython_message)
            message = self._create_return_message(
                ipython_message=ipython_message, stream_type=stream_type, client_message=client_message)
            if message != None:
                log.info('Message: %s' % message.command_name)
                self._send_to_node(message)
        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))
            error_message = BaseMessageHandler._create_error_message(
                client_message.webapp_endpoint, trace, client_message.command_name, {})
            self._send_to_node(error_message)

    def handle_message(self, message):
        # send_reply = False
        # message execution_mode will always be `eval` for this sender
        log.info('Got message %s' % message)
        # log.info('Globals: %s' % client_globals)

        ## this step is important to make sure the query work properly in the backend #
        if (isinstance(message.content, str)):
            message.content = message.content.replace("'", '"')
        for key in message.metadata:
            if (isinstance(message.metadata[key], str)):
                message.metadata[key] = message.metadata[key].replace("'", '"')
                
        try:
            if self.user_space.is_alive():
                if message.command_name == DFManagerCommand.get_table_data:
                    # TODO: turn _df_manager to variable
                    self.user_space.execute("{}._ipython_get_table_data('{}', '{}', '{}', '{}', '{}')".format(
                        IPythonInteral.DF_MANAGER.value, message.metadata['df_id'], message.metadata['df_type'], 
                        message.metadata['filter'] if message.metadata['filter'] is not None else "", 
                        message.metadata['from_index'], message.metadata['to_index']), 
                        ExecutionMode.EVAL, self.message_handler_callback, message)

                elif message.command_name == DFManagerCommand.get_df_metadata:
                    self.user_space.execute("{}._ipython_get_metadata('{}', '{}')".format(
                        IPythonInteral.DF_MANAGER.value, message.metadata['df_id'], message.metadata['df_type']),
                         ExecutionMode.EVAL, self.message_handler_callback, message)

                elif message.command_name == DFManagerCommand.get_registered_udfs:
                    self.user_space.execute("{}._ipython_get_registered_udfs()".format(
                        IPythonInteral.DF_MANAGER.value), ExecutionMode.EVAL, self.message_handler_callback, message)

                elif message.command_name == DFManagerCommand.compute_udf:
                    self._compute_udf(message)

                elif message.command_name == DFManagerCommand.set_dataframe_cell_value:
                    ## Note: have to use single quote here because json.dumps will generate the double quote inside #
                    self.user_space.execute("{}.at[{}, \"{}\"] = \'{}\'".format(
                        message.content['df_id'], message.content['index'], message.content['col_name'], json.dumps(message.content['value'])), ExecutionMode.EVAL, self.message_handler_callback, message)

                elif message.command_name == DFManagerCommand.reload_df_status:
                    result = self.user_space.get_active_dfs_status()
                    if result["status"] == IPythonConstants.ShellMessageStatus.OK:
                        message = Message(**{"webapp_endpoint": WebappEndpoint.DataFrameManager, "command_name": DFManagerCommand.reload_df_status,
                                             "seq_number": 1, "type": "dict", "content": result["content"], "error": False})
                    else:
                        message = MessageHandler._create_error_message(
                            WebappEndpoint.DataFrameManager, result["content"], DFManagerCommand.update_df_status, {})
                    self._send_to_node(message)

            else:
                text = "No executor running"
                log.info(text)
                error_message = MessageHandler._create_error_message(
                    message.webapp_endpoint, text, message.command_name, {})
                self._send_to_node(error_message)

        except:
            trace = traceback.format_exc()
            log.error("%s" % (trace))
            error_message = MessageHandler._create_error_message(
                message.webapp_endpoint, trace, message.command_name)
            self._send_to_node(error_message)
