from enum import Enum


# class IpythonResultMessage:
#     def __init__(self, **entries):
#         self.header = None
#         self.msg_id = None
#         self.msg_type = None
#         self.parent_header = None
#         self.metadata = None
#         self.content = None
#         self.buffers = None
#         self.__dict__.update(entries)

#     def toJSON(self):
#         return json.dumps(self, indent=4, sort_keys=True, default=str)

#     def __repr__(self) -> str:
#         return self.toJSON()

class IPythonKernelConstants:
    class MessageType(str, Enum):
        EXECUTE_REPLY = 'execute_reply'
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
        EXECUTE_RESULT = 'exectue_result'
        STREAM = 'stream'
        ERROR = 'error'
        STATUS = 'status'
        CLEAR_OUTPUT = 'clear_output'
        DEBUG_EVENT = 'debug_event'
        INPUT_REPLY = 'input_reply'

    class ShellMessageStatus(str, Enum):
        OK = 'ok'
        ERROR = 'error'
        IDLE = 'idle'

    class ExecutionState(str, Enum):
        STARTING = 'starting'
        BUSY = 'busy'
        IDLE = 'idle'


MIME_TYPES = {
    'image/svg+xml': 'svg',
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    # 'text/plain': 'text',
    'text/html': 'html',
    'application/javascript': 'html',
    'application/json': 'json'
}
