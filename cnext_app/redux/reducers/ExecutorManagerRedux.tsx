import { createSlice } from "@reduxjs/toolkit";
import { IExecutorStatus, KernelInfo } from "../../lib/interfaces/IExecutorManager";

type ExecutorManagerState = {
    executorStatus: IExecutorStatus;
    executorRestartSignal: number;
    executorInterruptSignal: number;
    kernelInfo: KernelInfo | null;
};

const initialState: ExecutorManagerState = {
    executorStatus: { alive_status: false, resource_usage: null },
    executorRestartSignal: 0,
    executorInterruptSignal: 0,
    kernelInfo: null,
};

export const ExecutorManagerRedux = createSlice({
    name: "executorManager",
    initialState: initialState,

    reducers: {
        setExecutorStatus: (state, action) => {
            state.executorStatus = action.payload;
        },

        updateExecutorRestartSignal: (state) => {
            state.executorRestartSignal++;
        },

        updateExecutorInterruptSignal: (state) => {
            state.executorInterruptSignal++;
        },

        setKernelInfo: (state, action) => {
            state.kernelInfo = action.payload as KernelInfo;
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    setExecutorStatus,
    updateExecutorRestartSignal,
    updateExecutorInterruptSignal,
    setKernelInfo,
} = ExecutorManagerRedux.actions;

export default ExecutorManagerRedux.reducer;
