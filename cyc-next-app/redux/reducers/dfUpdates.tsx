import { createSlice } from '@reduxjs/toolkit'

export const dfUpdatesSlice = createSlice({
    name: 'dfUpdates',
    initialState: {
        updates: {},
        reviewState: {}
    },
    reducers: {
        setUpdates: (state, action) => {
            updates = action.payload;  
            const df_id = ifElse(action.payload, 'df_id', null);
            if (df_id) {
                if(!(df_id in state.updates)){
                    state.updates[df_id] = {};
                    state.reviewState[df_id] = -1; //-1 mean no review showed
                }                        
                state.updates[df_id] = ifElseDict(action.payload, 'updates');
            }
        }
    },
})

// Action creators are generated for each case reducer function
export const { dfUpdates } = dfUpdatesSlice.actions

export default dfUpdatesSlice.reducer