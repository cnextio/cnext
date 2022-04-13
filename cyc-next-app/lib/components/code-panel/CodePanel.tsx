import React, { useState } from "react";
import { StyledCodePanel, CodeContainer } from "../StyledComponents";
import SplitPane from "react-split-pane-v2";
import CodeEditor from "./CodeEditor";
import { IMessage, ViewMode } from "../../interfaces/IApp";
import CodeOutput from "./CodeOutput";
import CodeToolbar from "./CodeToolbar";

const CodePanel = ({ workingPanelViewMode }) => {
    const [codeOutput, setCodeOutput] = useState<IMessage>({
        commandType: "",
        contentType: "",
        content: "",
        error: false,
    });

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
                    defaultSize='70%'
                    pane2Style={{ height: "30%" }}
                >
                    <CodeEditor />
                    <CodeOutput />
                </SplitPane>
            </CodeContainer>
        </StyledCodePanel>
    );
};

export default CodePanel;
