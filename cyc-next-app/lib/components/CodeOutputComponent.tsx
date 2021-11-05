import React, { Fragment, ReactElement, useEffect, useRef, useState } from "react";
import { CodeOutputContainer, CodeOutputHeader, CodeOutputContent, IndividualCodeOutputContent} from "./StyledComponents";
import { Box, Icon, IconButton, Typography } from "@mui/material";  
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { UpdateType } from "./AppInterfaces";
import { useDispatch, useSelector } from "react-redux";
import store from '../../redux/store';
import { ifElse } from "./libs";
import { scrollLock, scrollUnlock } from "../../redux/reducers/scrollLockSlice";

// const OutputLine = (content: string|ReactElement) => {
//     return (
//         <Typography variant="body2" fontSize="14px">
//             {content}
//         </Typography>
//     )
// }

export enum ReviewType {
    back = 'back',
    current = 'current',
    next = 'next'
}

const ReviewButton = ({type}) => {
    return (
        <IconButton aria-label="Back" size="small" color='primary'>
            {type==ReviewType.back && <ArrowBackIosIcon fontSize="small" style={{width: '14px', height: '14px'}}/>}
            {type==ReviewType.current && <FiberManualRecordIcon fontSize="small" style={{width: '14px', height: '14px'}}/>}
            {type==ReviewType.next && <ArrowForwardIosIcon fontSize="small" style={{width: '14px', height: '14px'}}/>}
        </IconButton>
    )
}

const ReviewComponent = ({content}) => {
    let [reviewing, setReviewing] = useState<boolean>(false);

    return (
        <Fragment>
            <ReviewButton type={ReviewType.back} />
            <ReviewButton type={ReviewType.current} />
            <ReviewButton type={ReviewType.next} />
        </Fragment>
    )
}

const CodeOutputComponent = ({codeOutput}) => {
    const dataFrameUpdates = useSelector((state) => state.dataFrames.dataFrameUpdates);
    let [outputContent, setOutputContent] = useState<JSX.Element[]>([]);
    let [outputType, setOutputType] = useState('');
    const endPointRef = useRef(null);
    const codeOutputRef = useRef(null);
    const dispatch = useDispatch();

    const activityText = {
        'add_cols': 'added',
        'del_cols': 'removed',
        'add_rows': 'added',
        'del_rowss': 'removed'            
    };  

    const _getElementComponent = (updateElements: Array<any>) => {
        console.log(updateElements[0]);
        return (
            <Fragment>
                {updateElements.map((elem, index) => (                    
                    <Fragment>
                        <Typography key={index} variant='caption' component='span' style={{fontWeight: 'bold'}}>                                            
                            {elem}
                        </Typography>
                        {index < updateElements.length-1 ? ", " : " "}
                    </Fragment>
                ))}
            </Fragment>           
        );
    }
    
    const _getDFUpdatesOutputComponent = (updateType: UpdateType, updateElements: Array<any>) => {
        let message = null;
        if (updateElements.length>0){  
            message = (  
                <Box sx={{ display: 'flex'}}>
                    <Box>                        
                        {(updateType==UpdateType.add_cols || updateType==UpdateType.del_cols) && 
                            <Fragment>
                                Column{updateElements.length>1 ? 's' : ''} {_getElementComponent(updateElements)} {activityText[updateType]} 
                            </Fragment>
                        }
                        {(updateType==UpdateType.add_rows || updateType==UpdateType.del_rows) && 
                            <Fragment>
                                Row{updateElements.length>1 ? 's' : ''} {_getElementComponent(updateElements)} {activityText[updateType]} 
                            </Fragment>
                        }
                    </Box>
                    <Box sx={{ flexGrow: 1, textAlign: 'right'}}>
                        <ReviewComponent content/>      
                    </Box>
                </Box>                          
            );                        
        }        
        return message;
    }
    
    const handleNormalCodeOutput = () => {
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
    }
    useEffect(handleNormalCodeOutput, [codeOutput]);

    const handleDFUpdates = () => {
        //TODO: handle situation when dataFrameUpdates is cleared, should not rerender in that case
        const state = store.getState();
        const activeDataFrame = state.dataFrames.activeDataFrame;
        const activeDataFrameUpdates = dataFrameUpdates[activeDataFrame]
        if (activeDataFrame != null){            
            const updateType = ifElse(activeDataFrameUpdates, 'update_type', null);
            const update_content = ifElse(activeDataFrameUpdates, 'update_content', []);

            let newOutputContent = _getDFUpdatesOutputComponent(updateType, update_content);
            if (newOutputContent != null) {                          
                setOutputContent(outputContent => [...outputContent, newOutputContent]);
            }            
        }
    }
    useEffect(handleDFUpdates, [dataFrameUpdates]);
    
    const _setTimeoutToUnlockScroll = () => {
        /* 
        * We use this scroll lock and timeout to make sure this and TableComponent can scroll to view
        * at the same time. This is very ugly solution for this problem. The current assumption is this will 
        * scroll first.
        * https://stackoverflow.com/questions/49318497/google-chrome-simultaneously-smooth-scrollintoview-with-more-elements-doesn
        */
        if (codeOutputRef.current){
            let scrollTimeout;            
            codeOutputRef.current.addEventListener('scroll', function(e) {                
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(function() {                
                    dispatch(scrollUnlock()); 
                }, 50);
            });
            // have to set this outside as well to handle the case where there is no scroll
            scrollTimeout = setTimeout(function() {              
                dispatch(scrollUnlock()); 
            }, 200); //TODO: the latency here is pretty high, but it does not work with lower number. 
                     // need to figure out a better way to handle this no scroll event.
        }   
    }
    
    const scrollToBottom = () => {        
        // need block and inline property because of this 
        // https://stackoverflow.com/questions/11039885/scrollintoview-causing-the-whole-page-to-move/11041376        
        if(endPointRef.current){                                                
            // see: https://stackoverflow.com/questions/46795955/how-to-know-scroll-to-element-is-done-in-javascript                         
            dispatch(scrollLock());
            endPointRef.current.scrollIntoView({behavior: "smooth", block: 'nearest', inline: 'start' });           
            _setTimeoutToUnlockScroll();                         
        }
    }

    useEffect(scrollToBottom, [outputContent]);

    return (
        <CodeOutputContainer >
            {console.log('Render CodeOutputAreaComponent')}   
            <CodeOutputHeader variant="overline" component="span">
                Output
            </CodeOutputHeader>
            <CodeOutputContent ref={codeOutputRef}>
                {outputContent.map((item, index) => (
                    <IndividualCodeOutputContent key={index} component='pre' variant='body2'>
                        {item}
                    </IndividualCodeOutputContent>
                ))}
                <div ref={endPointRef}></div>
            </CodeOutputContent>  
        </CodeOutputContainer>
    )
}

export default CodeOutputComponent;


