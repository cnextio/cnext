export enum DataFrameUpdateType {
    add_cols = "add_cols",
    del_cols = "del_cols",
    add_rows = "add_rows",
    del_rows = "del_rows",
    update_cells = "update_cells",
    new_index = "update_index",
    new_df = "new_df",
    no_update = "no_update",
}

export interface IDataFrameUpdate {
    update_type: DataFrameUpdateType;
    update_content: string[] | number[] | { [id: string]: [] };
}

export interface IDataFrameStatusItem {
    type: string;
    name: string;
    id: string;
    df_updated: boolean;
    updates: IDataFrameUpdate;
    op: string;
    line_number: number;
}

export interface IDataFrameStatus {
    is_updated: boolean;
    /** indiate whether this update has been showed to the user or not */
    is_showed: boolean;
    _status_list: IDataFrameStatusItem[];
}

export interface IAllDataFrameStatus {
    [id: string]: IDataFrameStatus;
}
