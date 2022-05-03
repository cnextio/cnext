from enum import Enum
import threading
import traceback
import simplejson as json
import cnextlib.user_space as _cus
import cnextlib.dataframe as _cd
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
        self.executor: IPythonKernel = IPythonKernel()
        code = """
import cnextlib.dataframe as _cd
import pandas as _pd
import torch as _to
import tensorflow as _tf
from dataframe_manager import dataframe_manager as _dm
from cassist import cassist as _ca
from user_space.user_space import BaseKernelUserSpace

class _UserSpace(BaseKernelUserSpace):
    def globals(self):
        return globals()
    
{_user_space} = _UserSpace((_cd.DataFrame, _pd.DataFrame), (_to.nn.Module, _tf.keras.Model))  
{_df_manager} = _dm.MessageHandler(None, {_user_space})
{_cassist} = _ca.MessageHandler(None, {_user_space})
""".format(_user_space=IPythonInteral.USER_SPACE.value,
                _df_manager=IPythonInteral.DF_MANAGER.value,
                _cassist=IPythonInteral.CASSIST.value)
            # log.info(code)
        self.executor.execute(code)
        self.execution_lock = threading.Lock()
        self.result = None
        super().__init__(tracking_df_types, tracking_model_types)

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
            # this is internal exception, we won't send it to the client
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))

    def _result_waiting_execution(func):
        '''
        Wrapper to block the execution until the execution complete
        '''
        def _result_waiting_execution_wrapper(*args, **kwargs):
            args[0].execution_lock.acquire()
            log.info('Execution locked')
            func(*args, **kwargs)
            args[0].execution_lock.acquire()
            args[0].execution_lock.release()
            log.info("Results: %s" % args[0].result)
            return args[0].result
        return _result_waiting_execution_wrapper

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

    def reset_active_dfs_status(self):
        code = "{_user_space}.reset_active_dfs_status()".format(
            _user_space=IPythonInteral.USER_SPACE.value)
        self.executor.execute(code)

    def execute(self, code, exec_mode: ExecutionMode = None, message_handler_callback=None, client_message=None):
        self.reset_active_dfs_status()
        return self.executor.execute(code, exec_mode, message_handler_callback, client_message)

    def shutdown(self):        
        self.executor.shutdown_kernel()
        self.execution_lock.release()

class BaseKernelUserSpace(_cus.UserSpace):
    ''' 
        Define the space where user code will be executed. 
        This is encapsulated in a python module so all the imports and variables are separated out from the rest.
        The code is executed on a kernel such as BaseKernel or IPythonKernel
    '''
    def __init__(self, tracking_df_types: tuple = (), tracking_model_types: tuple = ()):
        self.executor = BaseKernel()
        _cd.DataFrame.set_user_space(self)
        super().__init__(tracking_df_types, tracking_model_types)

    def globals(self):
        return globals()

    def execute(self, code, exec_mode: ExecutionMode = None):
        self.reset_active_dfs_status()
        return self.executor.execute(code, exec_mode, self.globals())
    
    def shutdown():
        pass
