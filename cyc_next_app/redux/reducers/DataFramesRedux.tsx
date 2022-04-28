import { createSlice } from "@reduxjs/toolkit";
import {
    ReviewType,
    ITableData,
    IReviewRequest,
    ReviewRequestType,
    IDFUpdatesReview,
    IMetaData,
    IDataFrameStatsConfig,
    DFViewMode,
} from "../../lib/interfaces/IApp";
import { DataFrameUpdateType, IDataFrameStatus } from "../../lib/interfaces/IDataFrameStatus";
import { getLastUpdate } from "../../lib/components/dataframe-manager/libDataFrameManager";

interface ILoadDataRequest {
    df_id: string | null;
    count: number;
    row_index: number;
}

export type DataFrameState = {
    metadata: { [id: string]: IMetaData };
    tableData: { [id: string]: ITableData };
    // columnDataSummary: { [id: string]: {} };
    dfUpdates: { [id: string]: IDataFrameStatus };
    dfUpdatesReview: { [id: string]: IDFUpdatesReview };
    activeDataFrame: string | null;
    // this variable is used to indicate whether the tableData is being loaded.
    // this is used mainly for TableComponent to know when to show the table updates
    tableDataReady: boolean;
    // this is used to ask DFManager to load new data
    // currently only support loading by row index. 'count' is used to indicate new request
    loadDataRequest: ILoadDataRequest;
    loadColumnHistogram: boolean;
    dfFilter: null;
    stats: IDataFrameStatsConfig;
    dataViewMode: string;
    // dfUpdateCount: number;
};

const initialState: DataFrameState = {
    metadata: {},
    tableData: {},
    // columnDataSummary: {},
    dfUpdates: {},
    dfUpdatesReview: {},
    activeDataFrame: null,
    // this variable is used to indicate whether the tableData is being loaded.
    // this is used mainly for TableComponent to know when to show the table updates
    tableDataReady: false,
    // this is used to ask DFManager to load new data
    // currently only support loading by row index. 'count' is used to indicate new request
    loadDataRequest: { df_id: null, count: 0, row_index: 0 },
    loadColumnHistogram: false,
    dfFilter: null,
    stats: { histogram: false, quantile: false },
    dataViewMode: DFViewMode.TABLE_VIEW,
    // dfUpdateCount: 0,
};

