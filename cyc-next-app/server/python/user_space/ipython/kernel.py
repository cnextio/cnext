import jupyter_client
import queue
import simplejson as json
from user_space.ipython.constants import IPythonKernelConstants as IPythonConstants
# from user_space.user_space import BaseKernel
from cycdataframe.df_status_hook import DataFrameStatusHook

from libs import logs
log = logs.get_logger(__name__)


class IPythonKernel():

    def __init__(self):
        self.km = jupyter_client.KernelManager()
        self.km.start_kernel()
        # Set blocking client is important, It execute python line by line then response exactly flow result to client
        # It also block the response messages from IPython. The IPython messages are only created when execution finish.
        # Example:
        # import time
        # time.sleep(60)
        # print("Run after sleeping")
        # Without blocking client, the print command will be executed immediately without waiting 60s.
        # After command print is executed, Ipython generates the messages and returns it to the client.
        self.kc = self.km.blocking_client()
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
        outputs = list()
        self.kc.execute(code)
        reply = self.kc.get_shell_msg()
        status = reply['content']['status']

        # Handle message is returned from shell socket by status
        if status == IPythonConstants.ShellMessageStatus.ERROR:
            traceback_text = reply['content']['traceback']
            log.info(traceback_text)
        elif status == IPythonConstants.ShellMessageStatus.OK:
            # If shell message status is ok, add command code to ouput list to reponse to client
            outputs.append(reply)
            log.info('Shell returned: {}'.format(reply))

        while True:
            # execution state must return message that include idle status before the queue becomes empty.
            # If not, there are some errors.
            # for more information: https://jupyter-client.readthedocs.io/en/master/messaging.html#messages-on-the-shell-router-dealer-channel
            try:
                msg = self.kc.get_iopub_msg()
                header = msg['header']
                content = msg['content']

                if header['msg_type'] == IPythonConstants.MessageType.STATUS:
                    if content['execution_state'] == IPythonConstants.ExecutionState.IDLE:
                        break
            except queue.Empty:
                # Break if queue empty
                break
            outputs.append(msg)
        return outputs

    @staticmethod
    def get_execute_result(messages):
        """
            Get execute result with text plain from list of messages are responsed by IPython kernel
        """
        result = None
        for message in messages:
            if message['header']['msg_type'] == IPythonConstants.MessageType.EXECUTE_RESULT:
                if message['content']['data']['text/plain'] is not None:
                    result = message['content']['data']['text/plain']
            elif message['header']['msg_type'] == IPythonConstants.MessageType.STREAM:
                if 'text' in message['content']:
                    result = message['content']['text']
            elif message['header']['msg_type'] == IPythonConstants.MessageType.DISPLAY_DATA:
                if 'application/json' in message['content']['data']:
                    result = message['content']['data']['application/json']
        return result
