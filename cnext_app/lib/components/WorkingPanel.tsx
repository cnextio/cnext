import React, { useEffect, useState } from "react";
import { WorkingPanel as StyledWorkingPanel } from "./StyledComponents";
import CodePanel from "./code-panel/CodePanel";
import RichOutputPanel from "./richoutput-panel/RichOutputPanel";
import DFManager from "./dataframe-manager/DataFrameManager";
import FileManager from "./file-manager/FileManager";
import FileExplorer from "./file-manager/FileExplorer";
import { useSelector } from "react-redux";
import Pane from "react-split-pane-v2";
import { RootState } from "../../redux/store";
import SplitPane from "react-split-pane-v2";
import { CommandName, ContentType, IMessage, WebAppEndpoint } from "../interfaces/IApp";
import socket from "./Socket";
import HotkeyComponent from "./hotkeys/HotKeys";
import TerminalManager from "./terminal-manager/TerminalManager";
import GitManager from "./git-manager/GitManager";

const WorkingPanel = () => {
    const showProjectExplore = useSelector(
        (state: RootState) => state.projectManager.showProjectExplore
    );
    const showGitManager = useSelector((state: RootState) => state.projectManager.showGitManager);
    const projectConfig = useSelector((state: RootState) => state.projectManager.settings);
    let experiment_tracking_uri = useSelector(
        (state: RootState) =>
            state.projectManager?.settings?.experiment_manager?.mlflow_tracking_uri
    );
    /** TODO: move this to a separate component for config */
    const set_tracking_uri = (tracking_uri: string | undefined) => {
        if (tracking_uri != null) {
            console.log("WorkingPanel set tracking uri: ", tracking_uri);
            let message: IMessage = {
                webapp_endpoint: WebAppEndpoint.CodeEditor,
                command_name: CommandName.exec_line,
                type: ContentType.STRING,
                content: `import mlflow; mlflow.set_tracking_uri("${tracking_uri}")`,
            };
            socket.emit(WebAppEndpoint.CodeEditor, JSON.stringify(message));
        }
    };

    useEffect(() => {
        set_tracking_uri(experiment_tracking_uri);
    }, [experiment_tracking_uri]);

    const [resizing, setResizing] = useState(false);
    const [codePanelSize, setCodePanelSize] = useState<string>("700px");
    return (
        <StyledWorkingPanel>
            {/* have to do complicated inline style because of this 
			https://newbedev.com/absolute-positioning-ignoring-padding-of-parent */}
            <SplitPane split="vertical">
                {console.log("WorkingPanel render")}
                <Pane
                    size={
                        showProjectExplore || showGitManager
                            ? projectConfig.layout?.project_explorer_size + "px"
                            : "0px"
                    }
                >
                    {showProjectExplore ? <FileExplorer /> : null}
                    {showGitManager ? <GitManager /> : null}
                </Pane>

                <Pane>
                    <SplitPane
                        split={projectConfig.view_mode}
                        onResizeStart={() => {
                            setResizing(true);
                        }}
                        onResizeEnd={(config) => {
                            setCodePanelSize(config[0]);
                            setResizing(false);
                        }}
                    >
                        <Pane size={codePanelSize}>
                            <CodePanel
                                workingPanelViewMode={projectConfig.view_mode}
                                stopMouseEvent={resizing}
                            />
                        </Pane>
                        <Pane>
                            <RichOutputPanel stopMouseEvent={resizing} />
                        </Pane>
                    </SplitPane>
                </Pane>
            </SplitPane>
            <DFManager />
            <FileManager />
            <TerminalManager />
            <HotkeyComponent />
            {/* <Notifier /> */}
        </StyledWorkingPanel>
    );
};

export default WorkingPanel;
