import { configureStore } from '@reduxjs/toolkit'
import vizDataReducer from '../reducers/vizDataSlice'
import dataFrameReducer from '../reducers/dataFrame'
import scrollLockReducer from '../reducers/scrollLockSlice'
import codeDocReducer from '../reducers/codeDocSlice'
// import dfUpdatesReducer from '../reducers/dfUpdates'

export default configureStore({
  reducer: {
    dataFrames: dataFrameReducer,
    vizData: vizDataReducer,
    scrollLock: scrollLockReducer,
    codeDoc: codeDocReducer,
  },
})
