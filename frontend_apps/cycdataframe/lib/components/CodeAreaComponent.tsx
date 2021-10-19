import React, { forwardRef, RefObject, SyntheticEvent, useEffect, useRef, useState } from "react";
import { CodeEditor } from "./StyledComponents";
import {RecvCodeOutput, Message, DataTableContent, CodeRequestOriginator} from "./interfaces";

//redux
import { useSelector, useDispatch } from 'react-redux'
import { updateTableData } from "../../redux/reducers/dataFrameSlice";
import { update as vizDataUpdate } from "../../redux/reducers/vizDataSlice";
import { inc as incCounter } from "../../redux/reducers/counterSlice";

// import {tableData as testTableData} from "./tests/TestTableData";

// import socketIOClient from "socket.io-client";
import socket from "./Socket";
// const SOCKET_ENDPOINT = "http://localhost:4000";

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
import { process_plotly_figure_result } from "./Libs";

const ls = languageServer({
    serverUri: "ws://localhost:3001/python",
    rootUri: 'file:///',
    documentUri: `file:///`,
    languageId: 'python'
});

// const Editor = React.forwardRef((props: any, ref) => {  
//     return (
//         <CodeMirror
//             value = "print('hello world!')"
//             height = "100%"
//             style = {{fontSize: "14px"}}
//             extensions = {[python(), ls]}
//             theme = 'light'
//             onChange = {(value, viewUpdate) => {
//                 // console.log('value:', value);
//             }}
//         >
//         </CodeMirror>
//     )    
// });


// const CodeEditorComponent = React.memo((props: {recvCodeOutput: RecvCodeOutput}) => {
const CodeEditorComponent = React.memo((props: any) => {
    const [mounted, setMounted] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        setMounted(true);
        socket.emit("ping", "CodeEditorComponent");
        socket.on(CodeRequestOriginator.code_panel, (result: string) => {
            console.log("Got results: ", result, '\n');
            try {
                let codeOutput: Message = JSON.parse(result);                
                if (codeOutput.command_type == 'exec'){
                    props.recvCodeOutput(codeOutput); //TODO: move this to redux
                } else if (codeOutput.command_type == 'eval'){
                    if(codeOutput.error==true){
                        props.recvCodeOutput(codeOutput);
                    } else if (codeOutput.content_type=="<class 'pandas.core.frame.DataFrame'>"){
                        console.log("dispatch tableData");               
                        dispatch(updateTableData(codeOutput.content));
                    } else if (codeOutput.content_type=="<class 'pandas.core.frame.CycDataFrame'>"){
                        console.log("dispatch tableData");               
                        dispatch(updateTableData(codeOutput.content));
                    } else if (codeOutput.content_type=="<class 'plotly.graph_objs._figure.Figure'>"){
                        console.log("dispatch vizData");               
                        dispatch(vizDataUpdate(process_plotly_figure_result(codeOutput.content)));
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

    // const socket = socketIOClient(CODE_SERVER_SOCKET_ENDPOINT);
    
    const _getLineContent = (editor: EditorView) => {
        const anchor = editor.state.selection.ranges[0].anchor;
        const line_count = editor.state.doc.lines;
        const doc = editor.state.doc;
        var current_line_end = doc.line(1).length;
        for(var i=1; i<=line_count; i++){            
            if (anchor<=current_line_end){
                return doc.line(i).text;
            } else {
                // notice that line length does not account for newline character, but anchor does
                // so for each line we need to add 1 newline character to the total length
                current_line_end += doc.line(i+1).length+1;
            }
        }
    }
    
    const runLine = (editor: any) => {
        let content = _getLineContent(editor);
        console.log(`send ${CodeRequestOriginator.code_panel} request: `, content);
        socket.emit(CodeRequestOriginator.code_panel, content);
        return true;
    }

    const runAll = (editor: any) => {
        // let content = editor.getValue();
        // console.log("run: ", content);
        // socket.emit("run", content);
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
                value = "test_df = CycDataFrame('data/exp_data/997/21549286_out.csv')"
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