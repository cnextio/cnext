
export enum FileType {
    python = 'py',
    jupyter = 'ipy'
}

export enum FileStatus {
    edited = 'edited',
    saved = 'saved'
}

export enum ProjectCommand {
    list_dir = "list_dir",
    get_file_metadata = "get_file_metadata",
    read_file = "read_file",
    save_file = "save_file",
    create_file = "create_file",
    close_file = "close_file",
    open_file = "open_file",
    delete = "delete",
    set_name = "set_name",
    get_open_files = "get_open_files",
    create_folder = "create_folder",
    remove_folder = "remove_folder",
    set_working_dir = "set_working_dir",
    get_active_project = "get_active_project",
    save_state = "save_state",
    save_project_config = "save_project_config",
    get_project_config = "get_project_config",
};

export interface IFileMetadata {
    path: string;
    name: string;
    type: string;
    executor: boolean;
    timestamp: number;
    scroll_pos?: number;
}

export interface IProjectMetadata {
    path: string;
    name: string;
    id: string;
}

export interface IDirectoryMetadata {
    path: string;
    name: string;
    is_file: boolean;
}

export interface IDirListResult {
    id: string;
    dirs: IDirectoryMetadata[];
}

export enum FileContextMenuItem {
    NEW_FILE,
    NEW_FOLDER,
    RENAME,
    DELETE,
    DIVIDER,
};