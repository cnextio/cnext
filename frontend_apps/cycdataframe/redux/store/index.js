// import { createStore } from 'redux';
// import rootReducer from '../reducers';

// const store = createStore(rootReducer);

// export default store;

import { configureStore } from '@reduxjs/toolkit'
import tableDataReducer from '../reducers/tableDataSlice'

export default configureStore({
  reducer: {
    tableData: tableDataReducer,
  },
})