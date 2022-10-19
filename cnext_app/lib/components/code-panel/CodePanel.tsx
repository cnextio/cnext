import React, { useEffect, useState } from "react";
import { StyledCodePanel, CodeContainer } from "../StyledComponents";
import SplitPane from "react-split-pane-v2";
// import CodeEditor from "./CodeEditor";
// import CodeEditor from "./monaco/CodeEditor";
import { IMessage, ViewMode } from "../../interfaces/IApp";
import CodeToolbar from "./CodeToolbar";
import Pane from "react-split-pane-v2";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import TextIOComponent from "./TextIOComponent";
import StyledExecutorToolbar from "../executor-manager/ExecutorToolbar";
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

import dynamic from 'next/dynamic';

const CodeEditor = dynamic(() => import('./monaco/CodeEditor'), {
  ssr: false,
});

let provider;
const ydoc = new Y.Doc();
const project = ydoc.getMap('project');

const CodePanel = ({ workingPanelViewMode, stopMouseEvent }) => {

    if (typeof window !== 'undefined') {
        if (!provider) {
            provider = new WebrtcProvider('cnexttttt', ydoc)
            console.log('WebrtcProvider');
        }
    }


    const inViewID = useSelector((state: RootState) => state.projectManager.inViewID);

    useEffect(() => {
        if (inViewID) {
            const path = inViewID;
            if (!project.has(path)) {
                const file = new Y.Map();
                const source = new Y.Text();
                file.set('source', source);
                const json = new Y.Text();
                file.set('json', json);
                project.set(path, file);
            }
        }
    }, [inViewID]);

    return (
        <StyledCodePanel style={{ position: "relative" }}>
            {console.log("CodePanel render ")}
            <CodeToolbar />
            <StyledExecutorToolbar />

            <CodeContainer>
                <SplitPane
                    split={
                        workingPanelViewMode === ViewMode.HORIZONTAL
                            ? ViewMode.VERTICAL
                            : ViewMode.HORIZONTAL
                    }
                >
                    {inViewID != null && (
                        <Pane>
                            <CodeEditor stopMouseEvent={stopMouseEvent} ydoc={ydoc} project={project} provider={provider} />
                        </Pane>
                    )}
                    <Pane size="30%">
                        <TextIOComponent />
                    </Pane>
                </SplitPane>
            </CodeContainer>
        </StyledCodePanel>
    );
};

export default CodePanel;
