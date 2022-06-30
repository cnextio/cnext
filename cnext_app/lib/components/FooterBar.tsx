import React, { useEffect, useState } from "react";
import { FooterNavigation, FooterItem, FotterItemText, FooterItemButton } from "./StyledComponents";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { setProjectSetting } from "../../redux/reducers/ProjectManagerRedux";
import socket from "./Socket";
import { WebAppEndpoint } from "../interfaces/IApp";
import store from "../../redux/store";
import { ProjectCommand } from "../interfaces/IFileManager";

const FooterBarComponent = () => {
    const [config, setConfig] = useState({ lint: false, hover: false, autocompletion: false });
    const [rootState, setRootState] = useState({});

    const rootStateStore = useSelector((rootState: RootState) => rootState);
    const rootConfig = useSelector(
        (rootState: RootState) => rootState.projectManager.settings.code_editor
    );

    console.log("rootConfig", rootConfig, rootStateStore);
    const dispatch = useDispatch();

    const procressChange = (type: string) => {
        let updateObj = { ...config };
        switch (type) {
            case "lint":
                updateObj = { ...config, lint: config.lint ? false : true };
                break;
            case "autocompletion":
                updateObj = {
                    ...config,
                    autocompletion: config.autocompletion ? false : true,
                    hover: config.hover ? false : true,
                };
                break;

            default:
        }

        dispatch(
            setProjectSetting({
                code_editor: {
                    ...updateObj,
                },
            })
        );
    };

    const sendLogs = () => {
        // send rquest to server
        return new Promise((resolve, reject) => {
            // console.log(
            //     `send LSP request on ${channel}  to Server at ${new Date().toLocaleString()} `,
            //     rpcMessage
            // );
            let message = {
                clientLogs: window.logs,
                rootState,
                command_name: ProjectCommand.send_logs_via_email,
            };
            let channel = WebAppEndpoint.FileManager;
            socket.emit(channel, JSON.stringify(message));

            if (channel) {
                socket.once(channel, (result) => {
                    const response = JSON.parse(result.toString());
                    console.log(
                        `received from LSP on ${channel} server at ${new Date().toLocaleString()} `,
                        response
                    );
                    resolve(response);
                });
            }
        });
    };

    useEffect(() => {
        setConfig({ ...rootConfig });
    }, [rootConfig]);

    useEffect(() => {
        setRootState({ ...rootStateStore });
    }, [rootStateStore]);

    return (
        <FooterNavigation>
            <FooterItem>
                <FotterItemText
                    onClick={() => {
                        procressChange("autocompletion");
                    }}
                >
                    Autocompletion: {config.autocompletion ? "ON" : "OFF"}
                </FotterItemText>
            </FooterItem>
            <FooterItem>
                <FotterItemText
                    onClick={() => {
                        procressChange("lint");
                    }}
                >
                    Code Analysis: {config.lint ? "ON" : "OFF"}
                </FotterItemText>
            </FooterItem>
            <FooterItemButton>
                <FotterItemText
                    onClick={() => {
                        sendLogs();
                    }}
                >
                    Send Logs
                </FotterItemText>
            </FooterItemButton>
        </FooterNavigation>
    );
};

export default FooterBarComponent;
