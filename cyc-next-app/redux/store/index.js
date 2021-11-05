import { configureStore } from '@reduxjs/toolkit'
import vizDataReducer from '../reducers/vizDataSlice'
import dataFrameReducer from '../reducers/dataFrameSlice'
import scrollLockReducer from '../reducers/scrollLockSlice'

export default configureStore({
  reducer: {
    dataFrames: dataFrameReducer,
    vizData: vizDataReducer,
    scrollLock: scrollLockReducer,
  },
})