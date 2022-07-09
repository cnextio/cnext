import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setConfigTerminal } from "../../../redux/reducers/TerminalRedux";
import { WebAppEndpoint } from "../../interfaces/IApp";
import socket from "../Socket";

const ConfigTerminal = "ConfigTerminal";

const TerminalManager = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        setupSocket();
        return () => {
            socket.off(WebAppEndpoint.Terminal);
        };
    }, []);
    const setupSocket = () => {
        socket.emit("ping", WebAppEndpoint.Terminal);
        socket.emit(WebAppEndpoint.Terminal, {
            webapp_endpoint: WebAppEndpoint.Terminal,
            content: ConfigTerminal,
        });
        socket.on(WebAppEndpoint.Terminal, (result: string) => {
            try {
                dispatch(setConfigTerminal(JSON.parse(result).config));
            } catch (error) {
                throw error;
            }
        });
    };

    return null;
};

export default TerminalManager;
