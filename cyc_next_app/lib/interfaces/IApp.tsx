import React from "react";
import { ProjectCommand, IFileMetadata, IDirectoryMetadata } from "./IFileManager";
import { IGetCardinalResult } from "./ICAssist";
import { ExperimentManagerCommand } from "./IExperimentManager";
import { DataFrameUpdateType } from "./IDataFrameStatus";
import { KernelManagerCommand } from "./IKernelManager";
import { ModelManagerCommand } from "./IModelManager";

export type RecvCodeOutput = (output: IMessage) => void;

// export interface CodeOutput {
//     type: string;
//     content: string;
// };

export interface IMessage {
    webapp_endpoint: string; // the web client component which sends
    // and/or receives this message
    command_name:
        | CommandName
        | ProjectCommand
        | ExperimentManagerCommand
        | KernelManagerCommand
        | ModelManagerCommand; // 'code_area_command'|'updated_dataframe_list'|
    // for commands that requires more than one command
    type: ContentType | CommandType; // the object type of the output content
    content:
        | string
        | object
        | IFileMetadata
        | IFileMetadata[]
        | IGetCardinalResult
        | IDirectoryMetadata
        | null; // the command string and output string|object
    error?: boolean;
    metadata?: object; // store info about the dataframe and columns
    // related to this command
}

// export enum UpdateType {
//     add_cols = "add_cols",
//     del_cols = "del_cols",
//     add_rows = "add_rows",
//     del_rows = "del_rows",
//     update_cells = "update_cells",
//     new_index = "update_index",
//     new_df = "new_df",
//     no_update = "no_update",
// }

// export interface DataTableContent {
//     name: string;
//     column_names: string[];
//     rows: ((string|number)[])[];
// };

export enum CommandName {
    exec_line = "exec_line",
    exec_grouped_lines = "exec_grouped_lines",
    /** this command contained the updated information of the dataframe status. It is used
     * for the server to inform client about changes in the status */
    update_df_status = "update_df_status",
    /** this command contained the information of the dataframe status. It is used
     * when we need to reload the all active data status e.g. when reloading the page */
    reload_df_status = "reload_df_status",
    plot_column_histogram = "plot_column_histogram",
    get_countna = "get_countna",
    plot_countna = "plot_countna",
    get_table_data = "get_table_data",
    get_df_metadata = "get_df_metadata",
    plot_column_quantile = "plot_column_quantile",
    get_cardinal = "get_cardinal" /** get number of elements of a column given some filters */,
}

export enum ContentType {
    COMMAND = "command",
    STRING = "str",
    DICT = "dict",
    PANDAS_DATAFRAME = "pandas_dataframe",
    PLOTLY_FIG = "plotly_fig",
    MATPLOTLIB_FIG = "matplotlib_fig",
    DIR_LIST = "dir_list",
    FILE_METADATA = "file_metadata",
    FILE_CONTENT = "file_content",
    COLUMN_CARDINAL = "column_cardinal",
    RICH_OUTPUT = "rich_output",
    NONE = "none",
}

export enum StandardMimeType {
    IMAGE_PNG = "image/png",
    IMAGE_JPG = "image/jpg",
    IMAGE_JPEG = "image/jpeg",
    IMAGE_SVG = "image/svg+xml",
    IMAGE_PLOTLY = "image/plotly+json",
    TEXT_HTML = "text/html",
    APPLICATION_JSON = "application/json",
    APPLICATION_CNEXT = "application/cnext+json",
    APPLICATION_PLOTLY = "application/vnd.plotly.v1+json",
    APPLICATION_JAVASCRIPT = "application/javascript",
    APPLICATION_BOKEH = "application/vnd.bokehjs_load.v0+json",
}

export const SubContentType = StandardMimeType;

export enum CommandType {
    MLFLOW = "mlflow",
    MLFLOW_CLIENT = "mlflow_client",
    MLFLOW_OTHERS = "mlflow_others",
}

