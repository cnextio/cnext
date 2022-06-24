import { createSlice } from "@reduxjs/toolkit";
import { IModelInfo, IModelViewerInfo, NetronStatus } from "../../lib/interfaces/IModelManager";

export type ModelManagerState = {
    modelInfo: { [id: string]: IModelInfo };
    activeModel: string | null;
    modelViewerInfo: IModelViewerInfo|null; 
    /** this is used to request ModelViewer to display the model */
    modelViewerCounter: number;
    /** this is used to trigger a reload of model information */
    modelInfoReloadCounter: number;
    /** this is used to request new model display from the server */
    modelInfoUpdatedCounter: number;
};

const initialState: ModelManagerState = {
    modelInfo: {},
    activeModel: null,
    modelViewerInfo: null,
    modelViewerCounter: 0,
    modelInfoReloadCounter: 0,
    modelInfoUpdatedCounter: 0
};

export const modelManagerSlice = createSlice({
    name: "modelManager",
    initialState: initialState,
    reducers: {
        // this function will add the initial data of the dataframe including: df name, column names, row data
        setModelInfo: (state, action) => {
            state.modelInfo = action.payload;
            if (state.modelInfo!=null && Object.keys(state.modelInfo).length > 0) {
                const modelNameList = Object.keys(state.modelInfo);
                if (state.activeModel == null || !modelNameList.includes(state.activeModel)) {
                    state.activeModel = modelNameList[0];
                }
                state.modelInfoUpdatedCounter++;
            } else {
                state.activeModel = null;
            }
        },

        setActiveModel: (state, action) => {
            let activeModel = action.payload;
            if (Object.keys(state.modelInfo).length > 0) {
                const modelNameList = Object.keys(state.modelInfo);
                if (activeModel != null && modelNameList.includes(activeModel)) {
                    state.activeModel = activeModel;
                }
            }
        },

        setModelViewerInfo: (state, action) => {
            state.modelViewerInfo = action.payload
            state.modelViewerCounter += 1;
        },

        setReload: (state, action) => {
            state.modelInfoReloadCounter += 1;
        }
    },
});

// Action creators are generated for each case reducer function
export const { setModelInfo, setActiveModel, setModelViewerInfo, setReload } = modelManagerSlice.actions;

export default modelManagerSlice.reducer;
