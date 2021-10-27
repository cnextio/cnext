import { createSlice } from '@reduxjs/toolkit'
import { DataTableContent } from '../../lib/components/interfaces';

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
        columnDataSummary: {}        
    },
    reducers: {
        // this function will add the initial data of the dataframe including: df name, column names, row data
        updateTableData: (state, action) => {  
            // for testing          
            // state.data = testTableData
            const df_id = action.payload['df_id'];
            state.tableData[df_id] = action.payload;
            state.activeDataFrame = df_id;
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
            state.columnHistogram[df_id][col_name] = action.payload['plot'];
        },
        updateCountNA: (state, action) => {  
            // for testing          
            // state.data = testTableData
            const df_id = action.payload['df_id'];
            if (!(df_id in state.columnDataSummary)){
                state.columnDataSummary[df_id] = {};
            }
            state.columnDataSummary[df_id]['countna'] = action.payload['countna']
        }
    },
})

// Action creators are generated for each case reducer function
export const { updateTableData, updateColumnMetaData, updateColumnHistogramPlot, updateCountNA } = dataFrameSlice.actions

export default dataFrameSlice.reducer