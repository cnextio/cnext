import { ContentType } from "./IApp";

export interface ICodeDoc {
	text: Object;
	lines: ICodeLine[]; // map a line number to an ID. The ID will be associated 
										// with an output. This ID will be fixed but the line number
										// might change.
};

export interface ICodeLine {
	lineID: string;
	status: LineStatus;
	result: ICodeResult | null;
	generated: boolean; 
	groupID?: string;
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

/**
* text: content of the new text doc
* lineNumber: line above which the new lines are added
* lineCount: number of lines added above the lineNumber
 */
export interface ILineUpdate {
    text: string[]; 
    updatedStartLineNumber: number;
    updatedLineCount: number;
}

export interface ICodeLineStatus {	
	lineNumber: number;
	status?: LineStatus;
	generated?: boolean;
	text?: string[]; 
}

export interface ICodeLineGroupStatus {	
	fromLine: number;
	toLine: number;
	status?: LineStatus;
	generated?: boolean;
	text?: string[]; 
	setGroup: SetLineGroupCommand; /** if true, new group will be created for this set of lines */
}

export enum SetLineGroupCommand {
	NEW,		/** create a new group */
	CURRENT,	/** don't change the groupID */
	UNDEF,		/** set groupID to undefined */
}

export interface ICodeResultMessage {
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

export interface ILineContent {
	lineNumber: number;
	content: string;
}

export interface ILineRange {
	fromLine: number;
	toLine: number;
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
	fromLine: number,
	toLine: number,
	runningLine: number,
}
export enum RunQueueStatus {
	STOP,
	RUNNING
}
/** */
