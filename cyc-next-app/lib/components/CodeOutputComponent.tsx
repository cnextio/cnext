import React, { Fragment, ReactElement, useEffect, useRef, useState } from "react";
import { CodeOutputContainer, CodeOutputHeader, CodeOutputContent, IndividualCodeOutputContent} from "./StyledComponents";
import { Typography } from "@mui/material";  
import { UpdateType } from "./Interfaces";
import { useSelector } from "react-redux";
import store from '../../redux/store';
import { ifElse } from "./libs";

// const OutputLine = (content: string|ReactElement) => {
//     return (
//         <Typography variant="body2" fontSize="14px">
//             {content}
//         </Typography>
//     )
// }

const CodeOutputComponent = ({codeOutput}) => {
    const dataFrameUpdates = useSelector((state) => state.dataFrames.dataFrameUpdates);
    let [outputContent, setOutputContent] = useState<JSX.Element[]>([]);
    let [outputType, setOutputType] = useState('');
    const endPointRef = useRef(null);
    const activityText = {
        'add_cols': 'added',
        'del_cols': 'removed'            
    };  

    const _getMessageComponent = (updateType: UpdateType, updateElements: Array<any>) => {
        let message = null;
        if (updateElements.length>0){  
            message = (                            
                // <Fragment>
                    `${updateElements.length} column(s) ${activityText[updateType]}`
                // </Fragment>                            
            );            
        }        
        return message;
    }
    
    useEffect(() => {
        try {
            if(codeOutput.content != '' && codeOutput.content != null){
                const newOutputContent = codeOutput.content; //OutputLine(codeOutput.content);               
                setOutputContent(outputContent => [...outputContent, newOutputContent]);
                // console.log(codeOutput);
            }
        } catch(error) {
            // TODO: process json error 
            console.error(error);
        }
    }, [codeOutput])

    useEffect(() => {
        const state = store.getState();
        const activeDataFrame = state.dataFrames.activeDataFrame;
        const activeDataFrameUpdates = dataFrameUpdates[activeDataFrame]
        if (activeDataFrame != null){            
            const updateType = ifElse(activeDataFrameUpdates, 'update_type', null);
            const update_content = ifElse(activeDataFrameUpdates, 'update_content', []);

            let newOutputContent = _getMessageComponent(updateType, update_content);
            if (newOutputContent != null) {                          
                setOutputContent(outputContent => [...outputContent, newOutputContent]);
            }            
        }
        
    }, [dataFrameUpdates])

    const scrollToBottom = () => {
        // need block and inline property because of this 
        // https://stackoverflow.com/questions/11039885/scrollintoview-causing-the-whole-page-to-move/11041376
        endPointRef.current.scrollIntoView({behavior: "smooth", block: 'nearest', inline: 'start' })
    }

    useEffect(scrollToBottom, [outputContent]);

    return (
        <CodeOutputContainer >
            {console.log('Render CodeOutputAreaComponent')}   
            <CodeOutputHeader variant="overline" component="span">
                Output
            </CodeOutputHeader>
            <CodeOutputContent>
                {outputContent.map((item) => (
                    <IndividualCodeOutputContent component='pre' variant='body2'>
                        {item}
                    </IndividualCodeOutputContent>
                ))}
                <div ref={endPointRef}></div>
            </CodeOutputContent>  
        </CodeOutputContainer>
    )
}

export default CodeOutputComponent;


