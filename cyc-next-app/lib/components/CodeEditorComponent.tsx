import React, { forwardRef, RefObject, SyntheticEvent, useEffect, useRef, useState } from "react";
import {RecvCodeOutput, Message, DataTableContent, WebAppEndpoint, ContentType, CommandName} from "./AppInterfaces";

//redux
import { useSelector, useDispatch } from 'react-redux'
import { setTableData } from "../../redux/reducers/dataFrame";
import { update as vizDataUpdate } from "../../redux/reducers/vizDataSlice";

import socket from "./Socket";

// import CodeMirror from '@uiw/react-codemirror';
import { basicSetup } from "@codemirror/basic-setup";
import { bracketMatching } from "@codemirror/matchbrackets";
import { defaultHighlightStyle } from "@codemirror/highlight";
import { oneDark } from "@codemirror/theme-one-dark";
import { python } from '@codemirror/lang-python';
import {keymap, EditorView} from "@codemirror/view"
import { indentUnit } from "@codemirror/language";
import { lineNumbers } from "@codemirror/gutter";
import { CodeEditor, StyledCodeMirror } from "./StyledComponents";
import { languageServer } from "codemirror-languageserver";
// import { extensions } from './codemirror-extentions/extensions';

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

    const _handle_plot_data = (message: {}) => {
        console.log(`${WebAppEndpoint.CodeEditorComponent} got plot data`);
        let content = message.content;
        content['plot'] = JSON.parse(content['plot']);      
        console.log("dispatch plot data");                  
        dispatch(vizDataUpdate(content));     
    }

    useEffect(() => {
        setMounted(true);
        socket.emit("ping", "CodeEditorComponent");
        socket.on(WebAppEndpoint.CodeEditorComponent, (result: string) => {
            console.log("Got results: ", result, '\n');
            try {
                let codeOutput: Message = JSON.parse(result);                
                if (codeOutput.content_type == ContentType.str){
                    props.recvCodeOutput(codeOutput); //TODO: move this to redux
                } else {
                    if(codeOutput.error==true){
                        props.recvCodeOutput(codeOutput);
                    } else if (codeOutput.content_type==ContentType.pandas_dataframe){
                        console.log("dispatch tableData");               
                        dispatch(setTableData(codeOutput.content));
                    } else if (codeOutput.content_type==ContentType.plotly_fig){
                        _handle_plot_data(codeOutput);                        
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

    const _create_message = (content: string) => {
        let message = {};
        message['webapp_endpoint'] = WebAppEndpoint.CodeEditorComponent;
        message['command_name'] = CommandName.code_area_command;
        message['seq_number'] = 1;     
        message['content'] = content;
        return message;
    }

    const _send_message = (content: string) => {
        let message = _create_message(content);
        console.log(`send ${WebAppEndpoint.CodeEditorComponent} message: `, message);
        socket.emit(message.webapp_endpoint, JSON.stringify(message));
    }

    const runLine = (editor: any) => {
        let content = _getLineContent(editor);
        _send_message(content);
        return true;
    }

    const runAll = (editor: any) => {
        // let content = editor.getValue();
        // console.log("run: ", content);
        // socket.emit("run", content);
    }

    const extensions = [
        basicSetup,
        // oneDark,
        EditorView.lineWrapping,
        lineNumbers(),
        bracketMatching(),
        defaultHighlightStyle.fallback,
        python(),
        // ls,
        keymap.of([{key: 'Mod-l', run: runLine}]),
        indentUnit.of('    '),
    ];

    return (
        <CodeEditor>
            {console.log('Render CodeEditorComponent')}
            {/* { mounted ? */}
            <StyledCodeMirror
                ref = {editorRef}
                value = {
`df = CycDataFrame('tests/data/machine-simulation/21549286_out.csv')
df.drop(index=0, inplace=True)

df['copy'] = df['Engine Speed']
df.drop('copy', 1, inplace=True)
df.iloc[10]

df[:30]
df.iloc[4]


df = CycDataFrame('tests/data/housing_data/data.csv')
df.drop('Alley', 1, inplace=True)
df['CopyStreet'] = df['Street']
df[['LotFrontage']] = df[['LotFrontage']].fillna(method="ffill")
df.loc[-1] = df.loc[0]
df[:30]
px.scatter(df, x="LotConfig", y="LandSlope")

import pandas as pd
df = pd.DataFrame()
`}
                height = "700px"
                style = {{fontSize: "14px"}}
                // extensions = {[python(), ls, keymap.of([{key: 'Mod-l', run: runLine}])]}                    
                // extensions = {[python(), keymap.of([{key: 'Mod-l', run: runLine}])]}                    
                extensions = {extensions}
                theme = 'light'                
                // onChange = {(text, viewUpdate) => onChange(text, viewUpdate)}    
                // onChange = {(text, viewUpdate) => onCMChange(text, viewUpdate)}                 
                // onUpdate = {(viewUpdate) => onCMUpdate(viewUpdate)}             
            >
            </StyledCodeMirror> 
            {/* : null } */}
        </CodeEditor>
    )
});

export default CodeEditorComponent;

