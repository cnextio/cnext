import { configureStore } from '@reduxjs/toolkit'
import dataFrameReducer from '../reducers/DataFramesRedux'
import codeEditorReducer from '../reducers/CodeEditorRedux'
import ProjectManagerRedux from '../reducers/ProjectManagerRedux'
import ExperimentManagerRedux from '../reducers/ExperimentManagerRedux'
// import dfUpdatesReducer from '../reducers/dfUpdates'

const store = configureStore({
  reducer: {
    dataFrames: dataFrameReducer,
    codeEditor: codeEditorReducer,
    projectManager: ProjectManagerRedux,
    experimentManager: ExperimentManagerRedux,
  },
})

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;