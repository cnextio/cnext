import { createSlice } from "@reduxjs/toolkit";
import {
    ReviewType,
    ITableData,
    IReviewRequest,
    ReviewRequestType,
    IDFUpdatesReview,
    IMetadata,
    DFViewMode,
    IDataFrameUDFSelection,
} from "../../lib/interfaces/IApp";
import { DataFrameUpdateType, IDataFrameStatus } from "../../lib/interfaces/IDataFrameStatus";
import { getLastUpdate } from "../../lib/components/dataframe-manager/libDataFrameManager";
import { IDataFrameFilter, IRegisteredUDFs, UDF } from "../../lib/interfaces/IDataFrameManager";

interface ILoadDataRequest {
    df_id: string | null;
    count: number;
    row_index: number;
}

export type DataFrameState = {
    metadata: { [id: string]: IMetadata };
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
    dfFilter: IDataFrameFilter | null;
    dataViewMode: string;
    // dfUpdateCount: number;
    /** this number increase whenever DataPanel is focused */
    dataPanelFocusSignal: number;
    columnSelector: { [id: string]: any };
    udfsSelector: { [id: string]: IDataFrameUDFSelection };
    registeredUDFs: IRegisteredUDFs; //{ [name: string]: UDF };
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
    dataViewMode: DFViewMode.TABLE_VIEW,
    // dfUpdateCount: 0,
    dataPanelFocusSignal: 0,
    udfsSelector: {},
    registeredUDFs: { udfs: {}, timestamp: "0" },
    columnSelector: {},
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

        setMetadata: (state, action) => {
            // for testing
            // state.data = testTableData
            const df_id = action.payload["df_id"];
            state.metadata[df_id] = action.payload;
            let udfSelector: { [udfName: string]: boolean } = {};
            if (state.registeredUDFs instanceof Object) {
                for (const udfName in state.registeredUDFs.udfs) {
                    udfSelector[udfName] = false;
                }
                state.udfsSelector[df_id] = {
                    udfs: udfSelector,
                    timestamp: state.registeredUDFs.timestamp,
                };
                state.columnSelector[df_id] = {
                    columns: {},
                    timestamp: state.registeredUDFs.timestamp,
                };
            }
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

        setDataViewMode: (state, action) => {
            if (action.payload) {
                state.dataViewMode = action.payload;
            }
        },

        setDataPanelFocusSignal: (state) => {
            state.dataPanelFocusSignal++;
        },

        setRegisteredUDFs: (state, action) => {
            state.registeredUDFs = action.payload;
            for (const df_id in state.udfsSelector) {
                /** reset udfSelector if timestamp is different */
                if (state.udfsSelector[df_id].timestamp !== state.registeredUDFs.timestamp) {
                    let udfSelector: { [udfName: string]: boolean } = {};
                    for (const udfName in state.registeredUDFs.udfs) {
                        udfSelector[udfName] = false;
                    }
                    state.udfsSelector[df_id] = {
                        udfs: udfSelector,
                        timestamp: state.registeredUDFs.timestamp,
                    };
                    /** remove all existing udf data */
                    let columns = state.metadata[df_id].columns;
                    for (const udfName in state.registeredUDFs.udfs) {
                        for (let column_name in columns) {
                            if (columns[column_name].udfs)
                                columns[column_name].udfs[udfName] = null;
                        }
                    }
                }
            }
        },
        setColumnSelection: (state, action) => {
            const data = action.payload;
            if (data) {
                state.columnSelector[data.df_id].columns = data.selections;
                console.log("datadfgdfg", state.columnSelector, data);
            }
        },
        setUDFsSelection: (state, action) => {
            const data = action.payload;
            if (data) {
                state.udfsSelector[data.df_id].udfs = data.selections;

                /** remove udf data if unselected */
                let columns = state.metadata[data.df_id].columns;
                for (const udf in data.selections) {
                    if (!data.selections[udf]) {
                        for (let column_name in columns) {
                            if (columns[column_name].udfs) columns[column_name].udfs[udf] = null;
                        }
                    }
                }
            }
        },

        setComputeUDFData: (state, action) => {
            const udfName = action.payload["udf_name"];
            const df_id = action.payload["df_id"];
            const col_name = action.payload["col_name"];
            if (!("udfs" in state.metadata[df_id].columns[col_name]))
                state.metadata[df_id].columns[col_name].udfs = {};
            state.metadata[df_id].columns[col_name].udfs[udfName] = action.payload["data"];
        },

        setTableDataCellValue: (state, action) => {
            const data = action.payload;
            const df_id = data.df_id as string;
            const rowNumber = data.rowNumber;
            const colNumber = state.tableData[df_id].column_names.indexOf(data.col_name);
            state.tableData[df_id].rows[rowNumber][colNumber] = data.value;
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    setTableData,
    setMetadata,
    setDFUpdates,
    setReview,
    setActiveDF,
    setDFFilter,
    setDataViewMode,
    setDFStatusShowed,
    setDataPanelFocusSignal,
    setRegisteredUDFs,
    setUDFsSelection,
    setColumnSelection,
    setComputeUDFData,
    setTableDataCellValue,
} = dataFrameSlice.actions;

export default dataFrameSlice.reducer;
