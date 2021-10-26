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
    DataFrameManager = 'DataFrameManager'
    CodeEditorComponent = 'CodeEditorComponent'

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

    def __str__(self):
        return str(self.value)
    
    def __repr__(self):
        return str(self.value)  

class ContentType(str, Enum):  
    str = 'str'
    dict = 'dict'
    pandas_dataframe = 'pandas_dataframe'
    plotly_fig = 'plotly_fig'
    none = 'none'

    def __str__(self):
        return str(self.value)    
    
    def __repr__(self):
        return str(self.value) 

class Message:
    # @dispatch(str, str, int, str, str, bool, dict)
    # def __init__(self, webapp_endpoint, command_name, seq_number, content_type, content, error, metadata={}):
    #     self.webapp_endpoint = webapp_endpoint
    #     self.command_name = command_name
    #     self.seq_number = seq_number
    #     self.content_type = content_type
    #     self.content = content
    #     self.error = error
    #     self.metadata = metadata

    # @dispatch(dict)
    def __init__(self, **entries): 
        self.webapp_endpoint = None
        self.command_name = None
        self.seq_number = None
        self.content_type = None
        self.content = None
        self.error = None
        self.metadata = None
        self.__dict__.update(entries)
        
    def __repr__(self):        
        return json.dumps({
            "webapp_endpoint": self.webapp_endpoint,
            "command_name": self.command_name, 
            "seq_number": self.seq_number,
            "content_type": self.content_type, 
            "content": self.content, 
            "error": self.error,
            "metadata": self.metadata
        }, ignore_nan=True)
    
    # def __str__(self):
    #     return self.__repr__()        