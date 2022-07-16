import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setConfigTerminal } from "../../../redux/reducers/TerminalRedux";
import { CommandName, WebAppEndpoint } from "../../interfaces/IApp";
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
        socket.emit(
            WebAppEndpoint.Terminal,
            JSON.stringify({
                webapp_endpoint: WebAppEndpoint.Terminal,
                content: ConfigTerminal,
                command_name: CommandName.get_config_jupyter_server,
            })
        );
        socket.on(WebAppEndpoint.Terminal, (result: string) => {
            try {
                console.log(`setConfig 123`, JSON.parse(result).content);

                dispatch(setConfigTerminal(JSON.parse(result).content));
                console.log(JSON.parse(result).config);
            } catch (error) {
                throw error;
            }
        });
    };

    return null;
};

export default TerminalManager;
