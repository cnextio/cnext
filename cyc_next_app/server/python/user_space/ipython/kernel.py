import threading
import jupyter_client
import queue
import simplejson as json
from user_space.ipython.constants import IPythonConstants
# from user_space.user_space import BaseKernel
from cycdataframe.df_status_hook import DataFrameStatusHook

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

    def handle_ipython_stream(self, stream_type: IPythonConstants.StreamType):
        while True:
            ipython_message = None
            if stream_type == IPythonConstants.StreamType.SHELL:
                ipython_message = self.kc.get_shell_msg()
            elif stream_type == IPythonConstants.StreamType.IOBUF:
                ipython_message = self.kc.get_iopub_msg()
            if ipython_message is not None and self.message_handler_callback is not None:                
                if self.request_metadata:
                    self.request_metadata.update({'stream_type': stream_type})
                else:
                    self.request_metadata = {'stream_type': stream_type}
                self.message_handler_callback(
                    ipython_message, self.request_metadata)
            log.info('%s msg: %s %s' % (
                stream_type, ipython_message['header']['msg_type'], ipython_message['content']))

    def execute(self, code, exec_mode=None, message_handler_callback=None, request_metadata=None):
        self.kc.execute(code)
        self.message_handler_callback = message_handler_callback
        self.request_metadata = request_metadata
        # reply = self.kc.get_shell_msg()
        # status = reply['content']['status']

        # # Handle message is returned from shell socket by status
        # if status == IPythonConstants.ShellMessageStatus.ERROR:
        #     traceback_text = reply['content']['traceback']
        #     log.info(traceback_text)
        # elif status == IPythonConstants.ShellMessageStatus.OK:
        #     # If shell message status is ok, add command code to ouput list to reponse to client
        #     outputs.append(reply)
        #     log.info('Shell returned: {}'.format(reply))

        # while True:
        #     # execution state must return message that include idle status before the queue becomes empty.
        #     # If not, there are some errors.
        #     # for more information: https://jupyter-client.readthedocs.io/en/master/messaging.html#messages-on-the-shell-router-dealer-channel
        #     try:
        #         msg = self.kc.get_iopub_msg()
        #         header = msg['header']
        #         content = msg['content']

        #         if header['msg_type'] == IPythonConstants.MessageType.STATUS:
        #             if content['execution_state'] == IPythonConstants.ExecutionState.IDLE:
        #                 break
        #     except queue.Empty:
        #         # Break if queue empty
        #         break
        #     outputs.append(msg)
        # return outputs
