import React from "react";
import { FooterNavigation, FooterItem, FotterItemText, FooterItemButton } from "./StyledComponents";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { setProjectSetting } from "../../redux/reducers/ProjectManagerRedux";
import socket from "./Socket";
import { WebAppEndpoint } from "../interfaces/IApp";
import { LogsCommand } from "../interfaces/ILogsManager";

const enum FootbarItemName {
    AUTOCOMPLETION = "Autocompletion",
    CODEANALYSIS = "Code Analysis",
    MARKDOWN = "Show Markdown",
}

interface IFootbarItem {
    name: FootbarItemName;
    setting: {};
}

const FooterBarComponent = () => {
    // const [codeEditorConfig, setCodeEditorConfig] = useState({ lint: false, hover: false, autocompletion: false });

    const codeEditorSettings = useSelector(
        (rootState: RootState) => rootState.projectManager.settings.code_editor
    );
    const richOutputSettings = useSelector(
        (rootState: RootState) => rootState.projectManager.settings.rich_output
    );
    const rootState = useSelector((rootState: RootState) => rootState);

    const dispatch = useDispatch();

    const footbarItems: IFootbarItem[] = [
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
                    setProjectSetting({
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
                    setProjectSetting({
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
                    setProjectSetting({
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
        return new Promise((resolve, reject) => {
            // console.log(
            //     `send LSP request on ${channel}  to Server at ${new Date().toLocaleString()} `,
            //     rpcMessage
            // );
            let message = {
                content: {
                    clientLogs: window.logs,
                    rootState,
                },
                webapp_endpoint: WebAppEndpoint.LogsManager,
                command_name: LogsCommand.send_logs,
            };

            let channel = WebAppEndpoint.LogsManager;
            socket.emit(channel, JSON.stringify(message));
            if (channel) {
                socket.once(channel, (result) => {
                    const response = JSON.parse(result.toString());
                    // console.log(
                    //     `received from LSP on ${channel} server at ${new Date().toLocaleString()} `,
                    //     response
                    // );
                    resolve(response);
                });
            }
        });
    };

    return (
        <FooterNavigation>
            {footbarItems.map((item, index) => {
                return (
                    <FooterItem key={index}>
                        <FotterItemText
                            onClick={() => {
                                changeHandler(item.name);
                            }}
                        >
                            {item.name}: {item.setting ? "ON" : "OFF"}
                        </FotterItemText>
                    </FooterItem>
                );
            })}

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