export enum WebAppEndpoint {
    DFManager = "DFManager",
    ModelManager = "ModelManager",
    CodeEditor = "CodeEditor",
    FileManager = "FileManager",
    MagicCommandGen = "MagicCommandGen",
    FileExplorer = "FileExplorer",
    ExperimentManager = "ExperimentManager",
    PlotManager = "PlotManager",
    KernelManager = "KernelManager",
    LanguageServer = "LanguageServer",
    LanguageServerNotifier = "LanguageServerNotifier",
    LanguageServerHover = "LanguageServerHover",
    LanguageServerCompletion = "LanguageServerCompletion",
    LanguageServerSignature = "LanguageServerSignature",
}

export interface ITableData {
    df_id: string;
    index: { name: string; data: any[] };
    column_names: string[];
    rows: [][];
}

export interface IPlot {
    mime_type: StandardMimeType;
    data: {};
}

export interface IColumnMetaData {
    name: string;
    type: string;
    unique: number[];
    describe: {};
    countna: number;
    quantile_plot: IPlot;
    histogram_plot: IPlot;
}

export interface IMetaData {
    df_id: string;
    shape: number[];
    columns: { [id: string]: IColumnMetaData };
}

export enum ReviewType {
    col = "col",
    row = "row",
    cell = "cell",
}

export enum ReviewRequestType {
    repeat = "repeat",
    next = "next",
    prev = "prev",
    index = "index",
}

export enum FilterType {
    loc = "loc",
    iloc = "iloc",
    col = "col",
}

export enum FileMimeType {
    FILE_PNG = "file/png",
    FILE_JPG = "file/jpg",
    URL_PNG = "url/png",
    URL_JPG = "url/jpg",
}

export const CNextMimeType = { ...FileMimeType, ...StandardMimeType };
export type CNextMimeType = FileMimeType | StandardMimeType;

export interface DFFilter {
    type: FilterType;
    index: string;
    cols: string[];
}

export enum ViewMode {
    HORIZONTAL = "horizontal",
    VERTICAL = "vertical",
}

export enum SideBarName {
    PROJECT = "Projects",
    INBOX = "Inbox",
    CLEAR_STATE = "ClearState",
    CHANGE_LAYOUT = "ChangeLayout",
    RESTART_KERNEL = "RestartKernel",
    INTERRUPT_KERNEL = "InterruptKernel",
}

// export interface IDFUpdates {
//     update_type: DataFrameUpdateType;
//     update_content: string[] | number[] | {[id: string]: []};
// }

export interface IReviewRequest {
    type: ReviewRequestType;
    index: number;
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
    // 'name' represents the column name or row index or [column name, row index] tuple.
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
    updates_col_index?: number;
    updates_row_index?: number;
    // col_names is the the name of list of columns with updated cell.
    col_names?: string[];
    // col_end_index is the running end index corresponding to a column.
    // it is the sum of the length of the this and previous columns.
    col_end_index?: number[];
}

export interface IColumnMetaData {
    name: string;
    type: string;
    countna: number;
    unique: string | number[];
    describe: {};
    histogram_plot: {} | null;
    quantile_plot: {} | null;
}

export interface IDFMetadata {
    df_id: string;
    shape: [number, number];
    columns: { [key: string]: IColumnMetaData };
}

export interface IDataFrameStatsConfig {
    histogram: boolean;
    quantile: boolean;
}

interface IExperimentManagerConfig {
    local_tmp_dir: string;
    mlflow_tracking_uri: string;
}

export interface IEditorShortcutKey {
    run_queue: string;
    set_group: string;
    set_ungroup: string;
    insert_group_below: string;
    insert_line_below: string;
}

export interface IAppShortcutKey {
    autocompletion_tooggle: string;
    lint_tooggle: string;
    hover_tooggle: string;
}
export interface IEditorConfigs {
    lint: boolean;
    hover: boolean;
    autocompletion: boolean;
}

export interface IDataFrameManagerConfigs {
    auto_display_data: boolean;
    show_exec_text: boolean;
}

export interface IConfigs {
    view_mode: ViewMode | undefined;
    code_editor_shortcut: IEditorShortcutKey;
    app_shortcut?: IAppShortcutKey;
    experiment_manager?: IExperimentManagerConfig;
    code_editor: IEditorConfigs;
    dataframe_manager: IDataFrameManagerConfigs;
}

export enum DFViewMode {
    TABLE_VIEW = "Table View",
    SUMMARY_VIEW = "Summary View",
    GRID_VIEW = "Grid View",
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
