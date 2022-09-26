/* *
 * This module keeps track of active dataframes.
 * This is a single point of entry for DF management on client side with one exception ...
 * A dataframe will be added to this list when it is first created and updated when it changes.
 * `isUpdated` flag is used to indicate whether the DF has changed .
 * `isDisplayed` flag is used to indicate whether the DF is being displayed.
 * if `isUpdated == True` and `isDisplayed == True` then DF metadata and 10 rows of table data will be updated.
 * */

import React, { useContext, useEffect } from "react";
import { IMessage, WebAppEndpoint, CommandName, ContentType } from "../../interfaces/IApp";
import { DataFrameUpdateType, IAllDataFrameStatus } from "../../interfaces/IDataFrameStatus";
import { SocketContext } from "../Socket";
import {
    setTableData,
    setColumnHistogramPlot,
    setMetadata,
    setDFUpdates,
    setActiveDF,
    setColumnQuantilePlot,
} from "../../../redux/reducers/DataFramesRedux";

//redux
import { useSelector, useDispatch } from "react-redux";
import store, { RootState } from "../../../redux/store";
import {
    createMessage,
    getColumnsToGetStats,
    getDefinedStat,
    getLastUpdate,
    handleActiveDFStatus,
    handleGetDFMetadata,
    handleGetTableData,
    hasDefinedStats,
    sendGetTableData,
    sendGetTableDataAroundRowIndex,
    sendMessage,
} from "./libDataFrameManager";
import { setTextOutput } from "../../../redux/reducers/RichOutputRedux";
import { Socket } from "socket.io-client";
import { handlePlotColumnHistogram } from "./udf/histogram_plots/libHistogramPlots";
import { handlePlotColumnQuantile } from "./udf/quantile_plots/libQuantilePlots";
import { IDataFrameFilter } from "../../interfaces/IDataFrameManager";

const DataFrameManager = () => {
    const socket = useContext(SocketContext);
    const dispatch = useDispatch();
    const loadDataRequest = useSelector((state: RootState) => state.dataFrames.loadDataRequest);

    const dfFilter = useSelector((state: RootState) => state.dataFrames.dfFilter);

    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);

    const dataFrameConfig = useSelector((state: RootState) => state.dataFrames.stats);

    useEffect(() => {
        const state = store.getState().dataFrames;
        const activeDF = state.activeDataFrame;
        if (activeDF != null && state.metadata[activeDF] != null && socket) {
            const df_id = state.metadata[activeDF].df_id;
            const columns = getColumnsToGetStats(df_id);
            if (columns) getDefinedStat(socket, dataFrameConfig, df_id, columns);
        }
    }, [dataFrameConfig]);

    const socketInit = () => {
        // console.log('DFManager useEffect');
        socket?.emit("ping", "DataFrameManager");
        socket?.on(WebAppEndpoint.DFManager, (result: string, ack) => {
            try {
                let message: IMessage = JSON.parse(result);
                console.log("DataFrameManager got results for command ", message);
                if (!message.error) {
                    if (message.type === ContentType.STRING || message.error === true) {
                        dispatch(setTextOutput(message));
                    } else if (message.command_name == CommandName.update_df_status) {
                        handleActiveDFStatus(socket, message);
                    } else if (message.command_name == CommandName.reload_df_status) {
                        console.log("DataFrameManager reload_df_status:", message);
                        handleActiveDFStatus(socket, message, true);
                    } else if (message.command_name == CommandName.get_table_data) {
                        handleGetTableData(message);
                    } else if (message.command_name == CommandName.plot_column_histogram) {
                        handlePlotColumnHistogram(message);
                    } else if (message.command_name == CommandName.plot_column_quantile) {
                        handlePlotColumnQuantile(message);
                    } else if (message.command_name == CommandName.get_df_metadata) {
                        handleGetDFMetadata(socket, dataFrameConfig, message);
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
        let message = createMessage(CommandName.reload_df_status, null, {});
        sendMessage(socket, message);
    };

    useEffect(() => {
        socketInit();
        return () => {
            socket?.off(WebAppEndpoint.DFManager);
        };
    }, [socket]); //TODO: run this only once - not on rerender

    useEffect(() => {
        if (loadDataRequest.df_id && socket) {
            sendGetTableDataAroundRowIndex(
                socket,
                loadDataRequest.df_id,
                loadDataRequest.row_index
            );
        }
    }, [loadDataRequest]);

    useEffect(() => {
        if (dfFilter && socket) {
            // clear the text output message
            dispatch(setTextOutput({ content: "" }));
            sendGetTableData(socket, dfFilter.df_id, dfFilter.query);
        }
    }, [dfFilter]);

    useEffect(() => {
        if (activeDataFrame != null) {
            let state = store.getState();
            if (!hasDefinedStats(activeDataFrame, state.dataFrames)) {
                let metadata = state.dataFrames.metadata[activeDataFrame];
                if (metadata) {
                    let columns: string[] = Object.keys(metadata.columns);
                    getDefinedStat(socket, dataFrameConfig, activeDataFrame, columns);
                }
            }
        }
    }, [activeDataFrame]);

    return null;
};

export default DataFrameManager;
