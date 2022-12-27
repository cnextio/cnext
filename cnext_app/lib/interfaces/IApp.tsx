import React from "react";
import {
    ProjectCommand,
    IFileMetadata,
    IDirectoryMetadata,
    IWorkspaceMetadata,
} from "./IFileManager";
import { IGetCardinalResult } from "./ICAssist";
import { ExperimentManagerCommand } from "./IExperimentManager";
import { DataFrameUpdateType } from "./IDataFrameStatus";
import { IExecutorManagerResultContent, ExecutorManagerCommand } from "./IExecutorManager";
import { ModelManagerCommand } from "./IModelManager";
import { ICodeResultContent } from "./ICodeEditor";

export type RecvCodeOutput = (output: IMessage) => void;

// export interface CodeOutput {
//     type: string;
//     content: string;
// };

export interface IMessage {
    webapp_endpoint: WebAppEndpoint; // the web client component which sends
    // and/or receives this message
    command_name:
        | CommandName
        | ProjectCommand
        | ExperimentManagerCommand
        | ExecutorManagerCommand
        | ModelManagerCommand // 'code_area_command'|'updated_dataframe_list'|
        | ICodeResultContent;
    // for commands that requires more than one command
    type: ContentType | CommandType; // the object type of the output content
    content:
        | string
        | object
        | IFileMetadata
        | IFileMetadata[]
        | IGetCardinalResult
        | IDirectoryMetadata
        | IWorkspaceMetadata
        | IExecutorManagerResultContent
        | null; // the command string and output string|object
    error?: boolean;
    metadata?: object | null; // store info about the dataframe and columns
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
    get_file_changed="get_file_changed",
    exec_grouped_lines = "exec_grouped_lines",
    send_stdin = "send_stdin",
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
    get_jupyter_server_config = "get_jupyter_server_config",
    get_list_file_changed = "get_list_file_changed",
    connect_repo = "connect_repo",
    check_diff = "check_diff",
    get_registered_udfs = "get_registered_udfs",
    compute_udf = "compute_udf",
    set_dataframe_cell_value = "set_dataframe_cell_value",
    exc_text= "exc_text"
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
    PROJECT_METADATA = "project_metadata",
    PROJECT_LIST = "project_list",
    WORKSPACE_METADATA = "workspace_metadata",
    INPUT_REQUEST = "input_request",
    IPYTHON_MSG = "ipython_msg",
}

export enum StandardMimeType {
    IMAGE_PNG = "image/png",
    IMAGE_JPG = "image/jpg",
    IMAGE_JPEG = "image/jpeg",
    IMAGE_SVG = "image/svg",
    IMAGE_SVG_XML = "image/svg+xml",
    IMAGE_PLOTLY = "image/plotly+json",
    TEXT_HTML = "text/html",
    TEXT_PLAIN = "text/plain",
    APPLICATION_JSON = "application/json",
    APPLICATION_CNEXT = "application/cnext+json",
    APPLICATION_PLOTLY = "application/vnd.plotly.v1+json",
    APPLICATION_JAVASCRIPT = "application/javascript",
    APPLICATION_BOKEH = "application/vnd.bokehjs_load.v0+json",
    MARKDOWN = "text/markdown",
}

export const SubContentType = StandardMimeType;

export enum CommandType {
    MLFLOW = "mlflow",
    MLFLOW_CLIENT = "mlflow_client",
    MLFLOW_OTHERS = "mlflow_others",
}

export enum WebAppEndpoint {
    DataFrameManager = "DataFrameManager",
    ModelManager = "ModelManager",
    CodeEditor = "CodeEditor",
    FileManager = "FileManager",
    MagicCommandGen = "MagicCommandGen",
    FileExplorer = "FileExplorer",
    ExperimentManager = "ExperimentManager",
    PlotManager = "PlotManager",
    ExecutorManager = "ExecutorManager",
    ExecutorManagerControl = "ExecutorManagerControl",
    LanguageServer = "LanguageServer",
    LanguageServerNotifier = "LanguageServerNotifier",
    LanguageServerHover = "LanguageServerHover",
    LanguageServerCompletion = "LanguageServerCompletion",
    LanguageServerSignature = "LanguageServerSignature",
    Terminal = "Terminal",
    GitManager = "GitManager",
    LogsManager = "LogsManager",
    DataViewer = "DataViewer",
    DFExplorer = "DFExplorer",
    OpenAiManager= "OpenAiManager"
}

export interface ITableData {
    df_id: string;
    index: { name: string; data: any[] };
    column_names: string[];
    rows: any[][];
    size: number;
    page?: number;
}

export interface ITableMetaData {
    df_id: string;
    filter: string;
    page_number: number;
    page_size: number;
}
export interface IPlot {
    mime_type: StandardMimeType;
    data: {};
}

