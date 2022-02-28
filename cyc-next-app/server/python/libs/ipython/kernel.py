import jupyter_client
import queue
from libs.ipython.constants import IPythonKernelConstants as IPythonConstants
from user_space.user_space import BaseKernel

from libs import logs
log = logs.get_logger(__name__)


# The following message types will be processed by code editor
MESSAGE_TYPE_PROCESS = [
    IPythonConstants.MessageType.DISPLAY_DATA,
    IPythonConstants.MessageType.ERROR,
    IPythonConstants.MessageType.EXECUTE_RESULT,
    IPythonConstants.MessageType.STREAM
]


class IPythonKernel(BaseKernel):

    def __init__(self):
        self.km = jupyter_client.KernelManager(
            kernel_name='python3'
        )
        self.km.start_kernel()
        self.kc = self.km.client()
        self.wait_for_ready()

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

    def execute(self, code, exec_mode=None):
        self.kc.execute(code)
        reply = self.kc.get_shell_msg(timeout=1)
        status = reply['content']['status']

        # Handle message is returned from shell socket by status
        if status == IPythonConstants.ShellMessageStatus.ERROR:
            traceback_text = reply['content']['traceback']
            log.info(traceback_text)
        elif status == IPythonConstants.ShellMessageStatus.OK:
            log.info('Shell returned: {}'.format(code))

        outputs = list()
        while True:
            # execution state must return message that include idle status before the queue becomes empty.
            # If not, there are some errors.
            # for more information: https://jupyter-client.readthedocs.io/en/master/messaging.html#messages-on-the-shell-router-dealer-channel
            try:
                # Increase timeout to make sure IPython return all messages
                msg = self.kc.get_iopub_msg(timeout=10)
                header = msg['header']
                content = msg['content']

                if header['msg_type'] == IPythonConstants.MessageType.STATUS:
                    if content['execution_state'] == IPythonConstants.ExecutionState.IDLE:
                        break
            except queue.Empty:
                # Break if queue empty
                break

            # Depend on message type, only process which one having result execute to display
            msg_type = header['msg_type']
            if msg_type in MESSAGE_TYPE_PROCESS:
                outputs.append(msg)
        return outputs
