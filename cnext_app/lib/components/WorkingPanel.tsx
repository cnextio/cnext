import React, { useContext, useEffect, useState } from "react";
import { WorkingPanel as StyledWorkingPanel } from "./StyledComponents";
import CodePanel from "./code-panel/CodePanel";
import RichOutputPanel from "./richoutput-panel/RichOutputPanel";
import DataFrameManager from "./dataframe-manager/DataFrameManager";
import FileManager from "./file-manager/FileManager";
import FileExplorer from "./file-manager/FileExplorer";
import { useSelector } from "react-redux";
import Pane from "react-split-pane-v2";
import { RootState } from "../../redux/store";
import SplitPane from "react-split-pane-v2";
import { CommandName, ContentType, IMessage, WebAppEndpoint } from "../interfaces/IApp";
import { sendMessage, SocketContext } from "./Socket";
import TerminalManager from "./terminal-manager/TerminalManager";
import Router, { useRouter } from 'next/router'

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { ProjectCommand } from "../interfaces/IFileManager";

let provider;
const ydoc = new Y.Doc();
// const project = ydoc.getMap('project');
import HotkeyComponent from "./hotkeys/HotKeys";
import { Notifier } from "./notifier/Notifier";

const WorkingPanel = () => {
    const router = useRouter()
    const [isReady, setIsReady] = useState(false);
    const { share, remoteProject } = router.query;

    useEffect(() => {
        if (router.isReady) {
            const { remoteProject } = router.query;
            if (!remoteProject) {
                setIsReady(true);
            } else {
                ydoc.once('update', (update, origin, doc: Y.Doc) => {
                    const workspace = doc.getText('workspace');
                    const project = doc.getMap('project');

                    if (workspace && project) {
                        console.log(project.toJSON());
                        setIsReady(true);
                    }
                });
            }
        }
    }, [router.isReady]);

    if (typeof window !== 'undefined') {
        if (share || remoteProject) {
            if (!provider) {
                provider = new WebrtcProvider(`cnext-${share || remoteProject}`, ydoc)
                const awareness = provider.awareness
                awareness.setLocalStateField('user', { name: "Huy TQ", color: '#FF0000' })
            }
        }
    }

    const socket = useContext(SocketContext);
    const showProjectExplore = useSelector(
        (state: RootState) => state.projectManager.showProjectExplore
    );



    const setupSocket = () => {
        socket?.on(WebAppEndpoint.FileExplorer, (result: string, ack) => {
            try {
                let fmResult: IMessage = JSON.parse(result);
                if (!fmResult.error) {
                    switch (fmResult.command_name) {
                        case ProjectCommand.get_project_content:
                            const tree = new Y.Text(JSON.stringify(fmResult.content.tree));
                            const project = ydoc.getMap('project');
                            console.log('@@@trrrrrrrrrr', fmResult.content.tree);
                            project.set('@tree', tree);

                            for (const [key, value] of Object.entries(fmResult.content.files)) {
                                const content = value.content.join("\n");
                                if (!project.has(key)) {
                                    const file = new Y.Map();
                                    file.set('source', new Y.Text(content));
                                    file.set('data', new Y.Text(JSON.stringify(value)));
                                    file.set('json', new Y.Text(JSON.stringify(value.code_lines)));
                                    project.set(key, file);
                                } else {
                                    console.log("file already exists", key);
                                    const file = project.get(key);
                                    const source = file.get('source');
                                    source.delete(0, source.length);
                                    source.insert(0, content);

                                    file.set('data', new Y.Text(JSON.stringify(value)));
                                    file.set('json', new Y.Text(JSON.stringify(value.code_lines)));
                                }
                            }
                            break;
                    }                    
                } else {
                }
            } catch (error) {
                console.error(error);
            }
            if (ack) ack();
        });
    };

    const createMessage = (command: ProjectCommand, metadata: {}, content = null): IMessage => {
        let message: IMessage = {
            webapp_endpoint: WebAppEndpoint.FileExplorer,
            command_name: command,
            content: content,
            type: ContentType.STRING,
            error: false,
            metadata: metadata,
        };
        return message;
    };
    
    const activeProject = useSelector((state: RootState) => state.projectManager.activeProject);

    useEffect(() => {
        setupSocket();

        if (share && activeProject) {
            const projectPath = activeProject.path;
            let message: IMessage = createMessage(ProjectCommand.get_project_content, {
                project_path: projectPath,
                path: '',
            });
            socket?.emit(WebAppEndpoint.FileExplorer, JSON.stringify(message));
        }

        return () => {
            // socket?.off(WebAppEndpoint.FileExplorer);
        };
    }, [socket, activeProject]);

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
            sendMessage(socket, WebAppEndpoint.CodeEditor, message);
        }
    };

    useEffect(() => {
        set_tracking_uri(experiment_tracking_uri);
    }, [experiment_tracking_uri]);

    const [resizing, setResizing] = useState(false);
    const [codePanelSize, setCodePanelSize] = useState<string>("700px");
    return isReady ?
        <StyledWorkingPanel>
            {console.log("WorkingPanel render")}
            <SplitPane split="vertical">
                <Pane
                    size={
                        showProjectExplore
                            ? projectConfig.layout?.project_explorer_size + "px"
                            : "0px"
                    }
                >
                    <FileExplorer ydoc={ydoc} share={share} provider={provider} remoteProject={remoteProject} />
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
                                share={share}
                                remoteProject={remoteProject}
                                ydoc={ydoc}
                                provider={provider}
                            />
                        </Pane>
                        <Pane>
                            <RichOutputPanel stopMouseEvent={resizing} />
                        </Pane>
                    </SplitPane>
                </Pane>
            </SplitPane>
            <DataFrameManager />
            <FileManager ydoc={ydoc} share={share} provider={provider} remoteProject={remoteProject} />
            <TerminalManager />
            <HotkeyComponent />
            <Notifier />
        </StyledWorkingPanel>
        : <div></div>;
};

export default WorkingPanel;
