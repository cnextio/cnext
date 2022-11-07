import React, { useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setTextOpenai } from "../../../redux/reducers/CodeEditorRedux";
import { setConfigTerminal } from "../../../redux/reducers/TerminalRedux";

import { CommandName, WebAppEndpoint } from "../../interfaces/IApp";
import { SocketContext } from "../Socket";

const OpenAiManager = () => {
    const socket = useContext(SocketContext);
    const dispatch = useDispatch();

    useEffect(() => {
        setupSocket();
        return () => {
            socket?.off(WebAppEndpoint.OpenAiManager);
        };
    }, [socket]);

    const setupSocket = () => {
        socket?.on(WebAppEndpoint.OpenAiManager, (result: string, ack) => {
            console.log("OpenAiManager : result", JSON.parse(result));
            try {
                if (JSON.parse(result).command_name === CommandName.exc_text) {
                    const content = JSON.parse(result).content;
                    dispatch(
                        setTextOpenai({
                            content: JSON.parse(result).content,
                            metadata: JSON.parse(result).metadata,
                        })
                    );
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
