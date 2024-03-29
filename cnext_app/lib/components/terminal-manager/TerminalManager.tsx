import React, { useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setConfigTerminal } from "../../../redux/reducers/TerminalRedux";
import { getCookie } from "../../../utils";
import { getDomain } from "../../../utils/domain";
import { CommandName, ContentType, WebAppEndpoint } from "../../interfaces/IApp";
import { sendMessage, SocketContext } from "../Socket";

const jupyterServerCookie = `_xsrf`;

const TerminalManager = () => {
    const socket = useContext(SocketContext);
    const dispatch = useDispatch();

    useEffect(() => {
        setupSocket();
        return () => {
            socket?.off(WebAppEndpoint.Terminal);
        };
    }, [socket]);

    const setupSocket = () => {
        socket?.emit("ping", WebAppEndpoint.Terminal);
        sendMessage(socket, WebAppEndpoint.Terminal, {
            webapp_endpoint: WebAppEndpoint.Terminal,
            content: "",
            command_name: CommandName.get_jupyter_server_config,
            type: ContentType.COMMAND
        });
        socket?.on(WebAppEndpoint.Terminal, (result: string, ack) => {
            try {
                if (JSON.parse(result).command_name === CommandName.get_jupyter_server_config) {
                    const config = JSON.parse(result).content;
                    dispatch(setConfigTerminal(config));
                    // const BASEURL = `${getDomain()}:${config.port}?token=${config.token}`;
                    // console.log('BASEURL', BASEURL);
                    // if (!getCookie(jupyterServerCookie)) {
                    //     const new_tab = window.open(`${BASEURL}`, "_blank");
                    //     setTimeout(() => {
                    //         new_tab?.close();
                    //     }, 500);
                    // }
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

export default TerminalManager;
