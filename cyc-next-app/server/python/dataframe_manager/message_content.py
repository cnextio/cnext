import simplejson as json

class LoadFileMessageContent:
    def __init__(self, **entries): 
        self.file_path = None
        self.mime_type = None
        # self.project_path = None
        # self.file_type = None        
        self.__dict__.update(entries)
        # if self.file_type == None:
        #     self.file_type = self.file_path.split('.')[-1]
        
    def toJSON(self):        
        return json.dumps(self, default=lambda o: o.__dict__, ignore_nan=True)
    
    def __repr__(self) -> str:
        return self.toJSON()
