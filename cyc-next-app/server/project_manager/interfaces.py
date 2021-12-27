import simplejson as json

class DirMetatdata:
    # def __init__(self, **entries): 
    #     self.path = None
    #     self.name = None
    #     self.is_file = None
    #     self.__dict__.update(entries) 
    
    def __init__(self, path, name, is_file, timestamp): 
        self.path = path
        self.name = name
        self.is_file = is_file
        self.timestamp = timestamp

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, ignore_nan=True)

    def __repr__(self) -> str:
        return self.toJSON() 

class FileMetadata:
    # def __init__(self, **entries): 
    #     self.path = None
    #     self.name = None
    #     # self.type = None
    #     self.executor = None
    #     self.timestamp = None
    #     self.__dict__.update(entries) 
    
    def __init__(self, path, name, timestamp, executor=False): 
        self.path = path
        self.name = name
        # self.type = None
        self.executor = executor
        self.timestamp = timestamp

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, ignore_nan=True)

    def __repr__(self) -> str:
        return self.toJSON()

class FileContent:
    def __init__(self, content, timestamp=None): 
        self.content = content
        self.timestamp = timestamp

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, ignore_nan=True)

    def __repr__(self) -> str:
        return self.toJSON()

class ProjectMetadata:
    def __init__(self, **entries): 
        self.path = None
        self.name = None
        self.id = None
        self.__dict__.update(entries) 
    
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, ignore_nan=True)

    def __repr__(self) -> str:
        return self.toJSON()  