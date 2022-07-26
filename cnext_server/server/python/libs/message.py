import simplejson as json
from enum import Enum

# logging.basicConfig(filename='./log.txt', filemode='a', format='%(asctime)s,%(msecs)d %(name)s %(funcName)s %(levelname)s %(message)s',
#                         datefmt='%H:%M:%S', level=logging.DEBUG)
# log = logging.getLogger(__name__)


class WebappEndpoint(str, Enum):
    DFManager = 'DFManager'
    CodeEditor = 'CodeEditor'
    FileManager = 'FileManager'
    MagicCommandGen = 'MagicCommandGen'
    FileExplorer = 'FileExplorer'
    ExperimentManager = 'ExperimentManager'
    KernelManager = 'KernelManager'
    ModelManager = 'ModelManager'
    Terminal = 'Terminal'
    
    def __str__(self):
        return str(self.value)

    def __repr__(self):
        return str(self.value)


class DFManagerCommand(str, Enum):
    update_df_status = 'update_df_status'
    reload_df_status = 'reload_df_status'
    plot_column_histogram = 'plot_column_histogram'
    get_countna = 'get_countna'
    plot_countna = 'plot_countna'
    get_table_data = 'get_table_data'
    get_df_metadata = 'get_df_metadata'
    plot_column_quantile = 'plot_column_quantile'
    get_cardinal = 'get_cardinal'
    get_file_content = 'get_file_content'

    def __str__(self):
        return str(self.value)

    def __repr__(self):
        return str(self.value)


class ProjectCommand(str, Enum):
    list_dir = 'list_dir'
    get_file_metadata = 'get_file_metadata'
    read_file = 'read_file'
    save_file = 'save_file'
    close_file = 'close_file'
    open_file = 'open_file'
    set_name = 'set_name'
    get_open_files = 'get_open_files'
    create_file = 'create_file'
    create_folder = 'create_folder'
    delete = 'delete'
    remove_file = 'remove_file'
    remove_folder = 'remove_folder'
    set_working_dir = 'set_working_dir'
    set_project_dir = 'set_project_dir'
    # get_active_project = 'get_active_project'
    save_state = 'save_state'
    save_project_settings = 'save_project_settings'
    get_project_settings = 'get_project_settings'
    add_project = 'add_project'
    list_projects = 'list_projects'
    get_workspace_metadata = 'get_workspace_metadata'
    set_workspace_metadata = 'set_workspace_metadata'
    set_active_project = 'set_active_project'


class ExperimentManagerCommand(str, Enum):
    list_experiments = 'list_experiments'
    list_run_infos = 'list_run_infos'
    get_metric_plots = 'get_metric_plots'
    load_artifacts_to_local = "load_artifacts_to_local"
    set_tracking_uri = 'set_tracking_uri'
    ## get data for a list of runs #
    get_runs_data = 'get_runs_data'


class KernelManagerCommand(str, Enum):
    restart_kernel = 'restart_kernel'
    interrupt_kernel = 'interrupt_kernel'


class ModelManagerCommand(str, Enum):
    get_active_models_info = 'get_active_models_info'
    display_model = 'display_model'

class JupyterServerCommand(str, Enum):
    get_config = 'get_jupyter_server_config'

class CodeEditorCommand(str, Enum):
    exec_line = 'exec_line'
    exec_grouped_lines = 'exec_grouped_lines'


class ContentType(str, Enum):
    COMMAND = 'command'
    STRING = 'str'
    DICT = 'dict'
    BINARY = 'binary'
    PANDAS_DATAFRAME = 'pandas_dataframe'
    DIR_LIST = 'dir_list'
    FILE_METADATA = 'file_metadata'
    PROJECT_METADATA = 'project_metadata'
    FILE_CONTENT = 'file_content'
    COLUMN_CARDINAL = 'column_cardinal'
    RICH_OUTPUT = 'rich_output'
    PLOTLY_FIG = 'plotly_fig'  # It is used for code editor basekernel
    IPYTHON_MSG = 'ipython_msg'
    PROJECT_LIST = 'project_list'
    WORKSPACE_METADATA = 'workspace_metadata'
    NONE = 'none'

    def __str__(self):
        return str(self.value)

    def __repr__(self):
        return str(self.value)


class SubContentType(str, Enum):
    IMAGE_PLOTLY = 'image/plotly+json'
    IMAGE_SVG = 'image/svg+xml'
    IMAGE_PNG = 'image/png'
    IMAGE_JPG = 'image/jpg'
    TEXT_HTML = 'text/html'
    APPLICATION_JSON = 'application/json'
    APPLICATION_CNEXT = 'application/cnext+json'
    APPLICATION_PLOTLY = 'application/vnd.plotly.v1+json'

    NONE = 'none'

    def __str__(self):
        return str(self.value)

    def __repr__(self):
        return str(self.value)


class CommandType(str, Enum):
    MFLOW = 'mlflow'  # use mlflow object to call the function #
    MLFLOW_CLIENT = 'mlflow_client'  # use mlflow.client object to call the function #
    # commands that requires more than standard mlflow api #
    MLFLOW_OTHERS = 'mlflow_others'

    def __str__(self):
        return str(self.value)

    def __repr__(self):
        return str(self.value)


class Message:
    def __init__(self, **entries):
        self.webapp_endpoint = None
        self.command_name = None
        self.seq_number = None
        self.type = None
        self.sub_type = None
        self.content = None
        self.error = None
        self.metadata = None
        self.__dict__.update(entries)

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, ignore_nan=True)

    def __repr__(self) -> str:
        return self.toJSON()


class ExecutorType(str, Enum):
    CODE = 'code'
    NONCODE = 'noncode'
