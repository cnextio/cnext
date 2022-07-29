import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setConfigTerminal } from "../../../redux/reducers/TerminalRedux";
import { CommandName, WebAppEndpoint } from "../../interfaces/IApp";
import socket from "../Socket";

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
        socket.emit(
            WebAppEndpoint.Terminal,
            JSON.stringify({
                webapp_endpoint: WebAppEndpoint.Terminal,
                content: "",
                command_name: CommandName.get_jupyter_server_config,
            })
        );
        socket.on(WebAppEndpoint.Terminal, (result: string) => {
            try {
                if (JSON.parse(result).command_name === CommandName.get_jupyter_server_config) {
                    dispatch(setConfigTerminal(JSON.parse(result).content));
                }
            } catch (error) {
                throw error;
            }
        });
    };

    return null;
};

export default TerminalManager;
