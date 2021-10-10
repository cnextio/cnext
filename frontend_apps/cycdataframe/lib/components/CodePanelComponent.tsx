import React, { FC, useEffect, useRef, useState } from "react";
import { CodePanel, CodeToolbar, CodeArea, CodeOutputArea, TextCodeOutputArea} from "./StyledComponents";
import SplitPane, {Pane} from 'react-split-pane';
import CodeEditorComponent from "./CodeAreaComponent";
import WorkingPanelDividerComponent from "./WorkingPanelDivider";
import { Typography } from "@mui/material";  
import {CodeOutput} from "./Interfaces";
// import { pure } from 'recompose';

const OutputLine = (content: string) => {
    return (
        <Typography variant="body2">
            {decodeURIComponent(content)}
        </Typography>
    )
}

const CodeOutputAreaComponent = (props: {codeOutput: CodeOutput}) => {
    let [outputContent, setOutputContent] = useState<JSX.Element[]>([]);
    let [outputType, setOutputType] = useState('');
    const endRef = useRef(null);

    useEffect(() => {
        try {
            let newOutputContent = OutputLine(props.codeOutput.content);
            setOutputContent(outputContent => [...outputContent, newOutputContent]);
            // console.log(outputContent);
        } catch {
            // TODO: process json error 
            // console.log(props.codeOutput);
        }
    }, [props.codeOutput])

    const scrollToBottom = () => {
        // need block and inline property because of this 
        // https://stackoverflow.com/questions/11039885/scrollintoview-causing-the-whole-page-to-move/11041376
        endRef.current.scrollIntoView({behavior: "smooth", block: 'nearest', inline: 'start' })
    }

    useEffect(scrollToBottom, [outputContent]);

    return (
        <CodeOutputArea>
            {console.log('CodeOutputAreaComponent rerender')}   
            <TextCodeOutputArea>
                {outputContent}
                <div ref={endRef}/>
            </TextCodeOutputArea>              
        </CodeOutputArea>
    )
}

const CodePanelComponent = React.memo((props: any) => {
    const [codeOutput, setCodeOutput] = useState<CodeOutput>({type: "", content: ""});

    // user useCallback to avoid rerender CodeEditorComponent when this is rerendered
    // see this https://felixgerschau.com/react-performance-react-memo/
    const recvCodeOutput = React.useCallback(
        (output: CodeOutput) => {
        setCodeOutput(output);
    }, []);

    return (        
        <CodePanel >
            {console.log('CodePanelComponent rerender')}            
            <CodeToolbar />                
            <WorkingPanelDividerComponent />
            <CodeArea>
                <SplitPane split="horizontal" defaultSize="70%" pane2Style={{height: "30%"}}>  
                            {/* panel2 height is the must for the scrolling to work */}
                    <CodeEditorComponent {... props} recvCodeOutput={recvCodeOutput} />
                    <CodeOutputAreaComponent codeOutput={codeOutput} />
                </SplitPane>            
            </CodeArea>
        </CodePanel>
    );
  });
  
  export default CodePanelComponent;


