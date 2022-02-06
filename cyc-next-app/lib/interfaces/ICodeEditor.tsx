import { ContentType } from "./IApp";
import { ICAssistInfo } from "./ICAssist";

export interface ICodeDoc {
	text: Object;
	lines: ICodeLine[]; // map a line number to an ID. The ID will be associated 
										// with an output. This ID will be fixed but the line number
										// might change.
};



// export interface IGroup {
// 	from: number;
// 	to: number;
// }

export enum LineStatus {
	EDITED,
	EXECUTING,
	EXECUTED,
};

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
	result: ICodeResult | null;
	generated: boolean; 
	groupID?: string;
	cAssistInfo?: ICAssistInfo;
};

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
	setGroup: SetLineGroupCommand; /** if true, new group will be created for this set of lines */
}

export interface ICodeActiveLine {
	inViewID: string;
	lineNumber: number
}

export interface ICodeText {
	reduxFileID: string;
	codeText: string[];
	// timestamp: number;
}

export enum SetLineGroupCommand {
	NEW,		/** create a new group */
	CURRENT,	/** don't change the groupID */
	UNDEF,		/** set groupID to undefined */
}

export interface ICodeResultMessage {
	inViewID: string;
    type: ContentType;    
    content: string|object;  
    metadata: object;        
}

export interface ICodeResult {
    type: ContentType;    
    content: string | object | IPlotResult;      
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
	dfID = 'df_id',
	colName = 'col_name',
	lineNumber = 'line_number'
}

/**
 * This defines the interface of how CodeEditorRedux store the plot result
 */
export interface IStatePlotResults {
	[lineID: string]: IPlotResult
}

/** CodeEditor run queue  */
export interface IRunQueue {
	status: RunQueueStatus,
	fromLine?: number,
	toLine?: number,
	runningLine?: number,
	runAllAtOnce?: boolean, /** true if the grouped lines are run all at once, and false if run line by line */
}
export enum RunQueueStatus {
	STOP,
	RUNNING
}

/** This is used for other components to inser code to CodeEditor */
export interface ICodeToInsert {
  code: string;
}
/** */
