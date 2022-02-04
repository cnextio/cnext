import { createSlice } from "@reduxjs/toolkit";
import { ReduxActionType } from "../../lib/interfaces/IExperimentManager";

type ExperimentManagerState = {
  runDict: { [id: string]: {} } | null;
  expDict: {} | null;
  runningRunId: string | null;
  runningExpId: string | null;
  selectedExpId: string | null;
};

const initialState: ExperimentManagerState = {
  runDict: null,
  expDict: null,
  runningRunId: null,
  runningExpId: null,
  selectedExpId: null,
};

export const ExperimentManagerRedux = createSlice({
  name: "experimentManager",
  initialState: initialState,

  reducers: {
    setRunDict: (state, action) => {
      let newRunDict = action.payload;
      for (let key of Object.keys(newRunDict)) {
        let run = newRunDict[key];
        let id = run["_run_id"];
        if (state.runDict && state.runDict[id]) {
          run["selected"] = state.runDict[id].selected;
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
      if (state.runDict && state.runDict[id]){
        state.runDict[id].selected = selected;
      }        
    },

    setRunningRun: (state, action) => {
      let runId = action.payload;
      state.runningRunId = runId;
      state.runningExpId =
        state.runDict && runId && state.runDict[runId]
          ? state.runDict[runId]._experiment_id
          : null;
    },

    // setRunningExp: (state, action) => {
    //     state.runningExpId = action.payload;
    // },

    setSelectedExp: (state, action) => {
      if (state.selectedExpId === action.payload) {
        state.runDict = null;
      }
      state.selectedExpId = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setRunDict,
  setExpDict,
  setRunSelection,
  setRunningRun,
  // setRunningExp,
  setSelectedExp,
} = ExperimentManagerRedux.actions;

export default ExperimentManagerRedux.reducer;
