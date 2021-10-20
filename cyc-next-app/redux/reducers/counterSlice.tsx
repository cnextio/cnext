import { createSlice } from '@reduxjs/toolkit'

export const counterSlice = createSlice({
    name: 'counter',
    initialState: {
        data: 0
    },
    reducers: {
        inc: (state, action) => {  
            // for testing          
            // state.data = testTableData
            state.data = state.data+1;
        }
    },
})

// Action creators are generated for each case reducer function
export const { inc } = counterSlice.actions

export default counterSlice.reducer