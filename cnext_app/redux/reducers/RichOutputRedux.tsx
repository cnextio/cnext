import { createSlice } from "@reduxjs/toolkit";
import { ICodeResultContent, ICodeResultMessage } from "../../lib/interfaces/ICodeEditor";

type RichOutputState = {
    /** This count is used to trigger the update of CodeOutput view.
     * It will increase whenever there is an update to text output results */
    textOutputUpdateCount: number;
    textOutput: ICodeResultContent | null;
    /** this is used to indicate whether mouse is being clicked on rich output panel
     * one use case of this is to display the richout command execution exception in OUTPUT */
    richOutputFocused: boolean;
};

const initialState: RichOutputState = {
    textOutputUpdateCount: 0,
    textOutput: null,
    richOutputFocused: false,
};

export const RichOutputRedux = createSlice({
    name: "richOutput",
    initialState: initialState,

    reducers: {        
        setTextOutput: (state, action) => {
            let resultMessage: ICodeResultMessage = action.payload;
            // console.log("RichOutputRedux setTextOutput: ", action.payload, state.textOutputUpdateCount);
            state.textOutput = resultMessage.content;
            state.textOutputUpdateCount++;
        },

        setRichOutputFocused: (state, action) => {
            // console.log("RichOutputRedux setRichOutputFocused: ", action.payload);
            state.richOutputFocused = action.payload;
        }
    }
});

// Action creators are generated for each case reducer function
export const { setTextOutput, setRichOutputFocused } = RichOutputRedux.actions;

export default RichOutputRedux.reducer;
