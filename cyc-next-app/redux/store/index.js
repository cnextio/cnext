import { configureStore } from '@reduxjs/toolkit'
import dataFrameReducer from '../reducers/DataFramesRedux'
import codeEditorReducer from '../reducers/CodeEditorRedux'
import ProjectManagerRedux from '../reducers/ProjectManagerRedux'
import ExperimentManagerRedux from '../reducers/ExperimentManagerRedux'
// import dfUpdatesReducer from '../reducers/dfUpdates'

export default configureStore({
  reducer: {
    dataFrames: dataFrameReducer,
    codeEditor: codeEditorReducer,
    projectManager: ProjectManagerRedux,
    experimentManager: ExperimentManagerRedux,
  },
})
