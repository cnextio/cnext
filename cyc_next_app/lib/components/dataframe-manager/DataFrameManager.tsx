/* *
 * This module keeps track of active dataframes.
 * This is a single point of entry for DF management on client side with one exception ...
 * A dataframe will be added to this list when it is first created and updated when it changes.
 * `isUpdated` flag is used to indicate whether the DF has changed .
 * `isDisplayed` flag is used to indicate whether the DF is being displayed.
 * if `isUpdated == True` and `isDisplayed == True` then DF metadata and 10 rows of table data will be updated.
 * */

import React, { useEffect } from "react";
import { IMessage, WebAppEndpoint, CommandName, ContentType } from "../../interfaces/IApp";
import { DataFrameUpdateType, IAllDataFrameStatus } from "../../interfaces/IDataFrameStatus";
import socket from "../Socket";
import {
    setTableData,
    setColumnHistogramPlot,
    setMetaData,
    setDFUpdates,
    setActiveDF,
    setColumnQuantilePlot,
} from "../../../redux/reducers/DataFramesRedux";

//redux
import { useSelector, useDispatch } from "react-redux";
import store, { RootState } from "../../../redux/store";
import { getLastUpdate, hasDefinedStats } from "./libDataFrameManager";
import { setTextOutput } from "../../../redux/reducers/RichOutputRedux";

