import threading
import jupyter_client
import queue
import simplejson as json
from user_space.ipython.constants import IPythonConstants
# from user_space.user_space import BaseKernel
from cnext_libs.df_status_hook import DataFrameStatusHook

from libs import logs
log = logs.get_logger(__name__)


class IPythonKernel():
    def __init__(self):
        self.km = jupyter_client.KernelManager()
        self.km.start_kernel()
        self.kc = self.km.blocking_client()
        self.wait_for_ready()
        shell_msg_thread = threading.Thread(
            target=self.handle_ipython_stream, args=(IPythonConstants.StreamType.SHELL,), daemon=True)
        iobuf_msg_thread = threading.Thread(
            target=self.handle_ipython_stream, args=(IPythonConstants.StreamType.IOBUF,), daemon=True)
        shell_msg_thread.start()
        iobuf_msg_thread.start()
        self.message_handler_callback = None
        ## This lock is used to make sure only one execution is being executed at any moment in time #
        self.execute_lock = threading.Lock()
        self._reset_execution_complete_condition()

    def shutdown_kernel(self):
        if self.km.is_alive:
            self.kc.stop_channels()
            self.km.interrupt_kernel()
            self.km.shutdown_kernel(now=True)
            log.info('Shutdown kernel')

    def wait_for_ready(self):
        try:
            self.kc.wait_for_ready(timeout=50)
        except RuntimeError:
            self.shutdown_kernel()

    def _is_status_message(self, message):
        return message['header']['msg_type'] == 'status'

    def _reset_execution_complete_condition(self):
        self.shell_cond = False
        self.iobuf_cond = False

    def _set_execution_complete_condition(self, stream_type, message):
        if stream_type == IPythonConstants.StreamType.SHELL:
            self.shell_cond = message['header']['msg_type'] == 'execute_reply' and 'status' in message['content']
        if stream_type == IPythonConstants.StreamType.IOBUF:
            self.iobuf_cond = message['header']['msg_type'] == 'status' and message['content']['execution_state'] == 'idle'

    def _is_execution_complete(self, stream_type, message) -> bool:
        ## Look at the shell stream and check the status #
        return self.shell_cond and self.iobuf_cond

    def handle_ipython_stream(self, stream_type: IPythonConstants.StreamType):
        while True:
            ipython_message = None
            if stream_type == IPythonConstants.StreamType.SHELL:
                ipython_message = self.kc.get_shell_msg()
            elif stream_type == IPythonConstants.StreamType.IOBUF:
                ipython_message = self.kc.get_iopub_msg()

            if 'status' in ipython_message['content']:
                log.info('%s msg: msg_type = %s, status = %s' % (
                    stream_type, ipython_message['header']['msg_type'], ipython_message['content']['status']))
            elif ipython_message['header']['msg_type'] == 'status' or ipython_message['header']['msg_type'] == 'error':
                log.info('%s msg: msg_type = %s, content = %s' % (
                    stream_type, ipython_message['header']['msg_type'], ipython_message['content']))
            else:
                log.info('%s msg: msg_type = %s' % (
                    stream_type, ipython_message['header']['msg_type']))

            if ipython_message is not None and self.message_handler_callback is not None:
                self.message_handler_callback(
                    ipython_message, stream_type, self.client_message)

            ## unlock execute lock only after upstream has processed the data if messge is status #
            # if self._is_status_message(ipython_message) and ipython_message['content']['execution_state'] != 'busy' and self.execute_lock.locked():
            #     self.execute_lock.release()
            self._set_execution_complete_condition(
                stream_type, ipython_message)
            if self._is_execution_complete(stream_type, ipython_message):
                log.info('Execution completed')
                self.execute_lock.release()

    def execute(self, code, exec_mode=None, message_handler_callback=None, client_message=None):
        self.execute_lock.acquire()
        self._reset_execution_complete_condition()
        self.message_handler_callback = message_handler_callback
        self.client_message = client_message
        self.kc.execute(code)
