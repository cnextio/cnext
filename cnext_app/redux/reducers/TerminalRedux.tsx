import { createSlice } from "@reduxjs/toolkit";

type TerminalState = {
    config: {
        port: number | undefined;
        token: string;
    };
    session: any;
};

const initialState: TerminalState = {
    config: {
        port: undefined,
        token: "",
    },
    session: null,
};

export const TerminalRedux = createSlice({
    name: "terminal",
    initialState: initialState,

    reducers: {
        setConfigTerminal: (state, action) => {
            state.config = action.payload;
        },
        setSessionTerminal: (state, action) => {
            state.session = action.payload;
        },
    },
});

export const { setConfigTerminal, setSessionTerminal } = TerminalRedux.actions;

export default TerminalRedux.reducer;
