/* *
 * This module keeps track of active dataframes.
 * This is a single point of entry for DF management on client side with one exception ...
 * A dataframe will be added to this list when it is first created and updated when it changes.
 * `isUpdated` flag is used to indicate whether the DF has changed .
 * `isDisplayed` flag is used to indicate whether the DF is being displayed.
 * if `isUpdated == True` and `isDisplayed == True` then DF metadata and 10 rows of table data will be updated.
 * */

import React, { useContext, useEffect, useState } from "react";
import { IMessage, WebAppEndpoint, CommandName, ContentType } from "../../interfaces/IApp";
import { sendMessage, SocketContext } from "../Socket";

//redux
import { useSelector, useDispatch } from "react-redux";
import store, { RootState } from "../../../redux/store";
import {
    createMessage,
    getColumnsToGetStats,
    calculateUDFs,
    handleActiveDFStatus,
    handleGetDFMetadata,
    handleGetRegisteredUDFs,
    handleGetTableData,
    sendGetTableData,
} from "./libDataFrameManager";
import { setTextOutput } from "../../../redux/reducers/RichOutputRedux";

import { handleGetComputeUDFs } from "./udf/libUDF";

const DataFrameManager = () => {
    const socket = useContext(SocketContext);
    const dispatch = useDispatch();
    const loadDataRequest = useSelector((state: RootState) => state.dataFrames.loadDataRequest);
    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);
    const udfsSelector = useSelector((state: RootState) =>
        activeDataFrame ? state.dataFrames.udfsSelector[activeDataFrame] : null
    );
    const dfFilter = useSelector((state: RootState) =>
        activeDataFrame ? state.dataFrames.dfFilter[activeDataFrame] : null
    );

    const dataPanelFocusSignal = useSelector(
        (state: RootState) => state.dataFrames.dataPanelFocusSignal
    );
    const [executing, setExecuting] = useState(false);

    const socketInit = () => {
        // console.log('DataFrameManager useEffect');
        socket?.emit("ping", "DataFrameManager");
        socket?.on(WebAppEndpoint.DataFrameManager, (result: string, ack) => {
            try {
                let message: IMessage = JSON.parse(result);
                console.log("DataFrameManager got results for command ", message);
                if (!message.error) {
                    if (message.type === ContentType.STRING) {
                        dispatch(setTextOutput(message));
                    } else if (message.command_name == CommandName.update_df_status) {
                        handleActiveDFStatus(socket, message);
                    } else if (message.command_name == CommandName.reload_df_status) {
                        console.log("DataFrameManager reload_df_status:", message);
                        handleActiveDFStatus(socket, message, true);
                    // } else if (message.command_name == CommandName.get_table_data) {
                    //     handleGetTableData(message);
                    } else if (message.command_name == CommandName.get_df_metadata) {
                        handleGetDFMetadata(message);
                    } else if (message.command_name == CommandName.get_registered_udfs) {
                        handleGetRegisteredUDFs(message);
                    } else if (message.command_name == CommandName.compute_udf) {
                        handleGetComputeUDFs(message);
                    } else {
                        // console.log("dispatch text output");
                        dispatch(setTextOutput(message));
                    }
                } else {
                    dispatch(setTextOutput(message));
                }
            } catch (error) {
                console.error(error);
            }
            if (ack) ack();
        });
        /** Load dataframe status */
        let message = createMessage(
            WebAppEndpoint.DataFrameManager,
            CommandName.reload_df_status,
            null,
            {}
        );
        sendMessage(socket, WebAppEndpoint.DataFrameManager, message);
    };

    useEffect(() => {
        const state = store.getState().dataFrames;
        const activeDataFrame = state.activeDataFrame;
        if (
            udfsSelector &&
            activeDataFrame != null &&
            state.metadata[activeDataFrame] != null &&
            socket
        ) {
            // const df_id = state.metadata[activeDataFrame].df_id;
            const columns = getColumnsToGetStats(activeDataFrame);
            if (columns) calculateUDFs(socket, udfsSelector, activeDataFrame, columns);
        }
    }, [udfsSelector]);

    useEffect(() => {
        socketInit();
        return () => {
            socket?.off(WebAppEndpoint.DataFrameManager);
        };
    }, [socket]); //TODO: run this only once - not on rerender

    useEffect(() => {
        let message = createMessage(
            WebAppEndpoint.DataFrameManager,
            CommandName.get_registered_udfs,
            null,
            {}
        );
        sendMessage(socket, WebAppEndpoint.DataFrameManager, message);
    }, [dataPanelFocusSignal]);

    useEffect(() => {
        // if (loadDataRequest.df_id && socket && activeDataFrame) {
        //     sendGetTableData(
        //         socket,
        //         loadDataRequest.df_id,
        //         dfFilter ? dfFilter.query : null,
        //         loadDataRequest.from_index
        //     );
        // }
    }, [loadDataRequest]);

    // useEffect(() => {
    //     if (dfFilter && socket && activeDataFrame) {
    //         // clear the text output message
    //         dispatch(setTextOutput({ content: null }));
    //         sendGetTableData(socket, activeDataFrame, dfFilter.query);
    //     }
    // }, [dfFilter]);

    return null;
};

export default DataFrameManager;
