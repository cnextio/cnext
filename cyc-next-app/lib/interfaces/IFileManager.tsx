
export interface File {
    is_executor: boolean;
    type: FileType;
    name: string;
    path: string;
    status: FileStatus;
}

export enum FileType {
    python = 'py',
    jupyter = 'ipy'
}

export enum FileStatus {
    edited = 'edited',
    saved = 'saved'
}

export enum FileCommandName {  
    list_dir = 'list_dir',
    get_file_metadata = 'get_file_metadata',
    read_file = 'read_file',
    save_file = 'save_file',
    set_name = 'set_name',
    get_open_files = 'get_open_files',
    add_file = 'add_file',
    add_folder = 'add_folder',
    remove_file = 'remove_file',
    remove_folder = 'remove_folder',
    set_working_dir = 'set_working_dir'
};

export interface FileMetadata {
    path: string;
    name: string;
    type: string;
    executor: boolean;
    update_timestamp: string;
}