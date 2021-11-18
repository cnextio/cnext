import { python } from "@codemirror/lang-python";
import { FormControl, InputLabel, MenuItem, OutlinedInput, Select } from "@mui/material";
import React, { Fragment, useEffect, useRef, useState } from "react";

// redux
import { useDispatch, useSelector } from 'react-redux'
import { CodeEditor, DFFilterForm, DFFilterInput, StyledCodeMirror, StyledFilterCodeMirror } from "./StyledComponents";
import { bracketMatching } from "@codemirror/matchbrackets";
import { closeBrackets } from "@codemirror/closebrackets";
import { defaultHighlightStyle } from "@codemirror/highlight";

import { dfFilterLanguageServer } from "codemirror-languageserver";

const ls = dfFilterLanguageServer({
    languageId: 'python'
});

const DFExplorer = () => {
    // const dfList = useSelector((state) => _checkDFList(state));
    const dispatch = useDispatch();
    const [filterText, setFilterText] = useState();
    const filterElem = useRef();
    // function _checkDFList(state) {
    //     let activeDF = state.dataFrames.activeDataFrame;
    //     return {activeDF: activeDF, list: Object.keys(state.dataFrames.tableData)};        
    // };

    // useEffect(() => {
    //     const state = store.getState();
        
    // }, []);

    function onFilterChange({ target }){
        let inputText = target.value;
        setFilterText(inputText);
        // if (inputText.slice(-1) === '['){
            // setFilterText(inputText);
        // }
        // console.log('Handle change: ', target);
        // dispatch(setActiveDF(target.value));
    };

    // function onCMChange(text, viewUpdate){
    //     console.log(text);
    // }

    // function onCMUpdate(viewUpdate){
    //     console.log(viewUpdate);
    // }

    const extensions = [
        // basicSetup(),
        bracketMatching(),
        closeBrackets(),
        defaultHighlightStyle,
        python(),
        ls,
    ];
    return (
        <DFFilterForm>
            {/* <InputLabel sx={{fontSize: '13px', p: '0px'}}>Data Frame</InputLabel> */}
            <DFFilterInput  
                // sx={{ borderBottom: 1 }}
                ref = {filterElem}               
                // onChange = {onFilterChange}
                // inputProps = {{style: {padding: '0px 10px', height: '32px'}}}
                placeholder = 'Filter...'
                // value = {filterText}
                inputComponent = {()=>{ 
                    return (
                        <StyledFilterCodeMirror                            
                            extensions = {extensions}   
                            basicSetup = {false}   
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
