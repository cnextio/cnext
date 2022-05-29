import { Line } from "@codemirror/text";

export interface CAssistPlotData {
    // this is the range of the magic text that generated this plot code
    magicTextRange: {from: number, to: number},
    df: string | null,
    x: string[] | null,
    y: string[] | null
}

export enum PlotType {
    BAR = 'bar',
    STACKED_BAR = 'stacked_bar',
    GROUPED_BAR = 'grouped_bar',    
    SEGMENTED_BAR = 'segmented_bar',
    PIE = 'pie',
    KERNEL_DENSE = 'kernel_dense',
    GROUPED_KERNEL_DENSE = 'grouped_kernel_dense',
    DOT = 'dot',
    LINE = 'line',
    SCATTER = 'scatter',
    SCATTER_FIT = 'scatter_fit',
    MOSAIC = 'mosaic',
    BOX = 'box',
    VIOLIN = 'violin',
    RIDGELINE = 'ridgeline',
    STRIP = 'strip',
    BOX_JITTER = ' box_jitter',
    BEE_SWAMP = 'bee_swamp',
    CLEVELAND = 'cleveland',
    HISTOGRAM = 'histogram',
}

export enum CAssistOptType {
    SELECT = 'select'
}

export interface ICAssistExtraOpt {
    type: CAssistOptType;
    name: string;
    default?: string;
    opts?: string[];
}

export interface ICodeGenResult {
    code?: string;
    lineCount?: number;
    error: boolean;
    extraOpts?: ICAssistExtraOpt[];
}

export interface TextRange {
    from: number;
    to: number;
}

/**
 * Inserted lines are from fromLine to toLine excluding toLine
 */
export interface IInsertLinesInfo {
    fromLine: number;
    toLine: number;
    fromPos: number;
}

export interface ICAssistInfo {
	status: CodeInsertStatus,
	cAssistLineNumber: number,
    insertedLinesInfo: IInsertLinesInfo,
	cAssistText?: string,
	plotData?: CAssistPlotData,
    genCode?: string,
    cAssistExtraOpts?: ICAssistExtraOpt[],
}

export interface ICAssistInfoRedux {
	inViewID: string;
    cAssistLineNumber: number;
	cAssistInfo: ICAssistInfo;
}

export enum CodeInsertStatus {
    TOINSERT,
	INSERTING,
	INSERTED
}

export interface IGetCardinalResult {
    cardinals: [];
}

export interface IDimStatsResult {
    groupby_x0: {[key: string]: number};
    groupby_all: {[key: string]: number};
    unique_counts: {[key: string]: number};
    monotonics: {[key: string]: number};
}

export enum AggregateType {
    MEAN = 'mean',
    MEDIAN = 'median',
    SUM = 'sum',
    STD = 'std',
    VAR = 'var',
}

export const CASSIST_STARTER = '#!';

export const NumericalTypes = ['int64', 'float64'];
export const CategoricalTypes = ['category', 'object', 'bool', 'datetime64[ns]'];

export const LINE_SEP = '\n';