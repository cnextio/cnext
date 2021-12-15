import { Line } from "@codemirror/text";

export interface MagicPlotData {
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

export interface CodeGenResult {
    code?: string;
    error: boolean;
}

export interface TextRange {
    from: number;
    to: number;
}

export interface GeneratedLineInfo {
    line: number;
    to: number;
}

export interface IMagicInfo {
	status: CodeGenStatus,
	line?: Line,
	magicText?: string,
	plotData?: MagicPlotData,
}

export enum CodeGenStatus {
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

export const MAGIC_STARTER = '#!';

export const NumericalTypes = ['int64', 'float64'];
export const CategoricalTypes = ['category', 'object', 'bool', 'datetime64[ns]'];