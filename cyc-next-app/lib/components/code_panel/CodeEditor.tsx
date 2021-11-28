import React, { forwardRef, RefObject, SyntheticEvent, useEffect, useRef, useState } from "react";
import ReactDOM from 'react-dom';
import {RecvCodeOutput, Message, DataTableContent, WebAppEndpoint, ContentType, CommandName} from "../AppInterfaces";

//redux
import { useSelector, useDispatch } from 'react-redux'
import { setTableData } from "../../../redux/reducers/DataFramesRedux";
import { update as vizDataUpdate } from "../../../redux/reducers/vizDataSlice";
import shortid from "shortid";
import store from '../../../redux/store';

import socket from "../Socket";

// import CodeMirror from '@uiw/react-codemirror';
import { basicSetup } from "@codemirror/basic-setup";
import { bracketMatching } from "@codemirror/matchbrackets";
import { defaultHighlightStyle } from "@codemirror/highlight";
import { oneDark } from "@codemirror/theme-one-dark";
import { python } from '@codemirror/lang-python';
import {keymap, EditorView, ViewUpdate} from "@codemirror/view"
import { indentUnit } from "@codemirror/language";
import { lineNumbers, gutter, GutterMarker } from "@codemirror/gutter";
import { CodeEditMarker, CodeEditor, StyledCodeMirror } from "../StyledComponents";
import { languageServer } from "codemirror-languageserver";
import { addPlotResult, initCodeDoc, updateLines, setLineStatus, setActiveLine } from "../../../redux/reducers/CodeEditorRedux";
import { ICodeLineStatus as ILineStatus, ICodeResultMessage, ILineUpdate, ILineContent, LineStatus, MessageMetaData, ICodeLineStatus } from "../../interfaces/ICodeEditor";
import { Transaction } from "@codemirror/state";
import { keyframes } from "styled-components";
// import { extensions } from './codemirror-extentions/extensions';

const ls = languageServer({
    serverUri: "ws://localhost:3001/python",
    rootUri: 'file:///',
    documentUri: 'file:///',
    languageId: 'python'
});
  
