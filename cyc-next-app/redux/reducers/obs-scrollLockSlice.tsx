import { createSlice } from '@reduxjs/toolkit'

/* 
* We use this scrollLockd to make sure TableComponent and CodeOutputComponent can scroll to view
* at the same time. This is very ugly solution for this problem 
* https://stackoverflow.com/questions/49318497/google-chrome-simultaneously-smooth-scrollintoview-with-more-elements-doesn
*/

export const scrollLockSlice = createSlice({
    name: 'scrollLock',
    initialState: {
        locked: false
    },
    reducers: {
        scrollLock: (state) => {              
            state.locked = true;
        },
        scrollUnlock: (state) => {  
            state.locked = false;
        }
    },
})

// Action creators are generated for each case reducer function
export const { scrollLock, scrollUnlock } = scrollLockSlice.actions

export default scrollLockSlice.reducer