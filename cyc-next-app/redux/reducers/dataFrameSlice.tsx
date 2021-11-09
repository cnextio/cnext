import { createSlice } from '@reduxjs/toolkit'
import { DataTableContent, 
        DFUpdates, 
        DFUpdatesReview, 
        ReduxDFUpdates, 
        ReviewType, 
        UpdateType,
        IReduxDF, 
        IReviewRequest,
        ReviewRequestType,
        IDFUpdatesReview,
        IDFUpdates} from '../../lib/components/AppInterfaces';
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
        activeDataFrame: '',
        tableData: {},
        columnMetaData: {},
        columnHistogram: {},
        columnDataSummary: {},
        dfUpdates: {},
        dfUpdatesReview: {},
        tableDataReady: false,  // this variable is used to indicate whether the tableData is being loaded.
                                // this is used mainly for TableComponent to know when to show the table updates       
    },
    reducers: {
        // this function will add the initial data of the dataframe including: df name, column names, row data
        setTableData: (state, action) => {  
            // for testing          
            // state.data = testTableData
            const df_id = action.payload['df_id'];
            state.tableData[df_id] = action.payload;
            
            state.activeDataFrame = df_id;
            
            //TODO do the same for columnHistogram
            if (!(df_id in state.columnDataSummary)){
                state.columnDataSummary[df_id] = {};
            }  
            // state.dataFrameUpdates[df_id] = ifElseDict(action.payload, 'updates');
            // action.payload['updates']?action.payload['updates']:{}                        
        },
        
        setColumnMetaData: (state, action) => {  
            // for testing          
            // state.data = testTableData
            const df_id = action.payload['df_id'];
            state.columnMetaData[df_id] = action.payload;
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
        },
        
        /* Update and reviews */
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
                console.log("Update type: ", updates);
                
                // reset this everytime there is an update
                state.dfUpdatesReview[df_id] = null

                if (updates.update_type==UpdateType.add_cols){
                    state.dfUpdatesReview[df_id] = {enable: false, index: 0, name: updates.update_content[0], 
                                                    count: 0, type: ReviewType.col, length: updates.update_content.length};
                } else if (updates.update_type==UpdateType.add_rows){
                    state.dfUpdatesReview[df_id] = {enable: false, index: 0, name: updates.update_content[0],
                                                    count: 0, type: ReviewType.row, length: updates.update_content.length};
                } else if (updates.update_type==UpdateType.update_cells){
                    state.dfUpdatesReview[df_id] = {enable: false, index: -1, count: -1, type: ReviewType.cell,
                                                    length: updates.update_content.length};
                } else if (updates.update_type == UpdateType.new_df){
                    state.columnHistogram = {};
                    state.columnDataSummary[df_id] = {};
                }
                state.dfUpdates[df_id] = updates; //ifElseDict(action.payload, 'updates');          
            }
        },

        setReview: (state, action) => {
            // let df_id = ifElse(action, 'df_id', null);
            let reviewRequest: IReviewRequest = action.payload;
            // if (df_id){
            let dfUpdatesReview: IDFUpdatesReview = ifElse(state.dfUpdatesReview, state.activeDataFrame, null);
            if (dfUpdatesReview) {
                if (reviewRequest.type == ReviewRequestType.repeat){
                    dfUpdatesReview.count +=1;
                } else if (reviewRequest.type == ReviewRequestType.next){
                    dfUpdatesReview.count += 1;
                    dfUpdatesReview.index += 1; //TODO check index overflow                       
                } else if (reviewRequest.type == ReviewRequestType.prev){
                    dfUpdatesReview.count += 1;
                    dfUpdatesReview.index -= 1; //TODO check index overflow                      
                }
                let updates: IDFUpdates = state.dfUpdates[df_id];
                if (updates.update_type==UpdateType.add_rows || updates.update_type==UpdateType.add_cols){
                    dfUpdatesReview.name = updates.update_content[dfUpdatesReview.index]; //TODO check index overflow
                } 
                    
            }
            // }
        }
        
        // setDFUpdates: (state, action) => {  
        //     // for testing          
        //     // state.data = testTableData
        //     const df_id = ifElse(action.payload, 'df_id', null);
        //     if (df_id) {
        //         if(!(df_id in state.dfUpdates)){
        //             state.dfUpdates[df_id] = new ReduxDFUpdates();                    
        //         }                        
        //         let updates = ifElseDict(action.payload, 'updates');
        //         state.dfUpdates[df_id].update_type = ifElse(updates, 'update_type', UpdateType.no_update);
        //         state.dfUpdates[df_id].update_content = ifElse(updates, 'update_content', []);
        //         state.dfUpdates[df_id].review = new DFUpdatesReview();
        //         if (state.dfUpdates[df_id].update_type == UpdateType.new_df){
        //             state.columnHistogram = {};
        //             state.columnDataSummary[df_id] = {};
        //         }
        //     }
        // },
                
        // setTableDataReady: (state, action) => {
        //     state.tableDataReady = action.payload;
        // }
    },
})

// Action creators are generated for each case reducer function
export const { setTableData, 
                setColumnMetaData, 
                setColumnHistogramPlot, 
                setDFUpdates, 
                setCountNA, 
                // setTableDataReady 
                setReview,
            } = dataFrameSlice.actions

export default dataFrameSlice.reducer