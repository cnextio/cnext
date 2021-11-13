import { createSlice } from '@reduxjs/toolkit'

export const codeDocSlice = createSlice({
    name: 'codeDoc',
    initialState: {
        doc: null
    },
    reducers: {
        setCodeDoc: (state, action) => {  
            // for testing          
            // state.data = testTableData
            state.doc = action.payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const { setCodeDoc } = codeDocSlice.actions

export default codeDocSlice.reducer