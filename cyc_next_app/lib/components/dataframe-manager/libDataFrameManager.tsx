import { DataFrameState } from "../../../redux/reducers/DataFramesRedux";
import { IDataFrameStatus } from "../../interfaces/IDataFrameStatus";

/** Get the last update from data frame status */
export function getLastUpdate(status: IDataFrameStatus) {
    const lastStatus = status._status_list[status._status_list.length - 1];
    return lastStatus.updates;
}

/** Check whether defined stats has been loaded. The current defined stats includes quantile and histogram
 * A hacky algorithm is being used here i.e. only check if one of the stat i.e. "quantile_plot" is present */
export function hasDefinedStats(df_id: string, dataFrameState: DataFrameState){
    let metadata = dataFrameState.metadata[df_id];
    if (metadata!=null){
        let column_0 = Object.keys(metadata.columns)[0];
        return "quantile_plot" in metadata.columns[column_0];
    }
}