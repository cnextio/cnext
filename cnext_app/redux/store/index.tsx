import { configureStore } from "@reduxjs/toolkit";
import dataFrameReducer from "../reducers/DataFramesRedux";
import codeEditorReducer from "../reducers/CodeEditorRedux";
import ProjectManagerRedux from "../reducers/ProjectManagerRedux";
import ExperimentManagerRedux from "../reducers/ExperimentManagerRedux";
import ModelManagerRedux from "../reducers/ModelManagerRedux";
import RichOutputRedux from "../reducers/RichOutputRedux";
import NotificationRedux from "../reducers/NotificationRedux";
import TerminalRedux from "../reducers/TerminalRedux";
import ExecutorManagerRedux from "../reducers/ExecutorManagerRedux";

const store = configureStore({
    reducer: {
        dataFrames: dataFrameReducer,
        codeEditor: codeEditorReducer,
        projectManager: ProjectManagerRedux,
        experimentManager: ExperimentManagerRedux,
        modelManager: ModelManagerRedux,
        richOutput: RichOutputRedux,
        notification: NotificationRedux,
        terminal: TerminalRedux,
        executorManager: ExecutorManagerRedux,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

// expose store when run in Cypress
if (typeof window !== "undefined") {
    if (window.Cypress) {
        window.store = store;
        console.log("fire here");
    }
}

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
