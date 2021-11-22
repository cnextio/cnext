import { createSlice } from '@reduxjs/toolkit'
import { DataTableContent, 
        DFUpdates, 
        DFUpdatesReview, 
        ReduxDFUpdates, 
        ReviewType, 
        UpdateType,
        ITableData, 
        IReviewRequest,
        ReviewRequestType,
        IDFUpdatesReview,
        IDFUpdates,
        LoadDataRequest} from '../../lib/components/AppInterfaces';
import { ifElse, ifElseDict } from '../../lib/components/libs';

// for testing
import {tableData as testTableData} from "../../lib/components/tests/TestTableData"  

// const initialState: IReduxDF = {
//     // for testing
//     // data: testTableData,
//     activeDataFrame: null,
//     tableData: {},
//     columnMetaData: {},
//     columnHistogram: {},
//     columnDataSummary: {},
//     dfUpdates: {},
//     dfUpdatesReview: {},
//     tableDataReady: false,  // this variable is used to indicate whether the tableData is being loaded.
//                             // this is used mainly for TableComponent to know when to show the table updates       
// };
export const dataFrameSlice = createSlice({
    name: 'dataFrames',
    initialState: {
        // for testing
        // data: testTableData,
        metadata: {},
        activeDataFrame: '',
        tableData: {},
        columnMetaData: {},
        columnHistogram: {},
        columnDataSummary: {},
        dfUpdates: {},
        dfUpdatesReview: {},
        // this variable is used to indicate whether the tableData is being loaded.
        // this is used mainly for TableComponent to know when to show the table updates       
        tableDataReady: false,  
        // this is used to ask DFManager to load new data
        // currently only support loading by row index. 'count' is used to indicate new request
        loadDataRequest: {df_id: null, count: 0, row_index: 0},
        loadColumnHistogram: false,
        dfFilter: null,
    },
    reducers: {
        // this function will add the initial data of the dataframe including: df name, column names, row data
        setTableData: (state, action) => {  
            // for testing          
            // state.data = testTableData
            const df_id = action.payload['df_id'];
            state.tableData[df_id] = action.payload;
            
            // comment out because this create side effect. explicitly set this outside when table is set.
            // state.activeDataFrame = df_id; 
            
            //TODO do the same for columnHistogram
            if (!(df_id in state.columnDataSummary)){
                state.columnDataSummary[df_id] = {};
            }  
            // state.dataFrameUpdates[df_id] = ifElseDict(action.payload, 'updates');
            // action.payload['updates']?action.payload['updates']:{}                        
        },
        
        setMetaData: (state, action) => {  
            // for testing          
            // state.data = testTableData
            const df_id = action.payload['df_id'];
            state.metadata[df_id] = action.payload;
        },
        
        setColumnHistogramPlot: (state, action) => {  
            // for testing          
            // state.data = testTableData
            const df_id = action.payload['df_id'];
            const col_name = action.payload['col_name'];
            if (!(df_id in state.columnHistogram)){
                state.columnHistogram[df_id] = {};
            }
            // if ('plot' in action.payload){
                // state.columnHistogram[df_id][col_name] = action.payload['plot'];                
            // }
            state.columnHistogram[df_id][col_name] = ifElseDict(action.payload, 'plot');
            state.loadColumnHistogram = false;
        },
        
        setCountNA: (state, action) => {  
            // for testing          
            // state.data = testTableData
            const df_id = action.payload['df_id'];
            if (!(df_id in state.columnDataSummary)){
                state.columnDataSummary[df_id] = {};
            }
            // if ('countna' in action.payload){
            //     state.columnDataSummary[df_id]['countna'] = action.payload['countna'];                
            // }
            state.columnDataSummary[df_id]['countna'] = ifElseDict(action.payload, 'countna');
            //TODO: might need to set state.loadColumnHistogram = false here too
        },
        
        /** 
         * Process the df updage message. 
         * Setup the review context as needed.
        */
        setDFUpdates: (state, action) => {  
            // for testing          
            // state.data = testTableData
            const df_id = ifElse(action.payload, 'df_id', null);
            if (df_id) {
                if(!(df_id in state.dfUpdates)){
                    state.dfUpdates[df_id] = {};
                    state.dfUpdatesReview[df_id] = null;                                        
                }                        
                let updates: IDFUpdates = ifElseDict(action.payload, 'updates');                
                console.log("Update type: ", updates.update_type);
                
                // reset this everytime there is an update
                state.dfUpdatesReview[df_id] = null    
                if (updates.update_type==UpdateType.add_cols){
                    state.dfUpdatesReview[df_id] = {enable: false, index: 0, name: updates.update_content[0], count: 0, 
                                                    type: ReviewType.col, length: updates.update_content.length};
                    state.loadColumnHistogram = true;
                } else if (updates.update_type==UpdateType.add_rows){
                    state.dfUpdatesReview[df_id] = {enable: false, index: 0, name: updates.update_content[0], count: 0, 
                                                    type: ReviewType.row, length: updates.update_content.length};
                    state.loadColumnHistogram = true;                                
                } else if (updates.update_type==UpdateType.update_cells){
                    // console.log('Update content: ', Object.keys(updates.update_content));
                    let colNames = Object.keys(updates.update_content);
                    let colEndIndex = [];
                    let endIndex = 0;
                    for (let col of colNames){  
                        endIndex += updates.update_content[col].length;
                        colEndIndex.push(endIndex);
                    }
                    state.dfUpdatesReview[df_id] = {enable: false, index: 0, name: [colNames[0], updates.update_content[colNames[0]][0]],
                                                    count: 0, type: ReviewType.cell, length: endIndex,
                                                    updates_col_index: 0, updates_row_index: 0, col_names: colNames, col_end_index: colEndIndex};
                    state.loadColumnHistogram = true;
                } else if (updates.update_type == UpdateType.new_df){
                    state.columnHistogram = {};
                    state.columnDataSummary[df_id] = {};
                    state.loadColumnHistogram = true;
                }
                state.dfUpdates[df_id] = updates; //ifElseDict(action.payload, 'updates');          
            }
        },

        setReview: (state, action) => {
            // let df_id = ifElse(action, 'df_id', null);
            let reviewRequest: IReviewRequest = action.payload;
            // if (df_id){
            let dfUpdatesReview: IDFUpdatesReview = ifElse(state.dfUpdatesReview, state.activeDataFrame, null);
            // let updates = updates.update_content;
            if (dfUpdatesReview) {
                let updates: IDFUpdates = state.dfUpdates[state.activeDataFrame];                
                if (reviewRequest.type == ReviewRequestType.repeat){
                    dfUpdatesReview.count +=1;
                } else if (reviewRequest.type == ReviewRequestType.next && dfUpdatesReview.index < dfUpdatesReview.length-1){
                    dfUpdatesReview.count += 1;
                    dfUpdatesReview.index += 1;
                    if (updates.update_type==UpdateType.update_cells) {
                        if (dfUpdatesReview.index == dfUpdatesReview.col_end_index[dfUpdatesReview.updates_col_index]){
                            dfUpdatesReview.updates_col_index += 1;
                            dfUpdatesReview.updates_row_index = 0;
                        } else {
                            dfUpdatesReview.updates_row_index += 1;
                        }
                    }                       
                } else if (reviewRequest.type == ReviewRequestType.prev && dfUpdatesReview.index >= 0){
                    dfUpdatesReview.count += 1;
                    dfUpdatesReview.index -= 1; 
                    if (updates.update_type==UpdateType.update_cells) {
                        if (dfUpdatesReview.updates_col_index > 0 && dfUpdatesReview.index == dfUpdatesReview.col_end_index[dfUpdatesReview.updates_col_index-1]){
                            dfUpdatesReview.updates_col_index -= 1;
                            dfUpdatesReview.updates_row_index = dfUpdatesReview.col_end_index[dfUpdatesReview.updates_col_index]-1;
                        } else {
                            dfUpdatesReview.updates_row_index -= 1;
                        }
                    }
                }
                let tableData: ITableData = state.tableData[state.activeDataFrame];
                let update_content = updates.update_content;

                if (updates.update_type==UpdateType.add_cols){
                    dfUpdatesReview.name = update_content[dfUpdatesReview.index]; 
                } else {
                    // check if the row needs to be loaded, if so make the data loading request
                    let reviewingDFRowIndex;
                    let colName;
                    if (updates.update_type==UpdateType.add_rows){
                        reviewingDFRowIndex = update_content[dfUpdatesReview.index];
                        dfUpdatesReview.name = reviewingDFRowIndex; 
                    } else if (updates.update_type==UpdateType.update_cells) {
                        colName = dfUpdatesReview.col_names[dfUpdatesReview.updates_col_index];
                        reviewingDFRowIndex = update_content[colName][dfUpdatesReview.updates_row_index];
                        dfUpdatesReview.name = [colName, reviewingDFRowIndex]; 
                    }
                    // make data loading request if needed                    
                    if (!tableData.index.data.includes(reviewingDFRowIndex)){
                        state.loadDataRequest.df_id = state.activeDataFrame;
                        state.loadDataRequest.count += 1;
                        state.loadDataRequest.row_index = reviewingDFRowIndex;                    
                    }      
                }             
            }
            // }
        },

        setActiveDF: (state, action) => {
            state.activeDataFrame = action.payload;
        },
        
        setDFFilter: (state, action) => {
            state.dfFilter = action.payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const { setTableData, 
                setMetaData, 
                setColumnHistogramPlot, 
                setDFUpdates, 
                setCountNA, 
                setReview,
                setActiveDF,
                setDFFilter,
            } = dataFrameSlice.actions

export default dataFrameSlice.reducer