import React, { useContext, useEffect, useState } from "react";
import {
    FooterNavigation,
    LeftFooterItem,
    FooterItemText,
    RightFooterItem,
} from "./StyledComponents";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { setProjectConfig } from "../../redux/reducers/ProjectManagerRedux";
// import socket from "./Socket";
import { CommandName, WebAppEndpoint } from "../interfaces/IApp";
import { LogsCommand } from "../interfaces/ILogsManager";
import { CircularProgress, Menu, MenuItem } from "@mui/material";
import { SocketContext } from "./Socket";

const enum FootbarItemName {
    AUTOCOMPLETION = "Autocompletion",
    CODEANALYSIS = "Code Analysis",
    MARKDOWN = "Show Markdown",
}

interface IFootbarItem {
    name: FootbarItemName;
    setting: {};
}

export const WhiteCircleProgress = () => {
    return (
        <div style={{ paddingLeft: 5, marginTop: 2 }}>
            <CircularProgress size={12} thickness={6} style={{ color: "white" }} />
        </div>
    );
};

const FooterBarComponent = () => {
    const socket = useContext(SocketContext);
    // const [codeEditorConfig, setCodeEditorConfig] = useState({ lint: false, hover: false, autocompletion: false });
    const [sending, setSending] = useState(false);
    const [listEnvironment, setlistEnvironment] = useState<any>([]);

    const [environmentActive, setEnvironmentActive] = useState<any>({ name: "Python default" });
    const codeEditorSettings = useSelector(
        (rootState: RootState) => rootState.projectManager.settings.code_editor
    );
    const richOutputSettings = useSelector(
        (rootState: RootState) => rootState.projectManager.settings.rich_output
    );
    const rootState = useSelector((rootState: RootState) => rootState);

    const dispatch = useDispatch();

    const leftFootbarItems: IFootbarItem[] = [
        { name: FootbarItemName.AUTOCOMPLETION, setting: codeEditorSettings.autocompletion },
        { name: FootbarItemName.CODEANALYSIS, setting: codeEditorSettings.lint },
        { name: FootbarItemName.MARKDOWN, setting: richOutputSettings.show_markdown },
    ];
    const changeHandler = (type: string) => {
        let updatedSettings = {}; //{ ...codeEditorConfig };
        switch (type) {
            case FootbarItemName.CODEANALYSIS:
                updatedSettings = {
                    ...codeEditorSettings,
                    lint: codeEditorSettings.lint ? false : true,
                };
                dispatch(
                    setProjectConfig({
                        code_editor: {
                            ...updatedSettings,
                        },
                    })
                );
                break;
            case FootbarItemName.AUTOCOMPLETION:
                updatedSettings = {
                    ...codeEditorSettings,
                    autocompletion: codeEditorSettings.autocompletion ? false : true,
                    hover: codeEditorSettings.hover ? false : true,
                };
                dispatch(
                    setProjectConfig({
                        code_editor: {
                            ...updatedSettings,
                        },
                    })
                );
                break;
            case FootbarItemName.MARKDOWN:
                updatedSettings = {
                    ...richOutputSettings,
                    show_markdown: richOutputSettings.show_markdown ? false : true,
                };
                dispatch(
                    setProjectConfig({
                        rich_output: {
                            ...updatedSettings,
                        },
                    })
                );
                break;
            default:
        }
    };

    const sendLogs = () => {
        setSending(true);
        return new Promise((resolve, reject) => {
            let message = {
                content: {
                    clientLogs: window.logs,
                    rootState,
                },
                webapp_endpoint: WebAppEndpoint.LogsManager,
                command_name: LogsCommand.send_logs,
            };

            let channel = WebAppEndpoint.LogsManager;
            socket?.emit(channel, JSON.stringify(message));
            if (channel) {
                socket?.once(channel, (result) => {
                    const response = JSON.parse(result.toString());
                    setSending(false);
                    resolve(response);
                });
            }
        });
    };

    useEffect(() => {
        setupSocket();
        return () => {
            socket?.off(WebAppEndpoint.EnvironmentManager);
        };
    }, [socket]);

    const setupSocket = () => {
        socket?.emit("ping", WebAppEndpoint.EnvironmentManager);
        socket?.emit(
            WebAppEndpoint.EnvironmentManager,
            JSON.stringify({
                webapp_endpoint: WebAppEndpoint.EnvironmentManager,
                content: "",
                command_name: CommandName.get_environment,
            })
        );
        socket?.on(WebAppEndpoint.EnvironmentManager, (result: string, ack) => {
            console.log("EnvironmentManager content", JSON.parse(result));
            try {
                if (JSON.parse(result).command_name === CommandName.get_environment) {
                    const content = JSON.parse(result).content;
                    console.log("content", content);

                    let envs = [];
                    for (const property in content) {
                        if (Array.isArray(content[property])) {
                            for (const env of content[property]) {
                                envs.push({
                                    name: env,
                                    type: property,
                                    note: "",
                                });
                            }
                        }
                        if (
                            !Array.isArray(content[property]) &&
                            typeof content[property] === "object"
                        ) {
                            for (const env in content[property]) {
                                envs.push({
                                    name: content[property][env],
                                    type: property,
                                    note: env,
                                });
                            }
                        }
                    }
                    console.log("EnvironmentManager envs", envs);
                    setlistEnvironment(envs);
                }
            } catch (error) {
                console.error("error=>>>>", error);
                // throw error;
            }
            if (ack) ack();
        });
    };
    const startEnvironment = (nameEnv: string) => {
        socket?.emit(
            WebAppEndpoint.EnvironmentManager,
            JSON.stringify({
                webapp_endpoint: WebAppEndpoint.EnvironmentManager,
                content: {
                    conda_environment: nameEnv,
                },
                command_name: CommandName.start_environment,
            })
        );
    };
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    
    //Menu Env
    const openMenuSelectEnv = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuItemClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
        setEnvironmentActive(listEnvironment[index]);
        startEnvironment(listEnvironment[index].name);
        setAnchorEl(null);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <FooterNavigation>
            {leftFootbarItems.map((item, index) => {
                return (
                    <LeftFooterItem key={index}>
                        <FooterItemText
                            onClick={() => {
                                changeHandler(item.name);
                            }}
                        >
                            {item.name}: {item.setting ? "ON" : "OFF"}
                        </FooterItemText>
                    </LeftFooterItem>
                );
            })}

            <RightFooterItem>
                <FooterItemText onClick={openMenuSelectEnv}>{environmentActive.name}</FooterItemText>
                <Menu id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
                    {listEnvironment.map((item: any, index) => (
                        <MenuItem
                            selected={item.name === environmentActive.name}
                            onClick={(event) => handleMenuItemClick(event, index)}
                        >
                            {item.name}
                        </MenuItem>
                    ))}
                </Menu>
                <FooterItemText
                    onClick={() => {
                        sendLogs();
                    }}
                >
                    Send Logs
                    {sending && <WhiteCircleProgress />}
                </FooterItemText>
            </RightFooterItem>
        </FooterNavigation>
    );
};

export default FooterBarComponent;
