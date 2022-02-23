from enum import Enum
import cycdataframe.user_space as cus
from typing import Tuple, List


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


class UserSpace(cus.UserSpace):
    ''' 
        Define the space where user code will be executed. 
        This is encapsulated in a python module so all the imports and variables are separated out from the rest.
        The code is executed on a kernel such as BaseKernel or IPythonKernel
    '''

    def __init__(self, executor: BaseKernel, df_types: list):
        self.executor = executor
        super().__init__(df_types)

    def globals(self):
        return globals()

    def execute(self, code, exec_mode: ExecutionMode = None):
        return self.executor.execute(code, exec_mode)

    # def get_df_list(self):
    #     names = list(globals())
    #     df_list = []
    #     for name in names:
    #         if type(globals()[name]) == cd.DataFrame:
    #             df_list.append((name, id(globals()[name])))
    #     log.info('Current global df list: %s' % df_list)
    #     return df_list

    # def get_df_list(self, df_types: list) -> List[Tuple[str, str, str]]:
    #     """
    #     Get a list of data frame with type in `df_types` from `user_space`

    #     Args:
    #         df_types (list): a list of interested data frames types which can be either cycai.DataFrame or pandas.DataFrame

    #     Returns:
    #         list: list of data frame with the following information (name, id, type)
    #     """
    #     user_space = globals()
    #     names = list(user_space)
    #     df_list: List[Tuple[str, str, str]] = []

    #     for name in names:
    #         if type(user_space[name]) in df_types:
    #             df_list.append((name, id(user_space[name]), str(type(user_space[name]))))
    #     log.info('Current global df list: %s' % df_list)
    #     return df_list