const DataFrameManager = () => {
    const dispatch = useDispatch();
    const loadDataRequest = useSelector((state: RootState) => state.dataFrames.loadDataRequest);

    const dfFilter = useSelector((state: RootState) => state.dataFrames.dfFilter);

    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);

    const dataFrameConfig = useSelector((state: RootState) => state.dataFrames.stats);

    const sendMessage = (message: IMessage) => {
        console.log(`Send DataFrameManager request: `, JSON.stringify(message));
        socket.emit(WebAppEndpoint.DFManager, JSON.stringify(message));
    };

    const createMessage = (
        command_name: CommandName,
        content: string | null = null,
        seq_number: number = 1,
        metadata: {}
    ): IMessage => {
        let message: IMessage = {
            webapp_endpoint: WebAppEndpoint.DFManager,
            command_name: command_name,
            seq_number: seq_number,
            content: content,
            metadata: metadata,
            type: ContentType.COMMAND,
        };

        return message;
    };

    const MAX_POINT_COUNT = 10000;
    const sendColumnHistogramPlotRequest = (df_id: string, col_name: string) => {
        // let content: string = `px.histogram(${df_id}, x="${col_name}")`;
        let content: string = `
from libs.json_serializable import JsonSerializable 
import plotly.express as px, plotly.io as pio, simplejson as json
#pio.renderers.default = "json"        
def _tmp():    
    if ${df_id}["${col_name}"].dtypes not in ["object"]:
        if ${df_id}.shape[0] > ${MAX_POINT_COUNT}:
            _tmp_df = ${df_id}.sample(${MAX_POINT_COUNT})
        else:
            _tmp_df = ${df_id}
        fig = px.histogram(_tmp_df, x="${col_name}")
    else:
        fig = px.bar(${df_id}["${col_name}"].value_counts()[:])
    fig.update_layout({
        'showlegend': False,
        #'width': 600, 
        #'height': 400, 
        'margin': {'b': 0, 'l': 0, 'r': 0, 't': 0}, 
        'xaxis': {'showticklabels': False},
        'yaxis': {'showticklabels': False},
        'hoverlabel': {
            'bgcolor': "rgba(0,0,0,0.04)", 
            'bordercolor': "rgba(0,0,0,0.04)", 
            'font': {'color': "rgba(0,0,0,0.6)", 'size': 12 }
    }})
    
    fig.update_yaxes(visible=False, showticklabels=False)
    fig.update_xaxes(visible=False, showticklabels=False)
    return JsonSerializable({"mime_type": "image/plotly+json", "data": json.loads(fig.to_json())})
_tmp()`;
        let message = createMessage(CommandName.plot_column_histogram, content, 1, {
            df_id: df_id,
            col_name: col_name,
        });
        sendMessage(message);
    };

    const sendColumnQuantilesPlotRequest = (df_id: string, col_name: string) => {
        let content: string = `
from libs.json_serializable import JsonSerializable 
import plotly.express as px, plotly.io as pio, simplejson as json
#pio.renderers.default = "json"
def _tmp():
    if ${df_id}["${col_name}"].dtypes not in ["object"]:
        if ${df_id}.shape[0] > ${MAX_POINT_COUNT}:
            _tmp_df = ${df_id}.sample(${MAX_POINT_COUNT})
        else:
            _tmp_df = ${df_id}
        fig = px.box(_tmp_df, x="${col_name}")
        fig.update_layout({
            'showlegend': False,
            #'width': 600, 
            #'height': 400, 
            'margin': {'b': 0, 'l': 0, 'r': 0, 't': 0}, 
            'xaxis': {'showticklabels': False},
            'yaxis': {'showticklabels': False},
            'hoverlabel': {
                'bgcolor': "rgba(0,0,0,0.04)", 
                'bordercolor': "rgba(0,0,0,0.04)", 
                'font': {'color': "rgba(0,0,0,0.6)", 'size': 12 }
        }})    
        fig.update_yaxes(visible=False, showticklabels=False)
        fig.update_xaxes(visible=False, showticklabels=False)
        return JsonSerializable({"mime_type": "image/plotly+json", "data": json.loads(fig.to_json())})
    else:
        return None
_tmp()`;
        //         let content: string = `
        // import io, base64, simplejson as json
        // import matplotlib.pyplot as plt
        // import seaborn as sns
        // from libs.json_serializable import JsonSerializable
        // def _tmp():
        //     if ${df_id}["${col_name}"].dtypes not in ["object"]:
        //         sns.set(rc = {'figure.figsize':(250,50)})
        //         sns.boxplot(x="${col_name}", data=${df_id})
        //         buffer = io.BytesIO()
        //         plt.savefig(buffer, format='png')
        //         buffer.seek(0)
        //         return JsonSerializable({"mime_type": "image/png", "data": base64.b64encode(buffer.read())})
        //     else:
        //         return None
        // _tmp()
        // `;

        let message = createMessage(CommandName.plot_column_quantile, content, 1, {
            df_id: df_id,
            col_name: col_name,
        });
        console.log("here", JSON.stringify(message));
        sendMessage(message);
    };

    // const sendGetCountna = (df_id: string) => {
    //     // FIXME: the content is actually not important because python server will generate the python command itself based on CommandName
    //     let content: string = `${df_id}.isna().sum()`;
    //     let message = createMessage(CommandName.get_countna, content, 1, {
    //         df_id: df_id,
    //     });
    //     sendMessage(message);
    // };

    const DF_DISPLAY_HALF_LENGTH = 15;
    const sendGetTableDataAroundRowIndex = (df_id: string, around_index: number = 0) => {
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

    useEffect(() => {
        const state = store.getState().dataFrames;
        const activeDF = state.activeDataFrame;
        if (activeDF != null && state.metadata[activeDF] != null) {
            const df_id = state.metadata[activeDF].df_id;
            const columns = getColumnsToGetStats(df_id);
            getDefinedStat(df_id, columns);
        }
    }, [dataFrameConfig]);

    const getDefinedStat = (df_id: string, columns: string[]) => {
        if (dataFrameConfig.quantile) {
            getQuantilesPlot(df_id, columns);
        }
        if (dataFrameConfig.histogram) {
            getHistogramPlot(df_id, columns);
        }
    };

    /** select columns to get stats based on the update type */
    const getColumnsToGetStats = (df_id: string): string[] | null => {
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

    /** Get defined stats if the dataframe has been updated */
    const getDefinedStatsOnUpdate = (df_id: string) => {
        let columns = getColumnsToGetStats(df_id);
        if (columns != null) {
            getDefinedStat(df_id, columns);
        }
    };

    const handleActiveDFStatus = (message: IMessage, reload: boolean = false) => {
        console.log("DataFrameManager got active df status message: ", message.content);
        const allDFStatus = message.content as IAllDataFrameStatus;

        // console.log(dfStatusContent);
        // the UI is currently designed to handle only 1 reviewable update at a time
        // but will still scan through everything here for now
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
                    console.log("DataFrameManager active df updates: ", update);
                    sendGetDFMetadata(df_id);
                    if (updateType == DataFrameUpdateType.add_rows) {
                        // show data around added rows
                        sendGetTableDataAroundRowIndex(df_id, updateContent[0]);
                    } else {
                        sendGetTableData(df_id);
                    }
                }
            }
            // make redux object conform to our standard
            let dfUpdateMessage = {
                df_id: df_id,
                ...allDFStatus[df_id],
            };
            dispatch(setDFUpdates(dfUpdateMessage));
        });
    };

    const isDataFrameUpdated = (df_id: string) => {
        const state = store.getState();
        const status = state.dataFrames.dfUpdates[df_id];
        return status.is_updated;
    };

    const handleGetTableData = (message: IMessage) => {
        const df_id = message.metadata["df_id"];
        // const tableData = JSON.parse(message.content);
        const tableData = message.content;
        console.log("DataFrameManager: dispatch to tableData (DataFrame) ", tableData);
        dispatch(setTableData(tableData));
        if (df_id != null && isDataFrameUpdated(df_id)) {
            dispatch(setActiveDF(df_id));
        }
    };

    const handlePlotColumnHistogram = (message: IMessage) => {
        console.log(
            `${WebAppEndpoint.DFManager} got plot data for "${message.metadata["df_id"]}" "${message.metadata["col_name"]}"`,
            message.content
        );
        const payload = {
            df_id: message.metadata["df_id"],
            col_name: message.metadata["col_name"],
            data: message.content,
        };
        dispatch(setColumnHistogramPlot(payload));
    };

    const handlePlotColumnQuantile = (message: IMessage) => {
        console.log(
            `${WebAppEndpoint.DFManager} got quantile plot for "${message.metadata["df_id"]}" "${message.metadata["col_name"]}"`
        );
        const payload = {
            df_id: message.metadata["df_id"],
            col_name: message.metadata["col_name"],
            data: message.content,
        };
        dispatch(setColumnQuantilePlot(payload));
    };

    const showDefinedStats = true;
    const handleGetDFMetadata = (message: IMessage) => {
        console.log(
            `${WebAppEndpoint.DFManager} got metadata for "${message.metadata["df_id"]}": `,
            message.content
        );
        let dfMetadata = message.content;
        dispatch(setMetaData(dfMetadata));

        let df_id = message.metadata["df_id"];
        if (df_id != null && isDataFrameUpdated(df_id) && showDefinedStats) {
            getDefinedStatsOnUpdate(df_id);
        }
    };

    const socketInit = () => {
        // console.log('DFManager useEffect');
        socket.emit("ping", "DFManager");
        socket.on(WebAppEndpoint.DFManager, (result: string) => {
            try {
                let message: IMessage = JSON.parse(result);
                console.log("DataFrameManager got results for command ", message);
                if (!message.error) {
                    if (message.type === ContentType.STRING || message.error === true) {
                        // let inViewID = store.getState().projectManager.inViewID;
                        // if (inViewID) {
                        //     let result: ICodeResultMessage = {
                        //         inViewID: inViewID,
                        //         content: message.content,
                        //         type: message.type,
                        //         subType: message.sub_type,
                        //         metadata: message.metadata,
                        //     };
                        //     dispatch(addResult(result));
                        // }
                        //TODO: display this on CodeOutput
                        console.log("DataFrameManager: got text output ", message);
                    } else if (message.command_name == CommandName.update_df_status) {
                        handleActiveDFStatus(message);
                    } else if (message.command_name == CommandName.reload_df_status) {
                        console.log("DataFrameManager reload_df_status:", message);
                        handleActiveDFStatus(message, true);
                    } else if (message.command_name == CommandName.get_table_data) {
                        handleGetTableData(message);
                    } else if (message.command_name == CommandName.plot_column_histogram) {
                        handlePlotColumnHistogram(message);
                    } else if (message.command_name == CommandName.plot_column_quantile) {
                        handlePlotColumnQuantile(message);
                        // } else if (message.command_name == CommandName.get_countna) {
                        //     handleGetCountna(message);
                    } else if (message.command_name == CommandName.get_df_metadata) {
                        handleGetDFMetadata(message);
                    } else {
                        // console.log("dispatch text output");
                        dispatch(setTextOutput(message))
                    }
                } else {
                    dispatch(setTextOutput(message));
                }
            } catch {}
        });
        /** Load dataframe status */
        let message = createMessage(CommandName.reload_df_status, null, 1, {});
        sendMessage(message);
    };

    useEffect(() => {
        socketInit();
        return () => {
            socket.off(WebAppEndpoint.DFManager);
        };
    }, []); //TODO: run this only once - not on rerender

    useEffect(() => {
        if (loadDataRequest.df_id != null) {
            sendGetTableDataAroundRowIndex(loadDataRequest.df_id, loadDataRequest.row_index);
        }
    }, [loadDataRequest]);

    useEffect(() => {
        if (dfFilter != null) {
            sendGetTableData(dfFilter.df_id, dfFilter.query);
        }
    }, [dfFilter]);

    useEffect(() => {
        if (activeDataFrame != null) {
            let state = store.getState();
            if (!hasDefinedStats(activeDataFrame, state.dataFrames) && showDefinedStats) {
                let metadata = state.dataFrames.metadata[activeDataFrame];
                if (metadata) {
                    let columns: string[] = Object.keys(metadata.columns);
                    getDefinedStat(activeDataFrame, columns);
                }
            }
        }
    }, [activeDataFrame]);

    return null;
};

export default DataFrameManager;
