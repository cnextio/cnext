import threading
import traceback
import jupyter_client
import queue
import simplejson as json
from user_space.ipython.constants import IPythonConstants
# from user_space.user_space import BaseKernel
# from cnextlib.df_status_hook import DataFrameStatusHook

from libs import logs
log = logs.get_logger(__name__)


class IPythonKernel():
    """
        Use singleton pattern for this class to make sure only one Ipython Kernel is running during the application alive.
        Just call get_instance() method to get the IPython kernel.
    """

    _instance = None

    @staticmethod
    def get_instance():
        if IPythonKernel._instance == None:
            IPythonKernel()
        return IPythonKernel._instance

    def __init__(self):
        self.km = jupyter_client.KernelManager()
        self.km.start_kernel()
        self.kc = self.km.blocking_client()
        self.wait_for_ready()
        self.shell_msg_thread = threading.Thread(
            target=self.handle_ipython_stream, args=(IPythonConstants.StreamType.SHELL,), daemon=True)
        self.iobuf_msg_thread = threading.Thread(
            target=self.handle_ipython_stream, args=(IPythonConstants.StreamType.IOBUF,), daemon=True)
        self.shell_msg_thread.start()
        self.iobuf_msg_thread.start()
        self.message_handler_callback = None
        ## This lock is used to make sure only one execution is being executed at any moment in time #
        self.execute_lock = threading.Lock()
        IPythonKernel._instance = self

    def shutdown_kernel(self):
        try:
            if self.km.is_alive():
                self.kc.stop_channels()
                # self.km.interrupt_kernel()
                self.km.shutdown_kernel(now=True)
                log.info('Shutdown kernel')
        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))

    def interupt_kernel(self):
        try:
            if self.km.is_alive():
                self.km.interrupt_kernel()
                log.info('Interupt kernel')
        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))

    def wait_for_ready(self):
        try:
            self.kc.wait_for_ready(timeout=50)
        except RuntimeError:
            self.interrupt_kernel()

    def _is_status_message(self, message):
        return message['header']['msg_type'] == 'status'

    def _complete_execution_message(self, message) -> bool:
        return message['header']['msg_type'] == 'execute_reply' and 'status' in message['content']

    def handle_ipython_stream(self, stream_type: IPythonConstants.StreamType):
        try:
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
        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))

    def execute(self, code, exec_mode=None, message_handler_callback=None, client_message=None):
        self.execute_lock.acquire()
        self.message_handler_callback = message_handler_callback
        self.client_message = client_message
        self.kc.execute(code)
