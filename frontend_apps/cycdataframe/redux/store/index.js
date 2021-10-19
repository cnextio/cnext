// import { createStore } from 'redux';
// import rootReducer from '../reducers';

// const store = createStore(rootReducer);

// export default store;

import { configureStore } from '@reduxjs/toolkit'
import vizDataReducer from '../reducers/vizDataSlice'
import dataFrameReducer from '../reducers/dataFrameSlice'

export default configureStore({
  reducer: {
    dataFrames: dataFrameReducer,
    vizData: vizDataReducer
  },
})