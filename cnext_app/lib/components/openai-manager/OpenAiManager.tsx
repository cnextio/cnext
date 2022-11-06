import React, { useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setConfigTerminal } from "../../../redux/reducers/TerminalRedux";

import { CommandName, WebAppEndpoint } from "../../interfaces/IApp";
import { SocketContext } from "../Socket";

const OpenAiManager = () => {
    const socket = useContext(SocketContext);
    const dispatch = useDispatch();

    useEffect(() => {
        setupSocket();
        return () => {
            socket?.off(WebAppEndpoint.Terminal);
        };
    }, [socket]);

    const setupSocket = () => {
        socket?.on(WebAppEndpoint.OpenAiManager, (result: string, ack) => {
            console.log("WebAppEndpoint.OpenAiManager", JSON.parse(result));

            try {
                if (JSON.parse(result).command_name === CommandName.get_jupyter_server_config) {
                    const config = JSON.parse(result).content;
                    dispatch(setConfigTerminal(config));
                }
            } catch (error) {
                console.error(error);
                // throw error;
            }
            if (ack) ack();
        });
    };

    return null;
};

export default OpenAiManager;
