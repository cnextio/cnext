import React, { forwardRef, RefObject, SyntheticEvent, useEffect, useRef, useState } from "react";
import { CodeEditor } from "./StyledComponents";
import {RecvCodeOutput, CodeOutput, DataTableContent} from "./Interfaces";

//redux
import { useSelector, useDispatch } from 'react-redux'
import { update as tableDataUpdate } from "../../redux/reducers/tableDataSlice";
import { inc as incCounter } from "../../redux/reducers/counterSlice";

// import {tableData as testTableData} from "./tests/TestTableData";

import socketIOClient from "socket.io-client";
const SOCKET_ENDPOINT = "http://localhost:4000";

// const Editor = React.forwardRef((props: any, ref) => {
//     if (typeof window !== 'undefined') {
//         const AceEditor = require('react-ace').default;
//         require('ace-builds/src-noconflict/mode-python');
//         require('ace-builds/src-noconflict/theme-xcode');
//         require('ace-builds/src-noconflict/ext-language_tools');
//         require('ace-builds/src-noconflict/snippets/python');        
//         return <AceEditor {...props} ref={ref}/>
//     }
  
//     return null;
//   });

import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { languageServer } from 'codemirror-languageserver';
import {keymap, EditorView} from "@codemirror/view"

const ls = languageServer({
    serverUri: "ws://localhost:3001/python",
    rootUri: 'file:///',
    documentUri: `file:///test`,
    languageId: 'python'
});

const Editor = React.forwardRef((props: any, ref) => {  
    return (
        <CodeMirror
            value = "print('hello world!')"
            height = "100%"
            style = {{fontSize: "14px"}}
            extensions = {[python(), ls]}
            theme = 'light'
            onChange = {(value, viewUpdate) => {
                // console.log('value:', value);
            }}
        >
        </CodeMirror>
    )    
});

import {defaultKeymap} from "@codemirror/commands"

// const CodeEditorComponent = React.memo((props: {recvCodeOutput: RecvCodeOutput}) => {
const CodeEditorComponent = React.memo((props: any) => {
    const [mounted, setMounted] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        setMounted(true);
        socket.emit("ping");
        socket.on("output", (result: string) => {
            console.log("Got results: ", result, '\n');
            try {
                let codeOutput: CodeOutput = JSON.parse(result);                
                if (codeOutput.commandType == 'exec'){
                    props.recvCodeOutput(codeOutput); //TODO: move this to redux
                } else if (codeOutput.commandType == 'eval'){
                    if(codeOutput.error==true){
                        props.recvCodeOutput(codeOutput);
                    } else if (codeOutput.contentType=="<class 'pandas.core.frame.DataFrame'>"){
                        console.log("dispatch tableData");               
                        dispatch(tableDataUpdate(codeOutput.content));
                    }
                    else {  
                        console.log("dispatch text output:", codeOutput);                        
                        props.recvCodeOutput(codeOutput);
                    }
                }
                //for testing
                // let codeOutput: DataTableContent = JSON.parse(result);
                // dispatch(tableDataUpdate(testTableData)
            } catch {

            }
        });
        // editorRef;
    }, []); //run this only once - not on rerender

    const editorRef = useRef(null);
    useEffect(() => {
        // editorRef.current.setKeyMap();
    }, []);

    const socket = socketIOClient(SOCKET_ENDPOINT);
    
    const _getLineContent = (editor) => {
        const anchor = editor.state.selection.ranges[0].anchor;
        const line_count = editor.state.doc.lines;
        const doc = editor.state.doc;
        var current_line_end = doc.line(1).length;
        for(var i=1; i<=line_count; i++){
            if (anchor<current_line_end){
                return doc.line(i).text;
            } else {
                current_line_end += doc.line(i).length;
            }
        }
    }

    const runLine = (editor: any) => {
        let content = _getLineContent(editor);
        console.log("exec: ", content);
        socket.emit("exec", content);
        return true;
    }

    const runAll = (editor: any) => {
        let content = editor.getValue();
        console.log("exec: ", content);
        socket.emit("exec", content);
    }

    const onChange = (value: string) => {
        // console.log("Run", value);
        // socket.emit("run", value);
        // socket.on("result", (result: object) => {
        //     console.log("Result: " + result);
        // });
    }

    return (
        <CodeEditor>
            {console.log('CodeEditorComponent rerender')}
            {/* { mounted ? */}
            <CodeMirror
                ref = {editorRef}
                value = "print('hello world!')"
                height = "100%"
                style = {{fontSize: "14px"}}
                extensions = {[python(), ls, keymap.of([{key: 'Mod-Enter', run: runLine}])]}                    
                theme = 'light'
                onChange = {(value, viewUpdate) => {
                    // console.log('value:', value);
                }}                    
            >
            </CodeMirror> 
            {/* : null } */}
        </CodeEditor>
    )
});

export default CodeEditorComponent;