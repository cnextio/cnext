import { createSlice } from "@reduxjs/toolkit";
import { ICodeResultContent, ICodeResultMessage } from "../../lib/interfaces/ICodeEditor";

type RichOutputState = {
    /** This count is used to trigger the update of CodeOutput view.
     * It will increase whenever there is an update to text output results*/
    textOutputUpdateCount: number;
    textOutput: ICodeResultContent | null;
};

const initialState: RichOutputState = {
    textOutputUpdateCount: 0,
    textOutput: null,
};

export const RichOutputRedux = createSlice({
    name: "richOutput",
    initialState: initialState,

    reducers: {        
        setTextOutput: (state, action) => {
            let resultMessage: ICodeResultMessage = action.payload;
            state.textOutput = resultMessage.content;
            state.textOutputUpdateCount++;
        },
    }
});

// Action creators are generated for each case reducer function
export const { setTextOutput } = RichOutputRedux.actions;

export default RichOutputRedux.reducer;
