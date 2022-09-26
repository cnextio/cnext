import os
import platform
from pathlib import PureWindowsPath, PurePosixPath
import simplejson as json

## path to the server config file #
SERVER_CONFIG_PATH = 'server.yaml'
## path to the workspace config file #
WORKSPACE_METADATA_PATH = '../workspace.yaml'
## name of the folder where cnext stores project related information #
CNEXT_PROJECT_FOLDER = '.cnext'
## name of the file where cnext stores project related config #
CNEXT_PROJECT_METADATA_FILE = 'cnext.yaml'
## name of the setting file#
SETTINGS_FILE = 'config.json'


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


class FileMetadata(JsonSerializable):
    def __init__(self, **entries):
        self.path = None
        self.name = None
        # self.type = None
        self.executor = None
        self.timestamp = None
        self.__dict__.update(entries)

    # def __init__(self, path, name, timestamp=None, executor=False):
    #     self.path = path
    #     self.name = name
    #     # self.type = None
    #     self.executor = executor

    #     if timestamp != None:
    #         self.timestamp = timestamp

    # def toJSON(self):
    #     return json.dumps(self, default=lambda o: o.__dict__, ignore_nan=True)

    # def __repr__(self) -> str:
    #     return self.toJSON()


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
    def __init__(self, config):
        self.open_files = []
        self.open_order = []
        if 'open_files' in config and isinstance(config['open_files'], list):
            for file in config['open_files']:
                self.open_files.append(FileMetadata(**file))
        if 'open_order' in config and isinstance(config['open_order'], list) and len(config['open_order']) == len(self.open_files):
            self.open_order = config['open_order']
        else:
            self.open_order = [file.path for file in self.open_files]


class ProjectInfoInWorkspace(JsonSerializable):
    def __init__(self, **entries):
        self.path = None
        self.name = None
        self.id = None
        self.__dict__.update(entries)
        # self.data_path = os.path.join(self.path, CNEXT_PROJECT_FOLDER)
        # self.config_path = os.path.join(
        #     self.data_path, CNEXT_PROJECT_METADATA_FILE)


class WorkspaceMetadata(JsonSerializable):
    """ Infomation about the projects added to this workspace
    """

    def __init__(self, config: dict):
        self.active_project = None
        self.open_projects = []
        projects_config = config
        if 'active_project' in projects_config:
            self.active_project = projects_config['active_project']
        if 'open_projects' in projects_config and isinstance(projects_config['open_projects'], list):
            for project in projects_config['open_projects']:
                self.open_projects.append(ProjectInfoInWorkspace(**project))


class Platform:
    MAC = 'Darwin'
    LINUX = 'Linux'
    WINDOWNS = 'Windows'


def get_platform_path(path):
    if path == "":
        return path

    if platform.system() == Platform.WINDOWNS:
        return str(PureWindowsPath(path))
    else:
        return str(PurePosixPath(path))


class FileManagerMessageParams:
    def __init__(self, params: dict):
        self.norm_path = None
        self.norm_project_path = None
        self.open_order = []
        self.timestamp = None
        self.path = None
        self.project_path = None
        self.is_file = None

        if not isinstance(params, dict):
            return

        if 'path' in params.keys():
            self.path = get_platform_path(params['path'])
            # avoid creating `./` when the path is empty
            if params['path'] == "":
                self.norm_path = self.path
            else:
                self.norm_path = os.path.normpath(self.path)
        if 'project_path' in params.keys():
            self.project_path = get_platform_path(params['project_path'])
            self.norm_project_path = os.path.normpath(self.project_path)
        if 'open_order' in params.keys() and isinstance(params['open_order'], list):
            self.open_order = params['open_order']
        if 'timestamp' in params.keys():
            self.timestamp = params['timestamp']
        if 'is_file' in params.keys():
            self.is_file = params['is_file']
