import { configureStore } from '@reduxjs/toolkit'
import vizDataReducer from '../reducers/vizDataSlice'
import dataFrameReducer from '../reducers/DataFramesRedux'
import scrollLockReducer from '../reducers/obs-scrollLockSlice'
import codeDocReducer from '../reducers/CodeEditorRedux'
import FileManagerRedux from '../reducers/FileManagerRedux'
// import dfUpdatesReducer from '../reducers/dfUpdates'

export default configureStore({
  reducer: {
    dataFrames: dataFrameReducer,
    // vizData: vizDataReducer,
    // scrollLock: scrollLockReducer,
    codeDoc: codeDocReducer,
    fileManager: FileManagerRedux
  },
})
