import React from "react";
import { ProjectCommand, IFileMetadata, IDirectoryMetadata } from "./IFileManager";
import { IGetCardinalResult } from "./ICAssist";
import { ExperimentManagerCommand } from "./IExperimentManager";

export type RecvCodeOutput = (output: Message) => void;

// export interface CodeOutput {
//     type: string;
//     content: string;
// };

export interface Message {
    webapp_endpoint: string; // the web client component which sends 
														 // and/or receives this message    
    command_name: CommandName|ProjectCommand|ExperimentManagerCommand;    // 'code_area_command'|'updated_dataframe_list'|
														 // 'plot_column_histogram'|'plot_count_na'|
														 // 'query_data'|'row_difference'|'column_difference' 
	seq_number?: number;      // sequence number of the command. This is needed 
														 // for commands that requires more than one command
    type: ContentType|CommandType;    // the object type of the output content
    content: string|object|IFileMetadata|IFileMetadata[]|IGetCardinalResult|IDirectoryMetadata|null;  // the command string and output string|object
    error?: boolean;
    metadata?: object;            // store info about the dataframe and columns 
                             // related to this command
};

export enum UpdateType {
    add_cols = 'add_cols',
    del_cols = 'del_cols',
    add_rows = 'add_rows',
    del_rows = 'del_rows',
    update_cells = 'update_cells',
    new_index = 'update_index',
    new_df = 'new_df',
    no_update = 'no_update',
}

// export interface DataTableContent {
//     name: string;
//     column_names: string[];
//     rows: ((string|number)[])[];
// };

export enum CommandName {  
    exec_line = 'exec_line',
    exec_grouped_lines = 'exec_grouped_lines',
    active_df_status = 'active_df_status',
    plot_column_histogram = 'plot_column_histogram',
    get_countna = 'get_countna',
    plot_countna = 'plot_countna',
    get_table_data = 'get_table_data',
    get_df_metadata = 'get_df_metadata',
    plot_column_quantile = 'plot_column_quantile',
    get_cardinal = 'get_cardinal' /** get number of elements of a column given some filters */
};

export enum ContentType {  
    COMMAND = 'command',
    STRING = 'str',
    DICT = 'dict',
    PANDAS_DATAFRAME = 'pandas_dataframe',
    PLOTLY_FIG = 'plotly_fig',    
    DIR_LIST = 'dir_list',
    FILE_METADATA = 'file_metadata',
    FILE_CONTENT = 'file_content',
    COLUMN_CARDINAL = 'column_cardinal',
    NONE = 'none',
};

export enum CommandType {  
    MLFLOW = 'mlflow',
    MLFLOW_CLIENT = 'mlflow_client',
    MLFLOW_COMBINE = 'mlflow_combine',
};

export enum WebAppEndpoint {
    DFManager = 'DFManager',
    CodeEditor = 'CodeEditor',
    FileManager = 'FileManager',
    MagicCommandGen = 'MagicCommandGen',
    FileExplorer = 'FileExplorer',
    ExperimentManager = 'ExperimentManager',
};

export interface ITableData {
    df_id: string,
    index: {name: string, data: any[]}
    column_names: string[],
    rows: [][]
}

export enum ReviewType {
    col = 'col',
    row = 'row',
    cell = 'cell'
};

export enum ReviewRequestType {
    repeat = 'repeat',
    next = 'next',
    prev = 'prev',
    index = 'index'
};

export enum FilterType {
    loc = 'loc',
    iloc = 'iloc',
    col = 'col'
};

export enum FileMimeType {
    FILEPNG = 'file/png',
    FILEJPG = 'file/jpg',
};

export enum BinaryMimeType {
    IMAGEPNG = 'img/png',
    IMAGEJPG = 'img/jpg'
};
export const CNextMimeType = {...FileMimeType, ...BinaryMimeType}
export type CNextMimeType = FileMimeType | BinaryMimeType;

export interface DFFilter {
    type: FilterType,
    index: string,
    cols: string[]
}

export interface IDFUpdates {
    update_type: UpdateType,
    update_content: (string)[] | (number)[] | {}
}

export interface IReviewRequest {
    type: ReviewRequestType,
    index: number
}
export const UndefReviewIndex = -1;
// export class DFUpdatesReview {
//     enable: boolean = false;
//     index: number = -1;
//     count: number = -1;
// };

//can't use class because redux will throw nonserializable
// export class LoadDataRequest {
//     df_id: string | null = null;
//     count: number = 0;
//     row_index: number = 0;
// };

export interface IDFUpdatesReview {
    enable: boolean;
    // 'index' represents the position of the review in the review list.
    index: number; 
    // 'name' represents the row index or column name or [column name, row index] tuple.
    name: string | number | [string, number]; 
    // 'count' is used to support 'repeat' review. when 'repeat', no other variable changed except for 'count'.
    count: number; 
    type: ReviewType;
    // length of the review list in case of row and column updates.
    length: number; 
    /**
     * the following fields are used to make navigation of cell updates easier. 
     * this will be used together with the 'index' above. 
     * */ 
    // col_index, row_index are the position currently reviewed column in the col_names list.
    updates_col_index: number;
    updates_row_index: number;
    // col_names is the the name of list of columns with updated cell.
    col_names: string[]; 
    // col_end_index is the running end index corresponding to a column.
    // it is the sum of the length of the this and previous columns.
    col_end_index: number[];
};

export interface IColumnMetaData {
    name: string;
    type: string;
    countna: number;
    unique: string|number[];
    describe: {};
    histogram_plot: {};
    quantile_plot: {};
};

export interface IDFMetadata {
    df_id: string;
    shape: [number, number];
    columns: {[key: string]: IColumnMetaData};
};

export interface IConfigs {
    local_tmp_dir: string;
    mlflow_tracking_uri: string;
}

// export class DFUpdates {
//     update_type: UpdateType = UpdateType.no_update;
//     update_content: string[] | number[] | [number, number][] = [];
// }
//     constructor(update_type: UpdateType, update_content: string[] | number[] | [number, number][]) {
//         this.update_type = update_type;
//         this.update_content = update_content;
//     }
// }

// export class ReduxDFUpdates extends DFUpdates {
//     review: DFUpdatesReview = new DFUpdatesReview();
// }

// export interface IReduxDF {
//     activeDataFrame: number | null;
//     tableData: {};
//     columnMetaData: {};
//     columnHistogram: {};
//     columnDataSummary: {};
//     dfUpdates: {};
//     dfUpdatesReview: {[df_id: string]: IDFUpdatesReview};
//     tableDataReady: boolean;
// }