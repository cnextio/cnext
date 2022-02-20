from enum import Enum
import cycdataframe.cycdataframe as cd


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
