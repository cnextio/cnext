import { Socket } from "socket.io-client";
import {
    setActiveDF,
    setDFUpdates,
    setMetadata,
    setRegisteredUDFs,
    setTableData,
} from "../../../redux/reducers/DataFramesRedux";
import store from "../../../redux/store";
import {
    CommandName,
    ContentType,
    IDataFrameUDFSelection,
    IMessage,
    WebAppEndpoint,
} from "../../interfaces/IApp";
import { IDataFrameMessageMetadata } from "../../interfaces/IDataFrameManager";
import {
    DataFrameUpdateType,
    IAllDataFrameStatus,
    IDataFrameStatus,
} from "../../interfaces/IDataFrameStatus";
import { sendMessage } from "../Socket";

// export const sendMessage = (socket: Socket | null, message: IMessage) => {
//     console.log(`Send DataFrameManager request: `, JSON.stringify(message));
//     socket?.emit(WebAppEndpoint.DataFrameManager, JSON.stringify(message));
// };

export const createMessage = (
    endpoint: WebAppEndpoint,
    command_name: CommandName,
    content: {} | string | null = null,
    metadata: {}
): IMessage => {
    let message: IMessage = {
        webapp_endpoint: endpoint,
        command_name: command_name,
        content: content,
        metadata: metadata,
        type: ContentType.COMMAND,
    };

    return message;
};

const isDataFrameUpdated = (df_id: string) => {
    const state = store.getState();
    const status = state.dataFrames.dfUpdates[df_id];
    return status.is_updated;
};

export const DF_DISPLAY_LENGTH = 50;

// export const sendGetTableData = (
//     socket: Socket,
//     df_id: string,
//     filter: string | null = null,
//     fromIndex: number = 0,
//     size: number = DF_DISPLAY_LENGTH
// ) => {
//     let queryStr: string = `${df_id}${filter ? filter : ""}.iloc[${fromIndex}:${fromIndex + size}]`;
//     let message = createMessage(
//         WebAppEndpoint.DataFrameManager,
//         CommandName.get_table_data,
//         queryStr,
//         {
//             df_id: df_id,
//             filter: filter,
//             from_index: fromIndex,
//             size: size,
//         }
//     );
//     // console.log("Send get table: ", message);
//     sendMessage(socket, WebAppEndpoint.DataFrameManager, message);
// };

//TODO: create a targeted column function
export const sendGetDFMetadata = (endpoint: WebAppEndpoint, socket: Socket, df_id: string, type: string) => {
    let message = createMessage(endpoint, CommandName.get_df_metadata, "", {
        df_id: df_id, df_type: type,
    });
    // console.log("_send_get_table_data message: ", message);
    sendMessage(socket, WebAppEndpoint.DataFrameManager, message);
};

export const handleActiveDFStatus = (
    socket: Socket,
    message: IMessage,
    reload: boolean = false
) => {
    console.log("DataFrameManager got active df status message: ", message.content);
    const allDFStatus = message.content as IAllDataFrameStatus;

    // console.log(dfStatusContent);
    // the UI is currently designed to handle only 1 reviewable update at a time
    // but will still scan through everything here for now
    if (allDFStatus) {
        Object.keys(allDFStatus).forEach(function (df_id) {
            // console.log("DataFrameManager reload: ", df_id, allDFStatus[df_id].is_updated, reload);
            let is_updated = allDFStatus[df_id].is_updated;
            if (is_updated == true || reload == true) {
                // console.log(df_id, dfStatusContent[df_id]);
                let status = allDFStatus[df_id];
                let update = getLastUpdate(status);
                if (update != null) {
                    let updateType = update["update_type"];
                    let updateContent = update["update_content"];
                    let dfType = getLastStatus(status).type;
                    console.log("DataFrameManager active df updates: ", update);
                    sendGetDFMetadata(WebAppEndpoint.DataFrameManager, socket, df_id, dfType);
                    if (updateType == DataFrameUpdateType.add_rows) {
                        // show data around added rows
                        /** for now, only support number[] */
                        if (updateContent instanceof Array<number>)
                            if (typeof updateContent[0] == "number") {
                                const fromIndex =
                                    updateContent[0] - DF_DISPLAY_LENGTH / 2 >= 0
                                        ? updateContent[0] - DF_DISPLAY_LENGTH / 2
                                        : 0;
                                // sendGetTableData(socket, df_id, null, fromIndex);
                            }
                    } else {
                        // sendGetTableData(socket, df_id);
                    }
                }
            }
            // make redux object conform to our standard
            let dfUpdateMessage = {
                df_id: df_id,
                ...allDFStatus[df_id],
            };
            store.dispatch(setDFUpdates(dfUpdateMessage));
        });
    }
};

