export interface IDataFrameMessageMetadata {
    df_id: string;
    col_name: string;
}

export interface IDataFrameFilter {
    df_id: string;
    query: string;
}