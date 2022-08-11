import { createSlice } from "@reduxjs/toolkit";
import { IExecutorStatus } from "../../lib/interfaces/IExecutorManager";

type ExecutorManagerState = {
    executorStatus: IExecutorStatus;
    executorRestartCounter: number;
};

const initialState: ExecutorManagerState = {
    executorStatus: { alive_status: false, resource_usage: null },
    executorRestartCounter: 0
};

export const ExecutorManagerRedux = createSlice({
    name: "executorManager",
    initialState: initialState,

    reducers: {
        setExecutorStatus: (state, action) => {
            state.executorStatus = action.payload;
        },
        updateExecutorRestartCounter: (state) => {
            state.executorRestartCounter++;
        }
    },
});

// Action creators are generated for each case reducer function
export const { setExecutorStatus, updateExecutorRestartCounter } = ExecutorManagerRedux.actions;

export default ExecutorManagerRedux.reducer;