export const handleGetTableData = (message: IMessage) => {
    if (message.metadata) {
        const metadata = message.metadata as IDataFrameMessageMetadata;
        const df_id = metadata.df_id;
        // const tableData = JSON.parse(message.content);
        const tableData = message.content;
        console.log("DataFrameManager: dispatch to tableData (DataFrame) ", tableData);
        store.dispatch(setTableData(tableData));
        if (df_id != null && isDataFrameUpdated(df_id)) {
            store.dispatch(setActiveDF(df_id));
        }
    }
};

export const handleGetDFMetadata = (message: IMessage) => {
    if (message.metadata) {
        const metadata = message.metadata as IDataFrameMessageMetadata;
        console.log(
            `${WebAppEndpoint.DataFrameManager} got metadata for "${metadata.df_id}": `,
            message.content
        );
        let dfMetadata = message.content;
        store.dispatch(setMetadata(dfMetadata));

        /** FIXME: temporarily comment this out while implmenting UDFs */
        // let df_id = metadata.df_id;
        // if (df_id != null && isDataFrameUpdated(df_id)) {
        // getDefinedStatsOnUpdate(socket, dataFrameConfig, df_id);
        // }
    }
};

/** Get the last update from data frame status */
export function getLastUpdate(status: IDataFrameStatus) {
    const lastStatus = getLastStatus(status);
    return lastStatus.updates;
}

export function getLastStatus(status: IDataFrameStatus) {
    const lastStatus = status._status_list[status._status_list.length - 1];
    return lastStatus;
}

/** select columns to get stats based on the update type */
export const getColumnsToGetStats = (df_id: string): string[] | null => {
    const state = store.getState();
    const status = state.dataFrames.dfUpdates[df_id];
    const metadata = state.dataFrames.metadata[df_id];
    let columns: string[] | null = null;
    const update = getLastUpdate(status);
    if (update.update_type === DataFrameUpdateType.add_cols) {
        //only update histogram of columns that has been updated
        columns = update.update_content as string[];
    } else if (
        update.update_type === DataFrameUpdateType.add_rows ||
        update.update_type === DataFrameUpdateType.del_rows ||
        update.update_type === DataFrameUpdateType.new_df ||
        update.update_type === DataFrameUpdateType.update_cells ||
        /** technically, col drops should not require reload of the stats
         * but to simplify the flow we do that anyway here
         */
        update.update_type === DataFrameUpdateType.del_cols
    ) {
        columns = Object.keys(metadata.columns);
    } //TODO: implement other cases
    return columns;
};

export const getSelectedColumns = (df_id: string): string[] | null => {
    const state = store.getState();
    const columnSelection = state.dataFrames.columnSelector[df_id].columns;
    const columns = Object.keys(columnSelection).filter((item) => columnSelection[item] === true);
    console.log("Columns: ", columns, columnSelection);
    return columns;
};

export const handleGetRegisteredUDFs = (result: IMessage) => {
    // console.log("DataFrameManager got results 2");
    store.dispatch(setRegisteredUDFs(result.content));
};

const sendCalculateUDF = (socket: Socket, udfName: string, df_id: string, col_list: string[]) => {
    let message = createMessage(WebAppEndpoint.DataFrameManager, CommandName.compute_udf, udfName, {
        df_id: df_id,
        col_list: col_list,
    });
    sendMessage(socket, WebAppEndpoint.DataFrameManager, message);
};

const isUDFCalculated = (df_id: string, col_list: string[], udfName: string) => {
    const dfMetadata = store.getState().dataFrames.metadata[df_id];
    /** only need to check the first column */
    if (col_list.length > 0) {
        return (
            dfMetadata.columns[col_list[0]].udfs && dfMetadata.columns[col_list[0]].udfs[udfName]
        );
    } else {
        /** nothing to calculate here */
        return true;
    }
};

export const calculateUDFs = (
    socket: Socket,
    udfSelection: IDataFrameUDFSelection,
    df_id: string,
    col_list: string[]
) => {
    for (const udfName in udfSelection.udfs) {
        if (
            col_list.length > 0 &&
            udfSelection.udfs[udfName] &&
            !isUDFCalculated(df_id, col_list, udfName)
        ) {
            sendCalculateUDF(socket, udfName, df_id, col_list);
        }
    }
};
