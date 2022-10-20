export interface IDataFrameMessageMetadata {
    df_id: string;
    col_name: string;
    udf_name?: string;
}

export interface IDataFrameFilter {
    df_id: string;
    /** this is the compiled query that can run directly with the dataframe */
    query: string;
    /** this is the query showed in the query box */
    cnext_query: string;
}

export enum UDFLocation {
    SUMMARY = "summary",
    TABLE_HEAD = "table_head",
    TABLE_BODY = "table_body",
}

export enum UDFOutputType {
    IMAGE = 0,
    TEXT = 1,
    THRESHOLD = 2,
}

export interface UDFPosition {
    row: number;
    col: number;
}

export interface UDFShape {
    width: number;
    height: number;
}

export interface UDFView {
    position: UDFPosition;
    shape: UDFShape;
}
// export interface UDFLocation {
//     view: UDFView;
//     position: UDFPosition;
// }
export interface UDFConfig {
    type: UDFOutputType;
    view_configs: { [name: string]: UDFView };
    display_name: string;
}

export interface UDFFunc {
    func: { [name: string]: string };
}
export interface UDF {
    config: UDFConfig;
    func: UDFFunc;
}
export interface IRegisteredUDFs {
    udfs: { [name: string]: UDF };
    timestamp: string;
}

export interface IGetUDFCommand {
    df_id: string;
    col_names: string[];
    udf_name: string;
}

export interface ICellDataURLImage {
    url: string;
    binary: string;
}

export interface ICellDataFileImage {
    file_name: string;
    binary: string;
}

export interface ICellDataSelectionInput {
    options: string;
    input: string;
}

export interface ICellDataCheckboxInput {
    name: string;
    input: boolean;
}

export interface ICellDataTextInput {
    input: string
}