import { createSlice } from '@reduxjs/toolkit'

// for testing
import {vizData as testVizData} from "../../lib/components/tests/TestVizData"  

export const vizDataSlice = createSlice({
    name: 'vizData',
    initialState: {
        // for testing
        // data: testVizData,
        data: null        
    },
    reducers: {
        update: (state, action) => {  
            // for testing          
            // state.data = testVizData;
            state.data = action.payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const { update } = vizDataSlice.actions

export default vizDataSlice.reducer