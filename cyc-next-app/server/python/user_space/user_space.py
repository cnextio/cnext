from enum import Enum
import cycdataframe.user_space as _cus
import cycdataframe.df_status_hook as _sh
from user_space.ipython.kernel import IPythonKernel
from user_space.ipython.constants import IPythonKernelConstants as IPythonConstants

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


class _UserSpace(_cus.UserSpace):
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
import cycdataframe.user_space as _cus
import cycdataframe.df_status_hook as _sh
import cycdataframe.cycdataframe as _cd
import pandas as _pd
from dataframe_manager import dataframe_manager_ipython as _dm

class _UserSpace(_cus.UserSpace):
    def __init__(self, df_types: list):
        super().__init__(df_types)

    def globals(self):
        return globals()

    def get_active_dfs_status(self):
        _sh.DataFrameStatusHook.update_all()
        if _sh.DataFrameStatusHook.is_updated():
            return _sh.DataFrameStatusHook.get_active_dfs_status()
        return None

    # def reset_active_dfs_status(self):
    #     _sh.DataFrameStatusHook.reset_active_df_status()        

_user_space = _UserSpace([_cd.DataFrame, _pd.DataFrame])  
_sh.DataFrameStatusHook.set_user_space(_user_space)
"""
            self.executor.execute(code)

        super().__init__(tracking_obj_types)

    def globals(self):
        return globals()

    def get_active_dfs_status(self):
        if isinstance(self.executor, BaseKernel):
            _sh.DataFrameStatusHook.update_all()
            if _sh.DataFrameStatusHook.is_updated():
                return _sh.DataFrameStatusHook.get_active_dfs_status()
            return None
        elif isinstance(self.executor, IPythonKernel):
            code = "_user_space.get_active_dfs_status()"
            outputs = self.executor.execute(code)
            log.info("IPythonKernel Outputs: %s" % outputs)
            result = [output['content']['data']['text/plain'] for output in outputs if output['header']
                      ['msg_type'] == IPythonConstants.MessageType.EXECUTE_RESULT]
            return result

    # def reset_active_dfs_status(self):
    #     if isinstance(self.executor, BaseKernel):
    #         _sh.DataFrameStatusHook.reset_active_dfs_status()
    #     elif isinstance(self.executor, IPythonKernel):
    #         code = "_user_space.reset_active_dfs_status()"
    #         self.executor.execute(code)

    def execute(self, code, exec_mode: ExecutionMode = None):
        # self.reset_active_dfs_status()
        return self.executor.execute(code, exec_mode)