// const CodeEditorComponent = React.memo((props: {recvCodeOutput: RecvCodeOutput}) => {
const CodeEditorComponent = React.memo((props: any) => {
    const [init, setInit] = useState(false);
    const codeLines = useSelector(state => state.codeDoc.codeLines);
    const dispatch = useDispatch();
    const editorRef = useRef();

    // const _handlePlotData = (message: {}) => {
    //     console.log(`${WebAppEndpoint.CodeEditor} got plot data`);
    //     let content = message.content;
    //     content['plot'] = JSON.parse(content['plot']);      
    //     console.log("dispatch plot data");                  
    //     dispatch(vizDataUpdate(content));     
    // }

    const _handlePlotData = (message: Message) => {
        console.log(`${WebAppEndpoint.CodeEditor} got plot data`);
        let result: ICodeResultMessage = {
            content: message.content, 
            type: message.content_type,
            metadata: message.metadata
        };

        // content['plot'] = JSON.parse(content['plot']);      
        console.log("dispatch plot data");                  
        dispatch(addPlotResult(result));     
    }

    useEffect(() => {
        // setMounted(true);
        socket.emit("ping", "CodeEditorComponent");
        socket.on(WebAppEndpoint.CodeEditor, (result: string) => {
            // console.log("Got results: ", result, '\n');
            console.log("CodeEditor got results...");
            try {
                let codeOutput: Message = JSON.parse(result);                
                if (codeOutput.content_type == ContentType.STRING){
                    props.recvCodeOutput(codeOutput); //TODO: move this to redux
                } else {
                    if(codeOutput.error==true){
                        props.recvCodeOutput(codeOutput);
                    } else if (codeOutput.content_type==ContentType.PANDAS_DATAFRAME){
                        console.log("dispatch tableData");               
                        dispatch(setTableData(codeOutput.content));
                    } else if (codeOutput.content_type==ContentType.PLOTLY_FIG){
                        // _handlePlotData(codeOutput); 
                        _handlePlotData(codeOutput);                       
                    }
                    else {  
                        console.log("dispatch text output:", codeOutput);                        
                        props.recvCodeOutput(codeOutput);
                    }
                }
                let lineStatus: ILineStatus = {lineNumber: codeOutput.metadata.line_number, status: LineStatus.EXECUTED};
                dispatch(setLineStatus(lineStatus));
                //for testing
                // let codeOutput: DataTableContent = JSON.parse(result);
                // dispatch(tableDataUpdate(testTableData)
            } catch {

            }
        });
        // editorRef;
    }, []); //run this only once - not on rerender


    // const socket = socketIOClient(CODE_SERVER_SOCKET_ENDPOINT);
    
    /**
     * Important: the line number in the result will be 0-based indexed instead of 1-based index
     * @param editorView 
     * @returns 
     */
    function _getLineContent(editorView: EditorView): ILineContent {
        const doc = editorView.state.doc;
        const state = editorView.state;
        const anchor = state.selection.ranges[0].anchor;
        const currentLine = doc.lineAt(anchor)
        const text: string = currentLine.text;
        console.log('Current line: ', text);
        // convert the line number 0-based index, which is what we use internally
        let result: ILineContent = {lineNumber: currentLine.number-1, content: text}; 
        return result;
    }

    
    /**
     * (Note: need to implement this to get the current line number. could not find a better way)
     * @param editorState 
     * @returns The line number of the current line in code doc. This number is indexed started with **1**.
     * This is how CodeMirror uses internally.
     */
    // function _getCurrentLineNumber(editorState: EditorState): number{
    //     const anchor = editorState.selection.ranges[0].anchor;
    //     const line_count = editorState.doc.lines;
    //     const doc = editorState.doc;
    //     //the line in CodeMirror is indexed starting with 1
    //     var current_line_end = doc.line(1).length;
    //     for(var i=1; i<=line_count; i++){            
    //         if (anchor<=current_line_end){
    //             return i;
    //         } else {
    //             // notice that line length does not account for newline character, but anchor does
    //             // so for each line we need to add 1 newline character to the total length
    //             current_line_end += doc.line(i+1).length+1;
    //         }
    //     }
    //     // FIXME: the code will never reach here but need to return a number so TypeScript is happy
    //     // check on this later
    //     return -1;
    // }

    // function _getLineNumberAt(pos: number): number{
    //     const anchor = editorState.selection.ranges[0].anchor;
    //     const line_count = editorState.doc.lines;
    //     const doc = editorState.doc;
    //     //the line in CodeMirror is indexed starting with 1
    //     var current_line_end = doc.line(1).length;
    //     for(var i=1; i<=line_count; i++){            
    //         if (anchor<=current_line_end){
    //             return i;
    //         } else {
    //             // notice that line length does not account for newline character, but anchor does
    //             // so for each line we need to add 1 newline character to the total length
    //             current_line_end += doc.line(i+1).length+1;
    //         }
    //     }
    //     // FIXME: the code will never reach here but need to return a number so TypeScript is happy
    //     // check on this later
    //     return -1;
    // }

    function _create_message(content: ILineContent) {
        let message: Message = {
            webapp_endpoint: WebAppEndpoint.CodeEditor,
            command_name: CommandName.code_area_command,
            seq_number: 1,
            content: content.content,
            content_type: ContentType.STRING,
            error: false,
            metadata: {line_number: content.lineNumber}
        };
        
        return message;
    }

    function _send_message(content: ILineContent) {
        let message = _create_message(content);
        console.log(`send ${WebAppEndpoint.CodeEditor} message: `, message);
        socket.emit(message.webapp_endpoint, JSON.stringify(message));
    }

    function runLine(editorView: EditorView) {
        let content: ILineContent = _getLineContent(editorView);
        _send_message(content);
        let lineStatus: ILineStatus = {lineNumber: content.lineNumber, status: LineStatus.EXECUTING};
        dispatch(setLineStatus(lineStatus));
        return true;
    }

    function runAll(editor: any) {
        // let content = editor.getValue();
        // console.log("run: ", content);
        // socket.emit("run", content);
    }

    function onMouseDown(event){
        //Note: can't use editorRef.current.state.doc, this one is useless, did not update with the doc.
        let doc = editorRef.current.view.viewState.state.doc;
        let pos = editorRef.current.view.posAtDOM(event.target);
        // console.log(doc, pos, lineNumber);
        //convert to 0-based
        let lineNumber = doc.lineAt(pos).number-1;        
        dispatch(setActiveLine(lineNumber));        
    }

    useEffect(() => {
        if (editorRef.current && editorRef.current.editor){
            editorRef.current.editor.onmousedown = onMouseDown;
        }
    });

    useEffect(() => {
        if(editorRef.current.view){
            // this will force the CodeMirror to refresh when codeLines update. Need this to make the gutter update 
            // with line status. This works but might need to find a better performant solution.
            editorRef.current.view.dispatch();
        }
    }, [codeLines]);
    
    /**
     * This function will be called first when the codemirror started in which we will init the redux state.
     * Can't init in useEffect because somehow it is not being called.
     * @param value 
     * @param viewUpdate 
     */
    function onCMChange(value: string, viewUpdate: ViewUpdate){
        try{
            // const cmState = editorRef.current.state;
            let doc = viewUpdate.state.doc;
            // let text = viewUpdate.state.doc.text;
            // ReactDOM.render(<CodeEditMarker/>, document.getElementById('statusDiv'));        
            if (!init){
                // let text = viewUpdate.state.doc.text;
                if (doc){
                    dispatch(initCodeDoc({text: doc.text}));
                }
                setInit(true);            
            } else {
                // let startText = viewUpdate.startState.doc.text;
                // let text = viewUpdate.state.doc.text;
                let startDoc = viewUpdate.startState.doc;
                let doc = viewUpdate.state.doc
                let text: string[] = doc.toJSON();
                // let startLineLength = (typeof startDoc == TextLeaf ? startDoc.text.length : startDoc.lines)
                let updatedLineCount = doc.lines - startDoc.lines;
                let changes = viewUpdate.changes.toJSON();
                let changeStartLine = doc.lineAt(changes[0]);
                // convert the line number 0-based index, which is what we use internally
                let changeStartLineNumber = changeStartLine.number-1;          
                // console.log(changes); 
                // console.log('changeStartLineNumber', changeStartLineNumber);
                let updatedLineInfo: ILineUpdate = {text: text, updatedStartLineNumber: changeStartLineNumber, updatedLineCount: updatedLineCount};
                if (updatedLineCount>0){                
                    // Note 1: _getCurrentLineNumber returns line number indexed starting from 1.
                    // Convert it to 0-indexed by -1.
                    // Note 2: the lines being added are lines above currentLine.
                    // If there is new text in the current line then current line is `edited` not `added`                
                    dispatch(updateLines(updatedLineInfo));
                } else if (updatedLineCount<0){               
                    // Note 1: _getCurrentLineNumber returns line number indexed starting from 1.
                    // Convert it to 0-indexed by -1. 
                    // Note 2: the lines being deleted are lines above currentLine.
                    // If there is new text in the current line then current line is `edited`                            
                    dispatch(updateLines(updatedLineInfo));
                } else {
                    let lineStatus: ICodeLineStatus = {lineNumber: changeStartLineNumber, status: LineStatus.EDITED};
                    dispatch(setLineStatus(lineStatus));
                }
            }
        } catch(error) {
            throw(error);
        }
    }

    /**
     * Implement line status gutter
     */

     function codeExecutingTransition() {
        return keyframes`
          50% {
            background-color: #42a5f5;
          }
        `;
    }

    const markerDiv = () => {
        let statusDiv = document.createElement('div');
        statusDiv.style.width = '2px';
        statusDiv.style.height = '100%';        
        return statusDiv;
    }

    const executedColor = '#42a5f5';
    const editedMarker = new class extends GutterMarker {
        toDOM() { 
            return markerDiv();
        }
    }

    const executingMarker = new class extends GutterMarker {
        toDOM() { 
            let statusDiv = markerDiv();
            statusDiv.animate([
                {backgroundColor: ''},
                {backgroundColor: executedColor, offset: 0.5}], 
                {duration: 2000, iterations: Infinity});
            return statusDiv;
        }
    }
    
    const executedMarker = new class extends GutterMarker {
        toDOM() { 
            let statusDiv = markerDiv();
            statusDiv.style.backgroundColor = executedColor;
            return statusDiv;
        }
    }

    // This function should only be called after `codeLines` has been updated. However because this is controlled by CodeMirror 
    // intenal, we can't dictate when it will be called. To cope with this, we have to check the object existence carefully
    // and rely on useEffect to force this to be called again when `codeLines` updated
    const editStatusGutter = gutter({
        lineMarker(view, line) {
            let lines = store.getState().codeDoc.codeLines;
            // line.number in state.doc is 1 based, so convert to 0 base
            let lineNumber = view.state.doc.lineAt(line.from).number-1;
            // console.log(lines.length);
            if(lines && lineNumber<lines.length){                                
                switch(lines[lineNumber].status){
                    case LineStatus.EDITED: return editedMarker;
                    case LineStatus.EXECUTING: return executingMarker;
                    case LineStatus.EXECUTED: return executedMarker;
                }
            }
            return null;
        },
        initialSpacer: () => executedMarker
    })
    /** */  

    const extensions = [
        basicSetup,
        // oneDark,
        EditorView.lineWrapping,
        lineNumbers(),
        editStatusGutter,
        // emptyLineGutter
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

import plotly.express as px
import pandas as pd
df = pd.DataFrame()

df.drop('Alley', 1, inplace=True)
df['CopyStreet'] = df['Street']
df[['LotFrontage']] = df[['LotFrontage']].fillna(method="ffill")
df.loc[-1] = df.loc[0]
df[:30]
px.scatter(df, x="YearBuilt", y="LotArea")

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
                onChange = {onCMChange}
            >
            </StyledCodeMirror> 
        </CodeEditor>
    )
});

export default CodeEditorComponent;



