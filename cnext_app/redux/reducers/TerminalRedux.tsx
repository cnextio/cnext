import { createSlice } from "@reduxjs/toolkit";

type TerminalState = {
    config: {
        port: number | undefined;
        token: string;
    };
};

const initialState: TerminalState = {
    config: {
        port: undefined,
        token: "",
    },
};

export const TerminalRedux = createSlice({
    name: "terminal",
    initialState: initialState,

    reducers: {
        setConfigTerminal: (state, action) => {
            state.config = action.payload;
        },
    },
});

export const { setConfigTerminal } = TerminalRedux.actions;

export default TerminalRedux.reducer;
