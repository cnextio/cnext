/* *
 * This module keeps track of active dataframes.
 * This is a single point of entry for DF management on client side with one exception ...
 * A dataframe will be added to this list when it is first created and updated when it changes.
 * `isUpdated` flag is used to indicate whether the DF has changed .
 * `isDisplayed` flag is used to indicate whether the DF is being displayed.
 * if `isUpdated == True` and `isDisplayed == True` then DF metadata and 10 rows of table data will be updated.
 * */

import React, { useEffect } from "react";
import {
    Message,
    WebAppEndpoint,
    CommandName,
    UpdateType,
} from "../../interfaces/IApp";
import socket from "../Socket";
import {
    setTableData,
    setColumnHistogramPlot,
    setMetaData,
    setCountNA,
    setDFUpdates,
    setActiveDF,
    setColumnQuantilePlot,
} from "../../../redux/reducers/DataFramesRedux";

//redux
import { useSelector, useDispatch } from "react-redux";
import store, { RootState } from "../../../redux/store";
import { ifElse, ifElseDict } from "../libs";

const DFManager = () => {
    const dispatch = useDispatch();
    const loadDataRequest = useSelector(
        (state: RootState) => state.dataFrames.loadDataRequest
    );
    const dfFilter = useSelector((state: RootState) => state.dataFrames.dfFilter);

    const sendMessage = (message: {}) => {
        console.log(
            `Send ${WebAppEndpoint.DFManager} request: `,
            JSON.stringify(message)
        );
        socket.emit(WebAppEndpoint.DFManager, JSON.stringify(message));
    };

    const createMessage = (
        command_name: string,
        content: string,
        seq_number: number,
        metadata: {}
    ) => {
        let message = {};
        message["webapp_endpoint"] = WebAppEndpoint.DFManager;
        message["command_name"] = command_name;
        message["seq_number"] = seq_number;
        message["content"] = content;
        message["metadata"] = metadata;
        return message;
    };

    const sendColumnHistogramPlotRequest = (
        df_id: string,
        col_name: string
    ) => {
        let content: string = `px.histogram(${df_id}, x="${col_name}")`;
        let message = createMessage(
            CommandName.plot_column_histogram,
            content,
            1,
            {
                df_id: df_id,
                col_name: col_name,
            }
        );
        sendMessage(message);
    };

    const sendColumnQuantilesPlotRequest = (
        df_id: string,
        col_name: string
    ) => {
        let content: string = `px.box(${df_id}, x="${col_name}")`;
        let message = createMessage(
            CommandName.plot_column_quantile,
            content,
            1,
            {
                df_id: df_id,
                col_name: col_name,
            }
        );
        console.log("here", JSON.stringify(message));
        sendMessage(message);
    };

    const sendGetCountna = (df_id: string) => {
        // FIXME: the content is actually not important because python server will generate the python command itself based on CommandName
        let content: string = `${df_id}.isna().sum()`;
        let message = createMessage(CommandName.get_countna, content, 1, {
            df_id: df_id,
        });
        sendMessage(message);
    };

    const DF_DISPLAY_HALF_LENGTH = 15;
    const sendGetTableDataAroundRowIndex = (
        df_id: string,
        around_index: number = 0
    ) => {
        let queryStr: string = `${df_id}.iloc[(${df_id}.index.get_loc(${around_index})-${DF_DISPLAY_HALF_LENGTH} 
                                if ${df_id}.index.get_loc(${around_index})>=${DF_DISPLAY_HALF_LENGTH} else 0)
                                :${df_id}.index.get_loc(${around_index})+${DF_DISPLAY_HALF_LENGTH}]`;        
        let message = createMessage(CommandName.get_table_data, queryStr, 1, {
            df_id: df_id,
        });
        // console.log("Send get table: ", message);
        sendMessage(message);
    };

    const sendGetTableData = (df_id: string, filter: string | null = null) => {
        let queryStr: string;
        if (filter) {
            queryStr = `${df_id}${filter}.head(${DF_DISPLAY_HALF_LENGTH * 2})`;
        } else {
            queryStr = `${df_id}.head(${DF_DISPLAY_HALF_LENGTH * 2})`;
        }
        let message = createMessage(CommandName.get_table_data, queryStr, 1, {
            df_id: df_id,
        });
        // console.log("_send_get_table_data message: ", message);
        sendMessage(message);
    };

    //TODO: create a targeted column function
    const sendGetDFMetadata = (df_id: string) => {
        let message = createMessage(CommandName.get_df_metadata, "", 1, {
            df_id: df_id,
        });
        // console.log("_send_get_table_data message: ", message);
        sendMessage(message);
    };

    const handleGetCountna = (message: {}) => {
        const content = message.content;
        // content['df_id'] = message.metadata['df_id'];
        console.log("Dispatch ", message.content);
        dispatch(setCountNA(content));
    };

    const getHistogramPlot = (df_id: string, col_list: string[]) => {
        for (var i = 0; i < col_list.length; i++) {
            const col_name = col_list[i];
            sendColumnHistogramPlotRequest(df_id, col_name);
        }
    };

    const getQuantilesPlot = (df_id: string, col_list: string[]) => {
        for (var col_name of col_list) {
            sendColumnQuantilesPlotRequest(df_id, col_name);
        }
    };

    const handleActiveDFStatus = (message: {}) => {
        console.log(
            "DFManager got active df status message: ",
            message.content
        );
        const dfStatusContent = message.content;

        // console.log(dfStatusContent);
        // the UI is currently designed to handle only 1 reviewable update at a time
        // but will still scan through everything here for now
        Object.keys(dfStatusContent).forEach(function (df_id) {
            if (dfStatusContent[df_id]["is_updated"] == true) {
                // console.log(df_id, dfStatusContent[df_id]);
                let status_list = ifElseDict(
                    dfStatusContent[df_id],
                    "_status_list"
                );
                let lastUpdate = status_list[status_list.length - 1];
                let dfUpdates = ifElseDict(lastUpdate, "updates");
                let updateType = ifElse(dfUpdates, "update_type", null);
                let updateContent = ifElse(dfUpdates, "update_content", null);
                console.log("DFManager: active df updates: ", dfUpdates);
                sendGetDFMetadata(df_id);
                if (updateType == UpdateType.add_rows) {
                    // show data around added rows
                    sendGetTableDataAroundRowIndex(df_id, updateContent[0]);
                } else {
                    sendGetTableData(df_id);
                }
                // make redux object conform to our standard
                let dfUpdateMessage = { df_id: df_id, ...lastUpdate };
                dispatch(setDFUpdates(dfUpdateMessage));
                // dispatch(setDFUpdates(dataFrameUpdateMessage));
            }
        });
    };

    const showHistogram = true;
    const handleGetTableData = (message: {}) => {
        const df_id = message.metadata["df_id"];
        // const tableData = JSON.parse(message.content);
        const tableData = message.content;
        console.log("DFManager: dispatch to tableData (DataFrame) ", tableData);
        dispatch(setTableData(tableData));
        dispatch(setActiveDF(df_id));
        // const tableData = message.content;

        /**
         *  check to see if column histogram need to be reload
         * */
        // const state = store.getState();
        // const dfUpdates = ifElseDict(state.dataFrames.dfUpdates, df_id);
        // const loadColumnHistogram = state.dataFrames.loadColumnHistogram;
        // if(showHistogram && loadColumnHistogram){
        //     if (dfUpdates['update_type'] == UpdateType.add_cols){
        //         //only update histogram of columns that has been updated
        //         let newColumns = dfUpdates['update_content'];
        //         console.log("Send request for column histograms for columns: ", newColumns);
        //         _getHistogramPlot(df_id, newColumns);
        //         _sendGetCountna(df_id);
        //     } else if((dfUpdates['update_type'] == UpdateType.add_rows) ||
        //                 (dfUpdates['update_type'] == UpdateType.new_df) ||
        //                 (dfUpdates['update_type'] == UpdateType.update_cells)){ //TODO: be more targeted with updated_cell
        //         console.log("Send request for column histograms");
        //         _getHistogramPlot(df_id, tableData['column_names']);
        //         _sendGetCountna(df_id);
        //     } //TODO: implement other cases
        // }
    };

    const handlePlotColumnHistogram = (message: {}) => {
        console.log(
            `${WebAppEndpoint.DFManager} get plot data for "${message.metadata["df_id"]}" "${message.metadata["col_name"]}"`
        );
        let content = message.content;
        // content["plot"] = JSON.parse(content["plot"]);
        dispatch(setColumnHistogramPlot(content));
    };

    const handlePlotColumnQuantile = (message: {}) => {
        console.log(
            `${WebAppEndpoint.DFManager} get quantile plot for "${message.metadata["df_id"]}" "${message.metadata["col_name"]}"`
        );
        let content = message.content;
        // content["plot"] = JSON.parse(content["plot"]);
        dispatch(setColumnQuantilePlot(content));
    };

    const handleGetDFMetadata = (message: {}) => {
        console.log(
            `${WebAppEndpoint.DFManager} got metadata for "${message.metadata["df_id"]}"`
        );
        let dfMetadata = message.content;
        let columns: string[] = Object.keys(dfMetadata.columns);
        let df_id = message.metadata["df_id"];
        console.log("Metadata", columns);
        dispatch(setMetaData(dfMetadata));

        //TODO: consider move this to handleActiveDFStatus
        const state = store.getState();
        const dfUpdates = ifElseDict(state.dataFrames.dfUpdates, df_id);
        if (showHistogram) {
            if (dfUpdates["update_type"] === UpdateType.add_cols) {
                //only update histogram of columns that has been updated
                let newColumns = dfUpdates["update_content"];
                console.log(
                    "DFManager: send request for column histograms for columns: ",
                    newColumns
                );
                // _getQuantilesPlot(df_id, newColumns);
                // _getHistogramPlot(df_id, newColumns);
                getQuantilesPlot(df_id, columns);
                getHistogramPlot(df_id, columns);
                sendGetCountna(df_id);
            } else if (
                dfUpdates["update_type"] === UpdateType.add_rows ||
                dfUpdates["update_type"] === UpdateType.del_rows ||
                dfUpdates["update_type"] === UpdateType.new_df ||
                dfUpdates["update_type"] === UpdateType.update_cells
            ) {
                //TODO: be more targeted with updated_cell
                console.log("DFManager: send request for column histograms");
                getQuantilesPlot(df_id, columns);
                getHistogramPlot(df_id, columns);
                sendGetCountna(df_id);
            } //TODO: implement other cases
        }
    };

    useEffect(() => {
        // console.log('DFManager useEffect');
        socket.emit("ping", "DFManager");
        socket.on(WebAppEndpoint.DFManager, (result: string) => {
            try {
                let message: Message = JSON.parse(result);
                console.log(
                    "DFManager got results for command ",
                    message.command_name
                );
                if (message.error == true) {
                    // props.recvCodeOutput(message); //TODO move this to redux
                } else if (
                    message.command_name == CommandName.active_df_status
                ) {
                    handleActiveDFStatus(message);
                } else if (message.command_name == CommandName.get_table_data) {
                    handleGetTableData(message);
                } else if (
                    message.command_name == CommandName.plot_column_histogram
                ) {
                    handlePlotColumnHistogram(message);
                } else if (
                    message.command_name == CommandName.plot_column_quantile
                ) {
                    handlePlotColumnQuantile(message);
                } else if (message.command_name == CommandName.get_countna) {
                    handleGetCountna(message);
                } else if (
                    message.command_name == CommandName.get_df_metadata
                ) {
                    handleGetDFMetadata(message);
                } else {
                    console.log("dispatch text output");
                    // props.recvCodeOutput(codeOutput);
                }
            } catch {}
        });
        // editorRef;
    }, []); //TODO: run this only once - not on rerender

    useEffect(() => {
        if (loadDataRequest.df_id) {
            sendGetTableDataAroundRowIndex(
                loadDataRequest.df_id,
                loadDataRequest.row_index
            );
        }
    }, [loadDataRequest]);

    useEffect(() => {
        if (dfFilter) {
            sendGetTableData(dfFilter.df_id, dfFilter.query);
        }
    }, [dfFilter]);
    return null;
};

export default DFManager;