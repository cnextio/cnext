import yaml
import logging
import traceback 
from multipledispatch import dispatch
import simplejson as json
from enum import Enum

logging.basicConfig(filename='./log.txt', filemode='a', format='%(asctime)s,%(msecs)d %(name)s %(funcName)s %(levelname)s %(message)s', 
                        datefmt='%H:%M:%S', level=logging.DEBUG)
log = logging.getLogger(__name__)

class WebappEndpoint(str, Enum):
    DFManager = 'DFManager'
    CodeEditor = 'CodeEditor'
    FileManager = 'FileManager'

    def __str__(self):
        return str(self.value)
    
    def __repr__(self):
        return str(self.value)    

class CommandName(str, Enum):
    active_df_status = 'active_df_status'
    plot_column_histogram = 'plot_column_histogram'
    get_countna = 'get_countna'
    plot_countna = 'plot_countna'  
    get_table_data = 'get_table_data'
    get_df_metadata = 'get_df_metadata'
    plot_column_quantile = 'plot_column_quantile'
    
    def __str__(self):
        return str(self.value)
    
    def __repr__(self):
        return str(self.value)  

class FileCommandName(str, Enum):  
    list_dir = 'list_dir'
    get_file_metadata = 'get_file_metadata'
    read_file = 'read_file'
    save_file = 'save_file'
    set_name = 'set_name'
    get_open_files = 'get_open_files'
    add_file = 'add_file'
    add_folder = 'add_folder'
    remove_file = 'remove_file'
    remove_folder = 'remove_folder'
    set_working_dir = 'set_working_dir'

class ContentType(str, Enum):  
    COMMAND = 'command'
    STRING = 'str'
    DICT = 'dict'
    PANDAS_DATAFRAME = 'pandas_dataframe'
    PLOTLY_FIG = 'plotly_fig'
    DIR_LIST = 'dir_list',
    FILE_METADATA = 'file_metadata',
    FILE_CONTENT = 'file_content',
    NONE = 'none'

    def __str__(self):
        return str(self.value)    
    
    def __repr__(self):
        return str(self.value) 

class Message:
    def __init__(self, **entries): 
        self.webapp_endpoint = None
        self.command_name = None
        self.seq_number = None
        self.content_type = None
        self.content = None
        self.error = None
        self.metadata = None
        self.__dict__.update(entries)
        
    def toJSON(self):        
        return json.dumps(self, default=lambda o: o.__dict__, ignore_nan=True)
    
    def __repr__(self) -> str:
        return self.toJSON()

class FileMetadata:
    def __init__(self, **entries): 
        self.path = None
        self.name = None
        self.type = None
        self.executor = None
        self.update_timestamp = None
        self.__dict__.update(entries) 
    
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, ignore_nan=True)

    def __repr__(self) -> str:
        return self.toJSON()