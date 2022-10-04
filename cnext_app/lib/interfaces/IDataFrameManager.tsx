export interface IDataFrameMessageMetadata {
    df_id: string;
    col_name: string;
    udf_name?: string;
}

export interface IDataFrameFilter {
    df_id: string;
    query: string;
}

export enum UDFView {
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

// export interface UDFLocation {
//     view: UDFView;
//     position: UDFPosition;
// }
export interface UDFConfig {
    type: UDFOutputType;
    locations: { [name: string]: UDFPosition };
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
    udfs: {[name: string]: UDF};
    timestamp: string
}

export interface IGetUDFCommand {
    df_id: string;
    col_names: string[];
    udf_name: string;
}
