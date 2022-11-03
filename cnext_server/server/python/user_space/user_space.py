from enum import Enum
import threading
import traceback
import simplejson as json
from user_space.ipython.constants import IpythonResultMessage
from libs.message_handler import BaseMessageHandler
import cnextlib.user_space as _cus
import cnextlib.dataframe as _cd
import cnextlib.udf_manager as _udf_manager
from user_space.ipython.kernel import IPythonKernel
from user_space.ipython.constants import IPythonInteral, IPythonConstants

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

    def execute(self, code, exec_mode: ExecutionMode = None, userspace_globals=globals()):
        if exec_mode == None:
            exec_mode = self._assign_exec_mode(code)
        if exec_mode == ExecutionMode.EVAL:
            return eval(code, userspace_globals)
        elif exec_mode == ExecutionMode.EXEC:
            return exec(code, userspace_globals)


class IPythonUserSpace(_cus.UserSpace):
    ''' 
        Define the space where user code will be executed. 
        This is encapsulated in a python module so all the imports and variables are separated out from the rest.
        The code is executed on a kernel such as BaseKernel or IPythonKernel
    '''

    def __init__(self, tracking_df_types: tuple = (), tracking_model_types: tuple = ()):
        super().__init__(tracking_df_types, tracking_model_types)
        self.executor: IPythonKernel = IPythonKernel()
        self.execute_lock = threading.Lock()
        self.result = None
        self.client_message_handler_callback = None
        self.shell_cond = False
        self.iobuf_cond = False
        self.kernel_restarting = False
        self.kernel_interrupting = False

    def init_executor(self):
        code = """
import cnextlib.dataframe as _cd
import cnextlib.udf_manager as {_udf_manager}
import pandas as _pd
from dataframe_manager import dataframe_manager as _dm
from cassist import cassist as _ca
from user_space.user_space import BaseKernelUserSpace

## need to create a new _UserSpace class here so that the global() will be represent this module where all the execution are #
class _UserSpace(BaseKernelUserSpace):
    def globals(self):
        ## this needs to be redefined here #
        return globals()

{_user_space} = _UserSpace(tracking_df_types={_tracking_df_types}, tracking_model_types={_tracking_model_types})  
{_df_manager} = _dm.MessageHandler(None, {_user_space})
{_cassist} = _ca.MessageHandler(None, {_user_space})
""".format(_user_space=IPythonInteral.USER_SPACE.value,
           _df_manager=IPythonInteral.DF_MANAGER.value,
           _cassist=IPythonInteral.CASSIST.value,
           _tracking_df_types=self.tracking_df_types,
           _tracking_model_types=self.tracking_model_types,
           _udf_manager=IPythonInteral.UDF_MODULE.value)
        self.executor.execute(code)

    def globals(self):
        return globals()

    def _set_execution_complete_condition(self, condition: bool):
        self.shell_cond = condition
        self.iobuf_cond = condition

    def _set_execution_complete_condition_from_message(self, stream_type, message: IpythonResultMessage):
        if stream_type == IPythonConstants.StreamType.SHELL:
            self.shell_cond = message.header['msg_type'] == IPythonConstants.MessageType.EXECUTE_REPLY and 'status' in message.content
        if stream_type == IPythonConstants.StreamType.IOBUF:
            self.iobuf_cond = message.header['msg_type'] == IPythonConstants.MessageType.STATUS and message.content['execution_state'] == 'idle'

    def _is_execution_complete(self) -> bool:
        ## Look at the shell stream and check the status #
        return self.shell_cond and self.iobuf_cond

    def message_handler_callback(self, ipython_message, stream_type, client_message):
        try:
            ipython_message = IpythonResultMessage(**ipython_message)
            log.info('%s msg: %s %s' % (
                stream_type, ipython_message.header['msg_type'], ipython_message.content))

            if BaseMessageHandler._is_error_message(ipython_message.header):
                content = BaseMessageHandler._get_error_message_content(
                    ipython_message)
                ## borrow the status constant from ipython :) #
                self.result = {
                    "status": IPythonConstants.ShellMessageStatus.ERROR, "content": content}
                # if self.execute_lock.locked():
                #     self.execute_lock.release()
                #     log.info(
                #         'User_space execution lock released due to error in execution')
            else:
                if ipython_message.header['msg_type'] == IPythonConstants.MessageType.EXECUTE_RESULT:
                    self.result = {"status": IPythonConstants.ShellMessageStatus.OK, "content": json.loads(
                        ipython_message.content['data']['text/plain'])}

            self._set_execution_complete_condition_from_message(
                stream_type, ipython_message)

            if self.execute_lock.locked() and self._is_execution_complete():
                self.execute_lock.release()
                log.info('User_space execution lock released')
            # else:
            #     # TODO: log everything else
            #     log.info('Other messages: %s' % ipython_message)
        except:
            # this is internal exception, we won't send it to the client
            trace = traceback.format_exc()
            ## borrow the status constant from ipython :) #
            self.result = {
                "status": IPythonConstants.ShellMessageStatus.ERROR, "content": trace}
            if self.execute_lock.locked():
                self.execute_lock.release()
                log.info(
                    'User_space execution lock released due to error in exception')
            log.info("Exception %s" % (trace))

    def passthrough_message_handler_callback(self, ipython_message, stream_type, client_message):
        try:
            if self.client_message_handler_callback:
                self.client_message_handler_callback(
                    ipython_message, stream_type, client_message)

            ipython_message = IpythonResultMessage(**ipython_message)
            self._set_execution_complete_condition_from_message(
                stream_type, ipython_message)
            if self.execute_lock.locked() and self._is_execution_complete():
                self.execute_lock.release()
                log.info('User_space execution lock released')
        except:
            # this is internal exception, we won't send it to the client
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))
            if self.execute_lock.locked():
                self.execute_lock.release()
                log.info('Kernel execution lock released')

    def _result_waiting_execution(func):
        '''
        Wrapper to block the execution until the execution complete
        '''
        def _result_waiting_execution_wrapper(*args, **kwargs):
            ## args[0] is self #
            args[0].result = None
            log.info('User_space execution lock acquiring')
            args[0].execute_lock.acquire()
            log.info('User_space execution lock acquired before exec func')
            if args[0].kernel_restarting or args[0].kernel_interrupting:
                args[0].execute_lock.release()
                log.info('Kernel is being restarted or interupted . Abort!')
                return None            
            args[0]._set_execution_complete_condition(False)
            func(*args, **kwargs)
            ## wait for the lock being released in the message_handler_callback #
            args[0].execute_lock.acquire()
            log.info('User_space execution lock acquired after exec func')
            if args[0].kernel_restarting or args[0].kernel_interrupting:
                log.info('Kernel is being restarted or interupted . Abort!')
            args[0].execute_lock.release()
            log.info('User_space execution lock released')
            log.info("Results: %s" % args[0].result)
            return args[0].result
        return _result_waiting_execution_wrapper

    def _locked_execution(func):
        '''
        Wrapper to block the execution until the execution complete
        '''
        def _locked_execution_wrapper(*args, **kwargs):
            ## args[0] is self #
            log.info('User_space execution lock acquiring')
            args[0].execute_lock.acquire()
            log.info('User_space execution lock acquired before exec func')
            if args[0].kernel_restarting or args[0].kernel_interrupting:
                args[0].execute_lock.release()
                log.info('Kernel is being restarted or interupted . Abort!')
                return None
            args[0]._set_execution_complete_condition(False)
            func(*args, **kwargs)
            ## wait for the lock being released in the message_handler_callback #
            args[0].execute_lock.acquire()
            log.info('User_space execution lock acquired after exec func')
            if args[0].kernel_restarting or args[0].kernel_interrupting:
                log.info('Kernel is being restarted or interupted . Abort!')
            args[0].execute_lock.release()
            log.info('User_space execution lock released')
        return _locked_execution_wrapper

    @_result_waiting_execution
    def get_active_dfs_status(self):
        """ This function will be blocked until the execution completes and the result will be returned directly from here """
        """Generate the list of dfs status from execution
        Note: there might be multiple updates happened to a dataframe during multiline execution, 
        therefore the `result` will be a list.

        Returns:
            _type_: _description_
        """
        code = "{_user_space}.get_active_dfs_status()".format(
            _user_space=IPythonInteral.USER_SPACE.value)
        log.info('Code to execute %s' % code)
        self.executor.execute(code, None, self.message_handler_callback)

    @_result_waiting_execution
    def get_active_models_info(self):
        """ This function will be blocked until the execution completes and the result will be returned directly from here """
        code = "{_user_space}.get_active_models_info()".format(
            _user_space=IPythonInteral.USER_SPACE.value)
        log.info('Code to execute %s' % code)
        self.executor.execute(code, None, self.message_handler_callback)

    @_result_waiting_execution
    def get_registered_udfs(self):
        """ This function will be blocked until the execution completes and the result will be returned directly from here """
        code = "{_user_space}.get_registered_udfs()".format(
            _user_space=IPythonInteral.USER_SPACE.value)
        log.info('Code to execute %s' % code)
        self.executor.execute(code, None, self.message_handler_callback)

    def reset_active_dfs_status(self):
        code = "{_user_space}.reset_active_dfs_status()".format(
            _user_space=IPythonInteral.USER_SPACE.value)
        self.executor.execute(code)

    @_locked_execution
    def execute(self, code, exec_mode: ExecutionMode = None, message_handler_callback=None, client_message=None):
        self.reset_active_dfs_status()
        self.client_message_handler_callback = message_handler_callback
        return self.executor.execute(code, exec_mode, self.passthrough_message_handler_callback, client_message)

    def send_stdin(self, input_text):
        return self.executor.send_stdin(input_text)

    def start_executor(self, kernel_name: str):
        log.info('Starting jupyter kernel: %s' % kernel_name)
        self.executor.start_kernel(kernel_name)
        self.init_executor()
        if self.execute_lock.locked():
            self.execute_lock.release()
            log.info('User_space execution lock released')

    def shutdown_executor(self) -> bool:
        self.kernel_restarting = True
        result = self.executor.shutdown_kernel()
        if self.execute_lock.locked():
            self.execute_lock.release()
            log.info('User_space execution lock released')
        self.kernel_restarting = False
        return result

    def restart_executor(self):
        self.kernel_restarting = True
        if self.execute_lock.locked():
            self.execute_lock.release()
            log.info('User_space execution lock released for restarting')
        result = self.executor.restart_kernel()
        self.init_executor()        
        self.kernel_restarting = False
        return result

    def interrupt_executor(self):
        self.kernel_interrupting = True
        if self.execute_lock.locked():
            self.execute_lock.release()
            log.info('User_space execution lock released for interrupting')
        result = self.executor.interrupt_kernel()
        self.kernel_interrupting = False
        return result

    def is_alive(self):
        return self.executor.is_alive()

    def set_executor_working_dir(self, path):
        code = "import os; os.chdir('{}')".format(path)
        return self.executor.execute(code)


class BaseKernelUserSpace(_cus.UserSpace):
    ''' 
        Define the space where user code will be executed. 
        This is encapsulated in a python module so all the imports and variables are separated out from the rest.
        The code is executed on a kernel such as BaseKernel or IPythonKernel
    '''

    def __init__(self, tracking_df_types: tuple = (), tracking_model_types: tuple = ()):
        self.executor = BaseKernel()
        # need to set user space on DataFrameTracker, it does not work if set with DataFrame
        _cd.DataFrameTracker.set_user_space(self)
        _udf_manager.set_user_space(self)
        super().__init__(tracking_df_types, tracking_model_types)

    @classmethod
    def globals(cls):
        return globals()

    def execute(self, code, exec_mode: ExecutionMode = None):
        # this function is not called when using ipython
        # self.reset_active_dfs_status()
        return self.executor.execute(code, exec_mode, self.globals())

    def shutdown_executor(self):
        pass