export interface IColumnMetadata {
    name: string;
    type: string;
    unique: number[];
    describe: {};
    countna: number;
    quantile_plot: IPlot;
    histogram_plot: IPlot;
    udfs: { [udfName: string]: {} | null };
}

export interface IMetadata {
    df_id: string;
    type: string;
    shape: number[];
    columns: { [id: string]: IColumnMetadata };
    timestamp: number;
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

export enum SpecialMimeType {
    FILE_PNG = "file/png",
    FILE_JPG = "file/jpg",
    URL_PNG = "url/png",
    URL_JPG = "url/jpg",
    URL_IMAGE = "url/image",
    INPUT_SELECTION = "input/selection",
    INPUT_CHECKBOX = "input/checkbox",
    INPUT_TEXT = "input/text",
    URL_AUDIO = "url/audio",
}

// export enum FileMimeType {
//     FILE_PNG = "file/png",
//     FILE_JPG = "file/jpg",
//     URL_PNG = "url/png",
//     URL_JPG = "url/jpg",
// }

export const CNextMimeType = { ...SpecialMimeType, ...StandardMimeType };
export type CNextMimeType = SpecialMimeType | StandardMimeType;

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
    CHANGE_LAYOUT = "ChangeLayout",
    GIT = "Git",
}

export enum ExecutorToolbarItem {
    CLEAR_OUTPUTS = "ClearOuputs",
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

export interface IColumnMetadata {
    name: string;
    type: string;
    countna: number;
    unique: string | number[];
    describe: {};
    // histogram_plot: {} | null;
    // quantile_plot: {} | null;
}

export interface IDFMetadata {
    df_id: string;
    shape: [number, number];
    columns: { [key: string]: IColumnMetadata };
}

// export interface IDataFrameStatsConfig {
//     histogram: boolean;
//     quantile: boolean;
// }

export interface IDataFrameUDFSelection {
    udfs: { [UDFName: string]: boolean };
    timestamp: string;
}
export interface IDataFrameColumnSelection {
    columns: { [columnName: string]: boolean };
    timestamp: string;
}
interface IExperimentManagerConfig {
    local_tmp_dir: string;
    mlflow_tracking_uri: string;
}

export interface IEditorShortcutKey {
    run_queue: string;
    run_queue_then_move_down?: string;
    set_group?: string;
    set_ungroup?: string;
    insert_group_below?: string;
    insert_line_below?: string;
}

export interface IAppShortcutKey {
    autocompletion_on: string;
    lint_on: string;
    hover_on: string;
}
export interface IEditorSettings {
    lint: boolean;
    hover: boolean;
    autocompletion: boolean;
}

export interface IDataFrameManagerSettings {
    auto_display_data: boolean;
    show_exec_text: boolean;
}

export interface IRichOutputSettings {
    show_markdown: boolean;
}

export interface ILayoutSettings {
    /** unit: px */
    project_explorer_size: number;
}

export interface IConfigs {
    view_mode: ViewMode | undefined;
    layout: ILayoutSettings | undefined;
    code_editor_shortcut: IEditorShortcutKey;
    app_shortcut?: IAppShortcutKey;
    experiment_manager?: IExperimentManagerConfig;
    code_editor: IEditorSettings;
    dataframe_manager: IDataFrameManagerSettings;
    rich_output: IRichOutputSettings;
}

export enum DFViewMode {
    TABLE_VIEW = "Table View",
    SUMMARY_VIEW = "Summary View",
    // GRID_VIEW = "Grid View",
}

interface WorkSpaceOpenProject {
    id: String;
    config_path: String | null;
    data_path: String | null;
    name: String;
    path: String;
}

export enum ExecutorCommandStatus {
    CONNECTION_FAILED = "connection_failed",
    EXECUTION_FAILED = "execution_failed",
    EXECUTION_OK = "execution_ok",
    EXECUTION_BUSY = "execution_busy",
    SOCKET_NOT_READY = "socket_not_ready",
}

export interface IExecutorCommandResponse {
    status: ExecutorCommandStatus;
    result?: IExecutorManagerResultContent;
}

export enum KernelInfoInitStatus {
    DONE = "done",
    ERROR = "error",
    NOT_YET = "not_yet",
}

export const SETTING_FILE_PATH = "config.json";
export const OPERATION_DISABLED_MSG = "This component is disabled while code is being executed";

// export interface IWorkSpaceConfig {
//     active_project: string | null;
//     open_projects: WorkSpaceOpenProject[] | [];
// }

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
//     columnMetadata: {};
//     columnHistogram: {};
//     columnDataSummary: {};
//     dfUpdates: {};
//     dfUpdatesReview: {[df_id: string]: IDFUpdatesReview};
//     tableDataReady: boolean;
// }
