// import { python } from "@codemirror/lang-python";
import { cnextQuery } from "./codemirror-extentions/lang-cnext-query";
import { FormControl, InputLabel, MenuItem, OutlinedInput, Select } from "@mui/material";
import React, { Fragment, useEffect, useRef, useState } from "react";

// redux
import { useDispatch, useSelector } from 'react-redux'
import { CodeEditor, DFFilterForm, DFFilterInput, StyledCodeMirror, StyledFilterCodeMirror } from "./StyledComponents";
import { bracketMatching } from "@codemirror/matchbrackets";
import { closeBrackets } from "@codemirror/closebrackets";
import { defaultHighlightStyle } from "@codemirror/highlight";

import { dfFilterLanguageServer } from "codemirror-languageserver";
import { basicSetup } from "@codemirror/basic-setup";
import { keymap } from "@codemirror/view";
import { WHILE_TYPES } from "@babel/types";
import { CommandName, WebAppEndpoint } from "./AppInterfaces";
import { setDFFilter } from "../../redux/reducers/dataFrame";
import store from "../../redux/store";

const ls = dfFilterLanguageServer({
    languageId: 'cnextquery'
});

const DFExplorer = () => {
    // const dfList = useSelector((state) => _checkDFList(state));
    const dispatch = useDispatch();
    const filterCM = useRef();

    /**
     * All query string will be converted to loc/iloc pandas query
     */
    function onCMChange(text, viewUpdate){      
        const state = store.getState();
        const activeDF = state.dataFrames.activeDataFrame;  

        let tree;
        //this is a hacky way to get parser out of state
        for (var v of viewUpdate.state.values){
            if (v && v.context && v.context.tree){
                tree = v.context.tree;
            }
        }
        let queryStr;
        //[1:2, ['a']]['a'>2]
        //[1:2, ['a']][('a'>2) & ('b'<4) | ('c'>5)]
        if (tree){
            console.log(tree.toString());
            let cursor = tree.cursor(0, 0);
            let curComponent;
            if (cursor.name == 'Script' && cursor.firstChild() && cursor.name == 'QueryStatement'){
                cursor.next();
                // queryStr = activeDF;
                queryStr = '';
                while(true) {
                    // console.log(cursor.name);
                    if(cursor.name == 'SimpleQueryExpression') {
                        let indexStr = '';
                        let columnStr = '';
                        let indexEnd;
                        let columnEnd;
                        while(cursor.next()){
                            if (cursor.name == 'IndexExpression') {
                                curComponent='index';
                                indexEnd = cursor.to;
                            } else if (cursor.name == 'ColumnSelectionExpression') {
                                curComponent='column';
                                columnEnd = cursor.to;
                            } else if (cursor.name == 'SimpleQueryExpression') {
                                break;
                            } else {
                                if (curComponent == 'index' && cursor.from >= indexEnd){
                                    curComponent = 'other';
                                }
                                if (curComponent == 'column' && cursor.from >= columnEnd){
                                    curComponent = 'other';
                                }
                            }
                            while(cursor.firstChild());
                            if (curComponent == 'index') {
                                if (cursor.name == 'ColumnNameExpression'){
                                    indexStr = indexStr.concat(activeDF,'[',text.substring(cursor.from, cursor.to),']');
                                } else if (cursor.name == 'isna' || cursor.name == 'notna'){ 
                                    indexStr = indexStr.concat(`.${cursor.name}()`);
                                } else {
                                    indexStr = indexStr.concat(text.substring(cursor.from, cursor.to));
                                }
                            }
                            else if(curComponent == 'column') {
                                columnStr = columnStr.concat(text.substring(cursor.from, cursor.to));                        
                            }
                        }
                        if (indexStr == '' && columnStr != ''){
                            queryStr = queryStr.concat('.loc[',':, ',columnStr,']');
                        }
                        if (indexStr != '') {
                            if (columnStr != ''){
                                queryStr = queryStr.concat('.loc[',indexStr,',',columnStr,']');
                            } else {
                                queryStr = queryStr.concat('.loc[',indexStr,']');
                            }
                        }                              
                        // console.log('index', indexStr);
                        // console.log('column', columnStr);
                        // console.log('query', queryStr);              
                    } else {
                        break;
                    }
                }
            }
        }
        dispatch(setDFFilter({df_id: activeDF, query: queryStr}));
    }

    // const _create_message = (content: string) => {
    //     let message = {};
    //     message['webapp_endpoint'] = WebAppEndpoint.CodeEditorComponent;
    //     message['command_name'] = CommandName.code_area_command;
    //     message['seq_number'] = 1;     
    //     message['content'] = content;
    //     return message;
    // }

    // const _send_message = (content: string) => {
    //     let message = _create_message(content);
    //     console.log(`send ${WebAppEndpoint.CodeEditorComponent} message: `, message);
    //     socket.emit(message.webapp_endpoint, JSON.stringify(message));
    // }
    
    const extensions = [
        // basicSetup,
        bracketMatching(),
        closeBrackets(),
        defaultHighlightStyle.fallback,
        cnextQuery(),
        // python(),
        ls,
    ];
    return (
        <DFFilterForm>
            {/* <InputLabel sx={{fontSize: '13px', p: '0px'}}>Data Frame</InputLabel> */}
            <DFFilterInput  
                // sx={{ borderBottom: 1 }}                              
                // onChange = {onFilterChange}
                // inputProps = {{style: {padding: '0px 10px', height: '32px'}}}
                placeholder = 'Filter...'
                // value = {filterText}
                inputComponent = {()=>{ 
                    return (
                        <StyledFilterCodeMirror 
                            ref = {filterCM}                            
                            extensions = {extensions}   
                            basicSetup = {false}   
                            onChange = {(text, viewUpdate) => onCMChange(text, viewUpdate)} 
                            // placeholder = 'Filter'                      
                        />
                    )}}
            >                         
            </DFFilterInput> 
            {/* <StyledFilterCodeMirror
                            height = "30px"
                            extensions = {extensions}   
                            basicSetup = {false}                         
                        /> */}
        </DFFilterForm>
    )
}

export default DFExplorer;

function bracketClosing() {
    throw new Error("Function not implemented.");
}
