import { ContentType } from "./IApp";
import { CodeInsertStatus, ICAssistInfo } from "./ICAssist";

export interface ICodeDoc {
    text: Object;
    lines: ICodeLine[]; // map a line number to an ID. The ID will be associated
    // with an output. This ID will be fixed but the line number
    // might change.
}

// export interface IGroup {
// 	from: number;
// 	to: number;
// }

export enum LineStatus {
    EDITED,
    EXECUTING,
    EXECUTED_SUCCESS,
    EXECUTED_FAILED,
}

// export interface ICodeResult {
// 	type: ResultType;
// 	result: Object;
// }

// // TODO: currently it is same as AppInterfaces/ContentType. Need to revisit this later.
// export enum ResultType {
//     str = 'str',
//     dict = 'dict',
//     pandas_dataframe = 'pandas_dataframe',
//     plotly_fig = 'plotly_fig',
//     none = 'none'
// }

export interface ICodeLine {
    lineID: string;
    status: LineStatus;
    result?: ICodeResult;
    textOutput?: ICodeResult;
    generated: boolean;
    groupID?: string;
    cAssistInfo?: ICAssistInfo;
}

/**
 * text: content of the new text doc
 * lineNumber: line above which the new lines are added
 * lineCount: number of lines added above the lineNumber
 */
export interface ILineUpdate {
    inViewID: string;
    text: string[];
    updatedStartLineNumber: number;
    updatedLineCount: number;
    startLineChanged: boolean;
}

export interface ICodeLineStatus {
    inViewID: string;
    lineRange: ILineRange;
    status?: LineStatus;
    generated?: boolean;
    text?: string[];
}

export interface ICodeLineGroupStatus {
    inViewID: string;
    fromLine: number;
    toLine: number;
    status?: LineStatus;
    generated?: boolean;
    text?: string[];
    setGroup: SetLineGroupCommand /** if true, new group will be created for this set of lines */;
}

export interface ICodeActiveLine {
    inViewID: string;
    lineNumber: number;
}

export interface ICodeText {
    reduxFileID: string;
    codeText: string[];
    codeLines: ICodeLine[]; // Add codeLines attribute to handle the state management
    // timestamp: number;
}

export enum SetLineGroupCommand {
    NEW /** create a new group */,
    CURRENT /** don't change the groupID */,
    UNDEF /** set groupID to undefined */,
}

export interface CodeResultMessageMetaData {
    df_id?: string;
    msg_id?: string;
    session_id?: string;
}

export interface ICodeResultMessage {
    inViewID: string;
    type: ContentType;
    subType: string;
    content: ICodeResultContent;
    metadata: CodeResultMessageMetaData;
}

export type ICodeResultContent = string | object | IPlotResult;

export interface ICodeResult {
    type: ContentType;
    content: ICodeResultContent;
    subType: string;
    msg_id?: string;
    session_id?: string;
    /** Order in which this result is generated. 
     * Currently only use this for text output result where output will be displayed in the order of generation. */
    order?: number;
}

export interface IPlotResult {
    plot: object;
}

export interface IRunningCommandContent {
    lineRange: ILineRange;
    content: string;
    // runAllAtOnce: boolean|undefined;
}

export interface ILineRange {
    fromLine: number;
    toLine: number;
}

export interface IReduxRunQueueMessage {
    lineRange: ILineRange;
    runAllAtOnce: boolean;
}

export enum MessageMetaData {
    dfID = "df_id",
    colName = "col_name",
    lineNumber = "line_number",
}

/**
 * This defines the interface of how CodeEditorRedux store the plot result
 */
export interface IStatePlotResults {
    [lineID: string]: IPlotResult;
}

/** CodeEditor run queue  */
export interface IRunQueue {
    status: RunQueueStatus;
    fromLine?: number;
    toLine?: number;
    runningLine?: number;
    runAllAtOnce?: boolean /** true if the grouped lines are run all at once, and false if run line by line */;
}
export enum RunQueueStatus {
    STOP,
    RUNNING,
}

export enum CodeInsertMode {
    LINE,
    GROUP,
    LINEANDGROUP /** insert one line and one group */,
}
/** This is used for other components to inser code to CodeEditor */
export interface ICodeToInsertInfo {
    code: string;
    fromPos?: number;
    status: CodeInsertStatus;
    mode: CodeInsertMode;
}
/** */
