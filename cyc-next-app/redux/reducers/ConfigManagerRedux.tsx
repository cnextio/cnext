import { createSlice } from "@reduxjs/toolkit";
import { ViewModeOptions } from "../../lib/interfaces/IApp";

export type ConfigManagerState = {
    viewMode: string;
};

const initialState: ConfigManagerState = {
    viewMode: ViewModeOptions.VERTICAL, //initial as vertical view mode
};

export const configManagerSlice = createSlice({
    name: "configManager",
    initialState: initialState,
    reducers: {
        setViewMode: (state, action) => {
            state.viewMode = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setViewMode } = configManagerSlice.actions;

export default configManagerSlice.reducer;