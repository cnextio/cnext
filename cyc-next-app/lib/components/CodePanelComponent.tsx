import React, { FC, ReactElement, useEffect, useRef, useState } from "react";
import { CodePanel, CodeToolbar, CodeContainer, CodeOutputContainer, CodeOutputContent} from "./StyledComponents";
import SplitPane, {Pane} from 'react-split-pane';
import CodeEditorComponent from "./CodeEditorComponent";
import WorkingPanelDividerComponent from "./WorkingPanelDivider";
import { Typography } from "@mui/material";  
import {Message} from "./AppInterfaces";
import CodeOutputComponent from "./CodeOutputComponent";
// import { pure } from 'recompose';

const CodePanelComponent = React.memo((props: any) => {
    const [codeOutput, setCodeOutput] = useState<Message>({commandType: "", contentType: "", content: "", error: false});

    // use useCallback to avoid rerender CodeEditorComponent when this is rerendered
    // see this https://felixgerschau.com/react-performance-react-memo/
    const recvCodeOutput = React.useCallback(
        (output: Message) => {            
        setCodeOutput(output);
    }, []);

    return (        
        <CodePanel >
            {console.log('CodePanelComponent rerender')}            
            <CodeToolbar />                
            <WorkingPanelDividerComponent />
            <CodeContainer>
                <SplitPane split="horizontal" defaultSize="70%" pane2Style={{height: "0%"}}>  
                            {/* panel2 height is the must for the scrolling to work */}
                    <CodeEditorComponent {... props} recvCodeOutput={recvCodeOutput} />
                    <CodeOutputComponent codeOutput={codeOutput} />
                </SplitPane>            
            </CodeContainer>
        </CodePanel>
    );
  });
  
  export default CodePanelComponent;


