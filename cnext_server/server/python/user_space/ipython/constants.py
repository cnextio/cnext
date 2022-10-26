from enum import Enum

from libs.json_serializable import JsonSerializable


class IpythonResultMessage(JsonSerializable):
    def __init__(self, **entries):
        self.header = None
        self.msg_id = None
        self.msg_type = None
        self.parent_header = None
        self.metadata = None
        self.content = None
        self.buffers = None
        self.__dict__.update(entries)


class IPythonConstants:
    class MessageType(str, Enum):
        EXECUTE_REPLY = 'execute_reply'
        INPUT_REQUEST = 'input_request'
        INSPECT_REPLY = 'inspect_reply'
        COMPLETE_REPLY = 'complete_reply'
        HISTORY_REPLY = 'history_reply'
        IS_COMPLETE_REPLY = 'is_complete_reply'
        CONNECT_REPLY = 'connect_reply'
        COMM_INFO_REPLY = 'comm_info_reply'
        KERNEL_INFO_REPLY = 'kernel_info_reply'
        SHUTDOWN_REPLY = 'shutdown_reply'
        INTERRUPT_REPLY = 'interrupt_reply'
        DEBUG_REPLY = 'debug_reply'
        DISPLAY_DATA = 'display_data'
        UPDATE_DISPLAY_DATA = 'update_display_data'
        EXECUTE_INPUT = 'execute_input'
        EXECUTE_RESULT = 'execute_result'
        STREAM = 'stream'
        ERROR = 'error'
        STATUS = 'status'
        CLEAR_OUTPUT = 'clear_output'
        DEBUG_EVENT = 'debug_event'
        INPUT_REPLY = 'input_reply'

    class StreamType(str, Enum):
        IOBUF = 'iobuf'
        SHELL = 'shell'
        STDIN = 'stdin'
        CONTROL = 'control'

    class ShellMessageStatus(str, Enum):
        OK = 'ok'
        ERROR = 'error'
        IDLE = 'idle'

    class IOBufMessageStatus(str, Enum):
        OK = 'ok'
        ERROR = 'error'
        ABORT = 'abort'

    class ExecutionState(str, Enum):
        STARTING = 'starting'
        BUSY = 'busy'
        IDLE = 'idle'


class IPythonInteral(Enum):
    DF_MANAGER = '_df_manager'
    CASSIST = '_cassist'
    USER_SPACE = '_user_space'
    UDF_MODULE = '_udf'
