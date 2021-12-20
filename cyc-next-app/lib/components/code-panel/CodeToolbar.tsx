import React, { FC, Fragment, ReactElement, useEffect, useRef, useState } from "react";
import { StyledCodePanel, CodeToolbar as StyledCodeToolbar, CodeContainer, CodeOutputContainer, CodeOutputContent, FileNameTab, TableViewHeaderButton, PanelDivider, StyledExecutorIcon} from "../StyledComponents";
import { Divider, IconButton, Tab, Typography } from "@mui/material";  
import MenuIcon from '@mui/icons-material/Menu';
import { useDispatch, useSelector } from "react-redux";
import store from '../../../redux/store';
import { setInView } from "../../../redux/reducers/ProjectManagerRedux";

function FileMenu() {
    return (
        <IconButton size="large" color='default'>
            <MenuIcon style={{width: '18px', height: '18px'}}/>
        </IconButton>
    )
}

function ExecutorIcon() {
    return (
        <StyledExecutorIcon color='primary' fontSize="small" />
    )
}
function CodeToolbar() {
    const openFiles = useSelector(state => state.projectManager.openFiles);
    const executorID = useSelector(state => state.projectManager.executorID);
    const inViewID = useSelector(state => state.projectManager.inViewID);
    const fileSaved = useSelector(state => state.codeEditor.fileSaved);
    const dispatch = useDispatch()

    function onClick(key: string){
        dispatch(setInView(key));
    }

    function _getFileNameComponent(id: string, name: string){
        // let state = store.getState();
        // state.fileManager.executorID
        return (
            <Fragment>
                <FileNameTab 
                    selected = {id==inViewID}
                    component = "span" 
                    key = {id}
                    onClick = {() => onClick(id)}
                    fileSaved = {id!=inViewID || fileSaved}
                >
                    {name}
                    {(id==executorID) && <ExecutorIcon/>}
                </FileNameTab>
                <PanelDivider orientation='vertical' color='light'/>
            </Fragment>
        )
    }

    return (        
        <StyledCodeToolbar>
            {/* always display executor first */}
            {executorID && _getFileNameComponent(executorID, openFiles[executorID].name)}                
            {Object.keys(openFiles).map((key: string) => {
                {console.log(key, openFiles[key].name)}
                if(key !== executorID){
                    return _getFileNameComponent(key, openFiles[key].name);
                }
            })}             
        </StyledCodeToolbar>
    );
};
  
export default CodeToolbar;