export const dataFrameSlice = createSlice({
    name: "dataFrames",
    initialState: initialState,
    reducers: {
        // this function will add the initial data of the dataframe including: df name, column names, row data
        setTableData: (state, action) => {
            // for testing
            // state.data = testTableData
            const df_id = action.payload["df_id"];
            state.tableData[df_id] = action.payload;

            // comment out because this create side effect. explicitly set this outside when table is set.
            // state.activeDataFrame = df_id;

            //TODO do the same for columnHistogram
            // if (!(df_id in state.columnDataSummary)) {
            //     state.columnDataSummary[df_id] = {};
            // }
            // state.dataFrameUpdates[df_id] = ifElseDict(action.payload, 'updates');
            // action.payload['updates']?action.payload['updates']:{}
        },

        setMetaData: (state, action) => {
            // for testing
            // state.data = testTableData
            const df_id = action.payload["df_id"];
            state.metadata[df_id] = action.payload;
        },

        // setColumnHistogramPlot: (state, action) => {
        //     // for testing
        //     // state.data = testTableData
        //     const df_id = action.payload['df_id'];
        //     const col_name = action.payload['col_name'];
        //     if (!(df_id in state.columnHistogram)){
        //         state.columnHistogram[df_id] = {};
        //     }
        //     // if ('plot' in action.payload){
        //         // state.columnHistogram[df_id][col_name] = action.payload['plot'];
        //     // }
        //     state.columnHistogram[df_id][col_name] = ifElseDict(action.payload, 'plot');
        //     state.loadColumnHistogram = false;
        // },

        setColumnHistogramPlot: (state, action) => {
            // for testing
            // state.data = testTableData
            const df_id = action.payload["df_id"];
            const col_name = action.payload["col_name"];
            state.metadata[df_id].columns[col_name].histogram_plot = action.payload["data"];
        },

        setColumnQuantilePlot: (state, action) => {
            // for testing
            // state.data = testTableData
            const df_id = action.payload["df_id"];
            const col_name = action.payload["col_name"];
            state.metadata[df_id].columns[col_name].quantile_plot = action.payload["data"];
        },

        /**
         * Process the df updage message.
         * Setup the review context as needed.
         */
        setDFUpdates: (state, action) => {
            const df_id = action.payload["df_id"];
            if (df_id) {
                const status = action.payload as IDataFrameStatus;
                const update = getLastUpdate(status);
                // console.log("Update type: ", updates.update_type);

                // reset this everytime there is an update
                delete state.dfUpdatesReview[df_id];
                if (status.is_updated) {
                    if (
                        update.update_type == DataFrameUpdateType.add_cols &&
                        Array.isArray(update.update_content)
                    ) {
                        state.dfUpdatesReview[df_id] = {
                            enable: false,
                            index: 0,
                            name: update.update_content[0],
                            count: 0,
                            type: ReviewType.col,
                            length: update.update_content.length,
                        };
                        state.loadColumnHistogram = true;
                    } else if (
                        update.update_type == DataFrameUpdateType.add_rows &&
                        Array.isArray(update.update_content)
                    ) {
                        state.dfUpdatesReview[df_id] = {
                            enable: false,
                            index: 0,
                            name: update.update_content[0],
                            count: 0,
                            type: ReviewType.row,
                            length: update.update_content.length,
                        };
                        state.loadColumnHistogram = true;
                    } else if (update.update_type == DataFrameUpdateType.update_cells) {
                        // console.log('Update content: ', Object.keys(updates.update_content));
                        let colNames = Object.keys(update.update_content);
                        let colEndIndex = [];
                        let endIndex = 0;
                        let update_content = update.update_content as {
                            [id: string]: number[];
                        };
                        for (let col of colNames) {
                            endIndex += update_content[col].length;
                            colEndIndex.push(endIndex);
                        }
                        let col_0 = colNames[0];
                        if (update_content[col_0].length > 0) {
                            state.dfUpdatesReview[df_id] = {
                                enable: false,
                                index: 0,
                                name: [colNames[0], update_content[col_0][0]],
                                count: 0,
                                type: ReviewType.cell,
                                length: endIndex,
                                updates_col_index: 0,
                                updates_row_index: 0,
                                col_names: colNames,
                                col_end_index: colEndIndex,
                            };
                            state.loadColumnHistogram = true;
                            console.log(
                                "DataFramesRedux: ",
                                update.update_content,
                                state.dfUpdatesReview["df"]
                            );
                        }
                    } else if (update.update_type == DataFrameUpdateType.new_df) {
                        // state.columnHistogram = {};
                        // state.columnDataSummary[df_id] = {};
                        state.loadColumnHistogram = true;
                    }
                    status.is_showed = false;
                }
                state.dfUpdates[df_id] = status; //ifElseDict(action.payload, 'updates');
                // state.dfUpdateCount++;
            }
        },
        /** set the showed state of the active dataframe status */
        setDFStatusShowed: (state, action) => {
            let is_showed = action.payload;
            const status = state.dfUpdates[state.activeDataFrame];
            if (status != null) {
                status.is_showed = is_showed;
            }
        },

        setReview: (state, action) => {
            let reviewRequest: IReviewRequest = action.payload;
            let dfUpdatesReview: IDFUpdatesReview = state.dfUpdatesReview[state.activeDataFrame];

            // let updates = updates.update_content;
            if (dfUpdatesReview != null) {
                const status = state.dfUpdates[state.activeDataFrame];
                const update = getLastUpdate(status);
                if (reviewRequest.type == ReviewRequestType.repeat) {
                    dfUpdatesReview.count += 1;
                } else if (
                    reviewRequest.type == ReviewRequestType.next &&
                    dfUpdatesReview.index < dfUpdatesReview.length - 1
                ) {
                    dfUpdatesReview.count += 1;
                    dfUpdatesReview.index += 1;
                    if (update.update_type == DataFrameUpdateType.update_cells) {
                        if (
                            dfUpdatesReview.col_end_index != null &&
                            dfUpdatesReview.updates_col_index != null &&
                            dfUpdatesReview.index ==
                                dfUpdatesReview.col_end_index[dfUpdatesReview.updates_col_index]
                        ) {
                            dfUpdatesReview.updates_col_index += 1;
                            dfUpdatesReview.updates_row_index = 0;
                        } else if (dfUpdatesReview.updates_row_index != null) {
                            dfUpdatesReview.updates_row_index += 1;
                        }
                    }
                } else if (
                    reviewRequest.type == ReviewRequestType.prev &&
                    dfUpdatesReview.index >= 0
                ) {
                    dfUpdatesReview.count += 1;
                    dfUpdatesReview.index -= 1;
                    if (update.update_type == DataFrameUpdateType.update_cells) {
                        if (
                            dfUpdatesReview.col_end_index != null &&
                            dfUpdatesReview.updates_col_index != null &&
                            dfUpdatesReview.updates_col_index > 0 &&
                            dfUpdatesReview.index ==
                                dfUpdatesReview.col_end_index[dfUpdatesReview.updates_col_index - 1]
                        ) {
                            dfUpdatesReview.updates_col_index -= 1;
                            dfUpdatesReview.updates_row_index =
                                dfUpdatesReview.col_end_index[dfUpdatesReview.updates_col_index] -
                                1;
                        } else if (dfUpdatesReview.updates_row_index != null) {
                            dfUpdatesReview.updates_row_index -= 1;
                        }
                    }
                }
                let tableData: ITableData = state.tableData[state.activeDataFrame];
                let update_content = update.update_content;

                if (
                    update.update_type == DataFrameUpdateType.add_cols &&
                    Array.isArray(update_content)
                ) {
                    dfUpdatesReview.name = update_content[dfUpdatesReview.index];
                } else {
                    // check if the row needs to be loaded, if so make the data loading request
                    let reviewingDFRowIndex;
                    let colName;
                    if (
                        update.update_type == DataFrameUpdateType.add_rows &&
                        Array.isArray(update_content)
                    ) {
                        reviewingDFRowIndex = update_content[dfUpdatesReview.index];
                        dfUpdatesReview.name = reviewingDFRowIndex;
                    } else if (
                        update.update_type == DataFrameUpdateType.update_cells &&
                        dfUpdatesReview.col_names &&
                        dfUpdatesReview.updates_col_index != null &&
                        dfUpdatesReview.updates_row_index != null &&
                        typeof update_content === "object" &&
                        !Array.isArray(update_content)
                    ) {
                        colName = dfUpdatesReview.col_names[dfUpdatesReview.updates_col_index];
                        reviewingDFRowIndex =
                            update_content[colName][dfUpdatesReview.updates_row_index];
                        dfUpdatesReview.name = [colName, reviewingDFRowIndex];
                    }
                    // make data loading request if needed
                    if (
                        !tableData.index.data.includes(reviewingDFRowIndex)
                        // && state.loadDataRequest.row_index != null
                    ) {
                        state.loadDataRequest.df_id = state.activeDataFrame;
                        state.loadDataRequest.count += 1;
                        state.loadDataRequest.row_index = reviewingDFRowIndex;
                    }
                }
            }
        },

        setActiveDF: (state, action) => {
            state.activeDataFrame = action.payload;
        },

        setDFFilter: (state, action) => {
            state.dfFilter = action.payload;
        },

        setStatsConfig: (state, action) => {
            if (action.payload) {
                state.stats = { ...action.payload };
            }
        },

        setDataViewMode: (state, action) => {
            if (action.payload) {
                state.dataViewMode = action.payload;
            }
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    setTableData,
    setMetaData,
    setColumnHistogramPlot,
    setDFUpdates,
    setReview,
    setActiveDF,
    setDFFilter,
    setColumnQuantilePlot,
    setStatsConfig,
    setDataViewMode,
    setDFStatusShowed,
} = dataFrameSlice.actions;

export default dataFrameSlice.reducer;
