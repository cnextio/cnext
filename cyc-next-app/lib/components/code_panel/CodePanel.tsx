import React, { FC, ReactElement, useEffect, useRef, useState } from "react";
import { StyledCodePanel, PanelDivider, StyledCodeToolbar, CodeContainer, CodeOutputContainer, CodeOutputContent} from "../StyledComponents";
import SplitPane, {Pane} from 'react-split-pane';
import CodeEditor from "./CodeEditor";
// import WorkingPanelDivider from "../obs-WorkingPanelDivider";
import { Typography } from "@mui/material";  
import {Message} from "../../interfaces/IApp";
import CodeOutputComponent from "./CodeOutput";
import CodeToolbar from "./CodeToolbar";
// import { pure } from 'recompose';

const CodePanel = React.memo((props: any) => {
    const [codeOutput, setCodeOutput] = useState<Message>({commandType: "", contentType: "", content: "", error: false});

    // use useCallback to avoid rerender CodeEditorComponent when this is rerendered
    // see this https://felixgerschau.com/react-performance-react-memo/
    const recvCodeOutput = React.useCallback(
        (output: Message) => {            
        setCodeOutput(output);
    }, []);

    return (        
        <StyledCodePanel >
            {console.log('CodePanelComponent rerender')}            
            <CodeToolbar />                
            {/* <WorkingPanelDivider color='white'/> */}
            <CodeContainer>
                <SplitPane split="horizontal" defaultSize="70%" pane2Style={{height: "30%"}}>  
                            {/* panel2 height is the must for the scrolling to work */}
                    <CodeEditor {... props} recvCodeOutput={recvCodeOutput} />
                    <CodeOutputComponent codeOutput={codeOutput} />
                </SplitPane>            
            </CodeContainer>
        </StyledCodePanel>
    );
  });
  
  export default CodePanel;


