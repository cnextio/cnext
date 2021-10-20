import React, { FC, ReactElement, useEffect, useRef, useState } from "react";
import { CodePanel, CodeToolbar, CodeContainer, CodeOutputContainer, TextCodeOutputContainer} from "./StyledComponents";
import SplitPane, {Pane} from 'react-split-pane';
import CodeEditorComponent from "./CodeAreaComponent";
import WorkingPanelDividerComponent from "./WorkingPanelDivider";
import { Typography } from "@mui/material";  
import {Message} from "./interfaces";
// import { pure } from 'recompose';

const OutputLine = (content: string|ReactElement) => {
    return (
        <Typography variant="body2" fontSize="14px">
            {content}
        </Typography>
    )
}

const CodeOutputAreaComponent = (props: {codeOutput: Message}) => {
    let [outputContent, setOutputContent] = useState<JSX.Element[]>([]);
    let [outputType, setOutputType] = useState('');
    const endRef = useRef(null);

    useEffect(() => {
        try {
            const newOutputContent = OutputLine(props.codeOutput.content);            
            const emptyLine = OutputLine(<br/>);            
            setOutputContent(outputContent => [...outputContent, emptyLine, newOutputContent]);
            console.log(props.codeOutput);
        } catch(error) {
            // TODO: process json error 
            console.error(error);
        }
    }, [props.codeOutput])

    const scrollToBottom = () => {
        // need block and inline property because of this 
        // https://stackoverflow.com/questions/11039885/scrollintoview-causing-the-whole-page-to-move/11041376
        endRef.current.scrollIntoView({behavior: "smooth", block: 'nearest', inline: 'start' })
    }

    useEffect(scrollToBottom, [outputContent]);

    return (
        <CodeOutputContainer >
            {console.log('CodeOutputAreaComponent rerender')}   
            <TextCodeOutputContainer>
                {outputContent}
                <div ref={endRef}></div>
            </TextCodeOutputContainer>  
        </CodeOutputContainer>
    )
}

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
                    <CodeOutputAreaComponent codeOutput={codeOutput} />
                </SplitPane>            
            </CodeContainer>
        </CodePanel>
    );
  });
  
  export default CodePanelComponent;


