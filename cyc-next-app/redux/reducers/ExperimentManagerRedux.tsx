import { createSlice } from '@reduxjs/toolkit'
import { ReduxActionType } from "../../lib/interfaces/IExperimentManager";

type ExperimentManagerState = { 
    runDict: {[id: string]: {}}|undefined,
    expDict: {}|undefined,
    runningRunId: string|undefined,
    runningExpId: string|undefined,
    selectedExpId: string|undefined,
}

const initialState: ExperimentManagerState = {
    runDict: undefined,
    expDict: undefined,
    runningRunId: undefined,
    runningExpId: undefined,
    selectedExpId: undefined,
}

export const ExperimentManagerRedux = createSlice({
    name: 'experimentManager',
    initialState: initialState,

    reducers: {
        setRunDict: (state, action) => {
            let newRunDict = action.payload;
            for (let key of Object.keys(newRunDict)) {
                let run = newRunDict[key];
                if (state.runDict[run['_run_id']]) {
                    run['selected'] = state.runDict[run['_run_id']]['selected'];
                }
            } 
            state.runDict = newRunDict;
        },

        setExpDict: (state, action) => {
            state.expDict = action.payload;
        },

        setRunSelection: (state, action) => {
            let id = action.payload.id;
            let selected = action.payload.selected;
            state.runDict[id]['selected'] = selected;
        },

        setRunningRun: (state, action) => {
            let runId = action.payload;
            state.runningRunId = runId;
            state.runningExpId = (state.runDict && runId && state.runDict[runId]) ? state.runDict[runId]['_experiment_id'] : null;
        },

        // setRunningExp: (state, action) => {
        //     state.runningExpId = action.payload;
        // },

        setSelectedExp: (state, action) => {
            state.selectedExpId = action.payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const { 
    setRunDict,
    setExpDict,
    setRunSelection,
    setRunningRun,
    // setRunningExp,
    setSelectedExp,
} = ExperimentManagerRedux.actions

export default ExperimentManagerRedux.reducer