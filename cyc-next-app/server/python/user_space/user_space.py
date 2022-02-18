from enum import Enum

from hamcrest import empty
import cycdataframe.cycdataframe as cd
import jupyter_client
from jupyter_client.manager import run_kernel
import queue
from user_space.ipython import IPythonKernelConstants as IPythonConstants

from libs import logs
log = logs.get_logger(__name__)


class ExecutionMode(Enum):
    EVAL = 0
    EXEC = 1


class BaseKernel:
    def __init__(self) -> None:
        pass

    def _assign_exec_mode(self, code):
        exec_mode = 'eval'
        try:
            compile(code, '<stdin>', 'eval')
        except SyntaxError as error:
            log.error(error)
            exec_mode = 'exec'

        log.info("assigned command type: %s" % exec_mode)
        return exec_mode

    def execute(self, code, exec_mode: ExecutionMode = None):
        if exec_mode == None:
            exec_mode = self._assign_exec_mode(code)

        if exec_mode == ExecutionMode.EVAL:
            return eval(code, globals())
        elif exec_mode == ExecutionMode.EXEC:
            return exec(code, globals())


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

    @staticmethod
    def _is_execute_result(header) -> bool:
        return header['msg_type'] == IPythonConstants.MessageType.EXECUTE_RESULT

    @staticmethod
    def _is_stream_result(header) -> bool:
        return header['msg_type'] == IPythonConstants.MessageType.STREAM

    def execute(self, code, exec_mode: ExecutionMode = None):
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
            # If not, there is some errors.
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

            if self._is_execute_result(header):
                outputs.append(content['data'])
            if self._is_stream_result(header):
                outputs.append(content['text'])

        if exec_success:
            return outputs


class UserSpace:
    ''' 
        Define the space where user code will be executed. 
        This is encapsulated in a python module so all the imports and variables are separated out from the rest.
        The code is executed on a kernel such as BaseKernel or IPythonKernel
    '''

    def __init__(self, executor: BaseKernel):
        self.executor = executor
        pass

    def execute(self, code, exec_mode: ExecutionMode = None):
        return self.executor.execute(code, exec_mode)

    def get_global_df_list(self):
        names = list(globals())
        df_list = []
        for name in names:
            if type(globals()[name]) == cd.DataFrame:
                df_list.append((name, id(globals()[name])))
        log.info('Current global df list: %s' % df_list)
        return df_list
