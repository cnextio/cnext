import { createSlice } from '@reduxjs/toolkit'
import { DataTableContent } from '../../lib/components/interfaces';
import { ifElseDict } from '../../lib/components/libs';

// for testing
import {tableData as testTableData} from "../../lib/components/tests/TestTableData"  

export const dataFrameSlice = createSlice({
    name: 'dataFrames',
    initialState: {
        // for testing
        // data: testTableData,
        activeDataFrame: null,
        tableData: {},
        columnMetaData: {},
        columnHistogram: {},
        columnDataSummary: {},
        dataFrameUpdates: {},
        tableDataReady: false,  // this variable is used to indicate whether the tableData is being loaded.
                                // this is used mainly for TableComponent to know when to show the table updates       
    },
    reducers: {
        // this function will add the initial data of the dataframe including: df name, column names, row data
        updateTableData: (state, action) => {  
            // for testing          
            // state.data = testTableData
            const df_id = action.payload['df_id'];
            state.tableData[df_id] = action.payload;
            
            state.activeDataFrame = df_id;
            
            // if (!(df_id in state.dataFrameUpdates)){
            //     state.dataFrameUpdates[df_id] = {};
            // }  
            // state.dataFrameUpdates[df_id] = ifElseDict(action.payload, 'updates');
            // action.payload['updates']?action.payload['updates']:{}
            
            //for now let refresh columnHistogram and columnDataSummary whenever there is new data. 
            //TODO: fix me because this is not efficient
            state.columnHistogram = {};
            state.columnDataSummary[df_id] = {};
        },
        updateColumnMetaData: (state, action) => {  
            // for testing          
            // state.data = testTableData
            const df_id = action.payload['df_id'];
            state.columnMetaData[df_id] = action.payload;
        },
        updateColumnHistogramPlot: (state, action) => {  
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
        updateCountNA: (state, action) => {  
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
        updateDataFrameUpdates: (state, action) => {  
            // for testing          
            // state.data = testTableData
            const df_id = action.payload['df_id'];
            if (!(df_id in state.dataFrameUpdates)){
                state.dataFrameUpdates[df_id] = {};
            }                        
            state.dataFrameUpdates[df_id] = ifElseDict(action.payload, 'updates');
        },
        setTableDataReady: (state, action) => {
            state.tableDataReady = action.payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const { updateTableData, updateColumnMetaData, updateColumnHistogramPlot, 
                updateDataFrameUpdates, updateCountNA, setTableDataReady } = dataFrameSlice.actions

export default dataFrameSlice.reducer