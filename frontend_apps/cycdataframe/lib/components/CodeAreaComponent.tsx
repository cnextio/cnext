import React, { forwardRef, RefObject, SyntheticEvent, useEffect, useRef, useState } from "react";
import { CodeEditor } from "./StyledComponents";
import {RecvCodeOutput, CodeOutput, DataTableContent} from "./Interfaces";

//redux
import { useSelector, useDispatch } from 'react-redux'
import { update as tableDataUpdate } from "../../redux/reducers/tableDataSlice";

import {tableData as testTableData} from "./tests/TestTableData";

import socketIOClient from "socket.io-client";
const SOCKET_ENDPOINT = "http://localhost:4000";

const Editor = (props: any) => {
    if (typeof window !== 'undefined') {
        const AceEditor = require('react-ace').default;
        require('ace-builds/src-noconflict/mode-python');
        require('ace-builds/src-noconflict/theme-xcode');

        return <AceEditor {...props}/>
    }
  
    return null;
  };

// const CodeEditorComponent = React.memo((props: {recvCodeOutput: RecvCodeOutput}) => {
const CodeEditorComponent = React.memo((props: any) => {
    const [mounted, setMounted] = useState(false);
    const dispatch = useDispatch()

    useEffect(() => {
        setMounted(true);
        socket.emit("ping");
        socket.on("output", (result: string) => {
            console.log("Got results: ", result, '\n');
            try {
                let codeOutput: CodeOutput = JSON.parse(result);
                //for testing
                // let codeOutput: DataTableContent = JSON.parse(result);
                props.recvCodeOutput(codeOutput);
                // console.log("receive: " + result);
                dispatch(tableDataUpdate(testTableData));
            } catch {

            }
        });
    }, []); //run this only once - not on rerender

    const socket = socketIOClient(SOCKET_ENDPOINT);
    
    const runLine = (editor: any) => {
        let currline = editor.getSelectionRange().start.row;
        let content = editor.session.getLine(currline);
        console.log("run: ", content);
        socket.emit("run", content);
    }

    const runAll = (editor: any) => {
        let content = editor.getValue();
        console.log("run: ", content);
        socket.emit("run", content);
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
            {mounted ?
            <Editor
                placeholder="Placeholder Text"
                mode="python"
                theme="xcode"
                name="CodeEditor"
                // onLoad={this.onLoad}
                onChange={onChange}
                fontSize={14}
                showPrintMargin={false}
                showGutter={true}
                highlightActiveLine={true}
                value={`print("Hello world!")`}
                //for test
                // value={[...new Array(50)]
                //     .map(
                //       () => `print("Hello world! Hello world! Hello world! Hello world! Hello world! Hello world! Hello world!")`,
                //     )
                //     .join('\n')}
                setOptions={{
                    // enableBasicAutocompletion: true,
                    // enableLiveAutocompletion: true,
                    // enableSnippets: true,
                    showLineNumbers: true,
                    tabSize: 2,
                }}
                commands={[{
                    name: 'run line',
                    bindKey: { win: 'Ctrl-enter', mac: 'Cmd-enter' },
                    exec: (editor: any) => runLine(editor),
                }, {
                    name: 'run all',
                    bindKey: { win: 'Ctrl-Shift-enter', mac: 'Cmd-Shift-enter' },
                    exec: (editor: any) => runAll(editor),
                }]}
                width="100%"
                height="100%"
            /> 
            : null}
        </CodeEditor>
    )
});

export default CodeEditorComponent;