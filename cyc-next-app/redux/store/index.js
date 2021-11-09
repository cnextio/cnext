import { configureStore } from '@reduxjs/toolkit'
import vizDataReducer from '../reducers/vizDataSlice'
import dataFrameReducer from '../reducers/dataFrameSlice'
import scrollLockReducer from '../reducers/scrollLockSlice'
// import dfUpdatesReducer from '../reducers/dfUpdates'

export default configureStore({
  reducer: {
    dataFrames: dataFrameReducer,
    vizData: vizDataReducer,
    scrollLock: scrollLockReducer,
    // dfUpdates: dfUpdatesReducer,
  },
})
