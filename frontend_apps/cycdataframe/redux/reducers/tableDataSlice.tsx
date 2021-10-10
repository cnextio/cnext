import { createSlice } from '@reduxjs/toolkit'
import { DataTableContent } from '../../lib/components/Interfaces';

// for testing
import {tableData as testTableData} from "../../lib/components/tests/TestTableData"  

// let emptytableData: DataTableContent = {
//     header: [],
//     rows: []
// };

export const tableDataSlice = createSlice({
    name: 'tableData',
    initialState: {
        // for testing
        // data: testTableData,
        data: null
    },
    reducers: {
        update: (state, action) => {  
            // for testing          
            // state.data = testTableData
            state.data = action.payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const { update } = tableDataSlice.actions

export default tableDataSlice.reducer