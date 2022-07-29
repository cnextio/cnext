import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setConfigTerminal } from "../../../redux/reducers/TerminalRedux";
// import { getCookie } from "../../../utils";
import { CommandName, WebAppEndpoint } from "../../interfaces/IApp";
import socket from "../Socket";

// const jupyterServerCookie = `_xsrf`;

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
                    const config = JSON.parse(result).content;
                    dispatch(setConfigTerminal(config));
                    const BASEURL = `http://localhost:${config.port}?token=${config.token}`;
                    // console.log(`getCookie`, getCookie(`username-localhost-5009`));
                    const new_tab = window.open(`${BASEURL}`, "_blank");
                    setTimeout(() => {
                        new_tab?.close();
                    }, 0);
                }
            } catch (error) {
                console.log(`error`, error);

                throw error;
            }
        });
    };

    return null;
};

export default TerminalManager;
