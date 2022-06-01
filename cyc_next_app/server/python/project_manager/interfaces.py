import os
import simplejson as json

## path to the server config file #
SERVER_CONFIG_PATH = 'server.yaml'
## path to the workspace config file # 
WORKSPACE_CONFIG_PATH = 'workspace.yaml'
## name of the folder where cnext stores project related information #
CNEXT_PROJECT_FOLDER = '.cnext'
## name of the file where cnext stores project related config #
CNEXT_PROJECT_CONFIG_FILE = 'cnext.yaml'

class JsonSerializable:
    def __init__(self, obj):
        self.obj = obj

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, ignore_nan=True)

    def __repr__(self) -> str:
        return self.toJSON()

class DirMetatdata:
    # def __init__(self, **entries):
    #     self.path = None
    #     self.name = None
    #     self.is_file = None
    #     self.__dict__.update(entries)

    def __init__(self, path, name, is_file, deletable, timestamp):
        self.path = path
        self.name = name
        self.is_file = is_file
        self.deletable = deletable
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

    def __init__(self, path, name, timestamp=None, executor=False):
        self.path = path
        self.name = name
        # self.type = None
        self.executor = executor
        if timestamp != None:
            self.timestamp = timestamp

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, ignore_nan=True)

    def __repr__(self) -> str:
        return self.toJSON()


class FileContent:
    def __init__(self, content, code_lines=None, timestamp=None):
        # self.__dict__.update(locals())
        self.content = content
        self.code_lines = code_lines
        self.timestamp = timestamp

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, ignore_nan=True)

    def __repr__(self) -> str:
        return self.toJSON()


class ProjectMetadata(JsonSerializable):
    def __init__(self, **entries):
        self.path = None
        self.name = None
        self.id = None
        self.__dict__.update(entries)
        self.data_path = os.path.join(self.path, CNEXT_PROJECT_FOLDER)
        self.config_path = os.path.join(
            self.data_path, CNEXT_PROJECT_CONFIG_FILE)

    # def toJSON(self):
    #     return json.dumps(self, default=lambda o: o.__dict__, ignore_nan=True)

    # def __repr__(self) -> str:
    #     return self.toJSON()


# class ProjectMetadata(JsonSerializable):
#     def __init__(self, **entries):
#         self.id = None
#         self.name = None
#         self.path = None
#         self.__dict__.update(entries)


class WorkspaceInfo(JsonSerializable):
    """ Infomation about the projects added to this workspace
    """
    def __init__(self, config: dict):
        self.active_project = None
        self.open_projects = []
        # if 'projects' not in config:
        #     return
        projects_config = config#['projects']
        if 'active_project' in projects_config:
            self.active_project = projects_config['active_project']
        if 'open_projects' in projects_config and isinstance(projects_config['open_projects'], list):
            for project in projects_config['open_projects']:
                self.open_projects.append(ProjectMetadata(**project))
