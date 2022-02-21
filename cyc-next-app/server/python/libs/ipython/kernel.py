import jupyter_client
import queue
from libs.ipython.constants import IPythonKernelConstants as IPythonConstants
from user_space.user_space import BaseKernel

from libs import logs
log = logs.get_logger(__name__)


# MIME_TYPES = {
#     'image/svg+xml': 'svg',
#     'image/jpeg': 'jpeg',
#     'image/png': 'png',
#     'text/plain': 'text',
#     'text/html': 'html',
#     'application/javascript': 'html',
#     'application/json': 'json'
# }


class IPythonKernel(BaseKernel):
    def __init__(self):
        self.km = jupyter_client.KernelManager(
            kernel_name='python3'
        )
        self.km.start_kernel()
        self.kc = self.km.client()
        self.wait_for_ready()

    def shutdown_kernel(self):
        self.kc.stop_channels()
        self.km.shutdown_kernel(now=True)
        log.info('Shutdown kernel')

    def wait_for_ready(self):
        try:
            self.kc.wait_for_ready(timeout=60)
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
        exec_success = False
        while True:
            # execution state must return message that include idle status before the queue becomes empty.
            # If not, there are some errors.
            # for more information: https://jupyter-client.readthedocs.io/en/master/messaging.html#messages-on-the-shell-router-dealer-channel
            try:
                msg = self.kc.get_iopub_msg(timeout=1)
                header = msg['header']
                content = msg['content']

                if header['msg_type'] == IPythonConstants.MessageType.STATUS:
                    if content['execution_state'] == IPythonConstants.ExecutionState.IDLE:
                        exec_success = True
                        break
            except queue.Empty:
                # Break if queue empty
                break
            outputs.append(msg)
        if exec_success:
            return outputs
