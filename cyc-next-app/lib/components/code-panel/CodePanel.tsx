import React, { FC, ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { StyledCodePanel, PanelDivider, CodeContainer, CodeOutputContainer, CodeOutputContent} from "../StyledComponents";
import SplitPane from 'react-split-pane-v2';
import CodeEditor from "./CodeEditor";
// import CodeEditor from "./zzz-CodeEditor";
// import WorkingPanelDivider from "../obs-WorkingPanelDivider";
import { Typography } from "@mui/material";  
import {Message} from "../../interfaces/IApp";
import CodeOutput from "./CodeOutput";
import CodeToolbar from "./CodeToolbar";
// import { pure } from 'recompose';
import shortid from "shortid";

const CodePanel = () => {
    const [codeOutput, setCodeOutput] = useState<Message>({commandType: "", contentType: "", content: "", error: false});

    // use useCallback to avoid rerender CodeEditorComponent when this is rerendered
    // see this https://felixgerschau.com/react-performance-react-memo/
    const recvCodeOutput = React.useCallback(
        (output: Message) => {            
        setCodeOutput(output);
    }, []);

    // const codeEditor = useMemo(() => {return (<CodeEditor recvCodeOutput={recvCodeOutput} id={shortid()}/>)}, []);
    // const codeEditor = <CodeEditor recvCodeOutput={recvCodeOutput} id={shortid()}/>;
    // console.log("CodeEditor render CodePanel codeEditor", codeEditor.props.id);
    // console.log('CodeEditor render CodePanel render ');            
    return (        
        <StyledCodePanel >
            {/* {console.log('CodeEditor render CodePanel render ', id)}             */}
            <CodeToolbar />                
            {/* <WorkingPanelDivider color='white'/> */}
            <CodeContainer>
                <SplitPane split="horizontal" defaultSize="70%" pane2Style={{height: "30%"}}>  
                            {/* panel2 height is the must for the scrolling to work */}
                    {/* {codeEditor} */}
                    <CodeEditor />
                    <CodeOutput />
                </SplitPane>            
            </CodeContainer>
        </StyledCodePanel>
    );
};
  
export default CodePanel;


