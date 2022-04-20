import React, { useState } from "react";
import { StyledCodePanel, CodeContainer } from "../StyledComponents";
import SplitPane from "react-split-pane-v2";
import CodeEditor from "./CodeEditor";
import { IMessage, ViewMode } from "../../interfaces/IApp";
import CodeOutput from "./CodeOutput";
import CodeToolbar from "./CodeToolbar";
import Pane from "react-split-pane-v2";

const CodePanel = ({ workingPanelViewMode }) => {
    return (
        <StyledCodePanel>
            {console.log("CodePanel render ")}
            <CodeToolbar />
            <CodeContainer>
                <SplitPane
                    split={
                        workingPanelViewMode === ViewMode.HORIZONTAL
                            ? ViewMode.VERTICAL
                            : ViewMode.HORIZONTAL
                    }
                >
                    <Pane>
                        <CodeEditor />
                    </Pane>
                    <Pane size="30%">
                        <CodeOutput />
                    </Pane>
                </SplitPane>
            </CodeContainer>
        </StyledCodePanel>
    );
};

export default CodePanel;
