from libs.json_serializable import JsonSerializable

class ModelInfo:
    def __init__(self, **entries):
        self.name = None
        self.id = None
        self.obj_class = None
        self.base_class = None
        self.__dict__.update(entries)

class NetronStatus:
    OK = 'ok'
    ERROR = 'error'