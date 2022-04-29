from enum import Enum
import threading
import traceback
import simplejson as json
from zmq import PROTOCOL_ERROR_ZMTP_MALFORMED_COMMAND_MESSAGE
import cnext_libs.user_space as _cus
import cnext_libs.df_status_hook as _sh
from user_space.ipython.kernel import IPythonKernel
from user_space.ipython.constants import IPythonInteral, IPythonConstants as IPythonConstants

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


class UserSpace(_cus.UserSpace):
    ''' 
        Define the space where user code will be executed. 
        This is encapsulated in a python module so all the imports and variables are separated out from the rest.
        The code is executed on a kernel such as BaseKernel or IPythonKernel
    '''

    def __init__(self, executor, tracking_obj_types: list):
        self.executor = executor

        log.info('Executor %s %s' % (executor, type(executor)))

        if isinstance(executor, BaseKernel):
            _sh.DataFrameStatusHook.set_user_space(self)
        elif isinstance(executor, IPythonKernel):
            code = """
import cnext_libs.user_space as _cus
import cnext_libs.df_status_hook as _sh
import cnext_libs.cycdataframe as _cd
import pandas as _pd
from dataframe_manager import dataframe_manager as _dm
from cassist import cassist as _ca
from user_space.user_space import ExecutionMode

class _UserSpace(_cus.UserSpace):
    def __init__(self, df_types: list):
        super().__init__(df_types)

    def globals(self):
        return globals()

    def get_active_dfs_status(self):
        _sh.DataFrameStatusHook.update_all()
        # if _sh.DataFrameStatusHook.is_updated():
        return _sh.DataFrameStatusHook.get_active_dfs_status()
        # return None

    def reset_active_dfs_status(self):
        _sh.DataFrameStatusHook.reset_active_dfs_status()        

    def execute(self, code, exec_mode: ExecutionMode = ExecutionMode.EVAL):
        if exec_mode == ExecutionMode.EVAL:
            return eval(code)
        elif exec_mode == ExecutionMode.EXEC:    
            return exec(code)
    
{_user_space} = _UserSpace([_cd.DataFrame, _pd.DataFrame])  
{_df_manager} = _dm.MessageHandler(None, {_user_space})
{_cassist} = _ca.MessageHandler(None, {_user_space})
_sh.DataFrameStatusHook.set_user_space({_user_space})
""".format(_user_space=IPythonInteral.USER_SPACE.value,
                _df_manager=IPythonInteral.DF_MANAGER.value,
                _cassist=IPythonInteral.CASSIST.value)

            self.executor.execute(code)
            self.execution_lock = threading.Lock()
            self.result = None

        super().__init__(tracking_obj_types)

    def globals(self):
        return globals()

    def _complete_execution_message(self, message) -> bool:
        return message['header']['msg_type'] == 'execute_reply' and 'status' in message['content']

    def message_handler_callback(self, ipython_message, stream_type, client_message):
        try:
            log.info('%s msg: %s %s' % (
                stream_type, ipython_message['header']['msg_type'], ipython_message['content']))
            # log.info('%s msg: msg_type = %s' % (
            #     stream_type, ipython_message['header']['msg_type']))
            if ipython_message['header']['msg_type'] == IPythonConstants.MessageType.EXECUTE_RESULT:
                self.result = json.loads(
                    ipython_message['content']['data']['text/plain'])
            elif self._complete_execution_message(ipython_message) and self.execution_lock.locked():
                self.execution_lock.release()
                log.info('Execution unlocked')
            else:
                # TODO: log everything else
                log.info('Other messages: %s' % ipython_message)
        except:
            ## this is internal exception, we won't send it to the client
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))

    def _get_active_dfs_status_ipython(self):
        """ This function will be blocked until the execution completes and the result will be returned directly from here """
        self.execution_lock.acquire()
        log.info('Execution locked')
        code = "{user_space}.get_active_dfs_status()".format(
            user_space=IPythonInteral.USER_SPACE.value)
        log.info('Code to execute %s' % code)
        self.executor.execute(code, None, self.message_handler_callback)
        # will wait here until the execution complete then return the result 
        # acquire the lock to wait for the result, then release it right away #
        self.execution_lock.acquire()
        self.execution_lock.release()
        log.info("Results: %s" % self.result)
        return self.result

    def get_active_dfs_status(self):
        """Generate the list of dfs status from execution
        Note: there might be multiple updates happened to a dataframe during multiline execution, 
        therefore the `result` will be a list.

        Returns:
            _type_: _description_
        """
        if isinstance(self.executor, BaseKernel):
            _sh.DataFrameStatusHook.update_all()
            return _sh.DataFrameStatusHook.get_active_dfs_status()
        elif isinstance(self.executor, IPythonKernel):
            return self._get_active_dfs_status_ipython()

    def reset_active_dfs_status(self):
        if isinstance(self.executor, BaseKernel):
            _sh.DataFrameStatusHook.reset_active_dfs_status()
        elif isinstance(self.executor, IPythonKernel):
            code = "_user_space.reset_active_dfs_status()"
            self.executor.execute(code)

    def execute(self, code, exec_mode: ExecutionMode = None, message_handler_callback=None, client_message=None):
        self.reset_active_dfs_status()
        return self.executor.execute(code, exec_mode, message_handler_callback, client_message)
