import React, { useEffect, useRef, useState } from "react";
import {Message, WebAppEndpoint, ContentType, CommandName} from "../../interfaces/IApp";
import { useSelector, useDispatch } from 'react-redux'
import { setTableData } from "../../../redux/reducers/DataFramesRedux";
import store from '../../../redux/store';
import socket from "../Socket";
import { basicSetup } from "@codemirror/basic-setup";
import { bracketMatching } from "@codemirror/matchbrackets";
import { defaultHighlightStyle } from "@codemirror/highlight";
import { python } from "../../codemirror/grammar/lang-cnext-python";
import {keymap, EditorView, ViewUpdate, DecorationSet, Decoration} from "@codemirror/view"
import { indentUnit } from "@codemirror/language";
import { lineNumbers, gutter, GutterMarker } from "@codemirror/gutter";
import { StyledCodeEditor, StyledCodeMirror } from "../StyledComponents";
// import { languageServer } from "../../codemirror/codemirror-languageserver";
import { languageServer } from "../../codemirror/autocomplete-lsp/index.js";
import { addPlotResult, updateLines, setLineStatus, setActiveLine, setLineGroupStatus, setRunQueue as setReduxRunQueue, compeleteRunLine } from "../../../redux/reducers/CodeEditorRedux";
import { ICodeLineStatus as ILineStatus, ICodeResultMessage, ILineUpdate, ILineContent, LineStatus, ICodeLineStatus, ICodeLine, ICodeLineGroupStatus, SetLineGroupCommand, RunQueueStatus, ILineRange, ICodeActiveLine } from "../../interfaces/ICodeEditor";
import { EditorState, StateEffect, StateField, Transaction, TransactionSpec } from "@codemirror/state";
// import { extensions } from './codemirror-extentions/extensions';
import { ReactCodeMirrorRef, useCodeMirror } from '@uiw/react-codemirror';
import { CodeGenResult, CodeGenStatus, IInsertLinesInfo, IMagicInfo, LINE_SEP, MagicPlotData, MAGIC_STARTER } from "../../interfaces/IMagic";
import { magicsGetPlotCommand } from "../../cnext-magics/magic-plot-gen";
import { CNextPlotKeyword, CNextDataFrameExpresion, CNextPlotExpression, CNextPlotXDimExpression, CNextPlotYDimExpression, CNextXDimColumnNameExpression, CNextYDimColumnNameExpression } from "../../codemirror/grammar/cnext-python.terms";
import { ifElse } from "../libs";
import { setFileToSave } from "../../../redux/reducers/ProjectManagerRedux";

const ls = languageServer({
    serverUri: "ws://localhost:3001/python",
    rootUri: 'file:///',
    documentUri: 'file:///',
    languageId: 'python'
});

/** Implement line status gutter */
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

function getCodeLineRedux(state) {
    let inViewID = state.projectManager.inViewID;
    if (inViewID) {
        return ifElse(state.codeEditor.codeLines, inViewID, null);
    }
    return null;
}

const editStatusGutter = gutter({
    lineMarker(view, line) {
        let inViewID = store.getState().projectManager.inViewID;
        if (inViewID) {
            let lines = getCodeLineRedux(store.getState());
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
        }
        return null;
    },
    initialSpacer: () => executedMarker
});

function getLineRangeOfGroup(lineNumber: number): ILineRange {
    const inViewID = store.getState().projectManager.inViewID;
    if(inViewID) {
        const codeLines = store.getState().codeEditor.codeLines[inViewID];
        let groupID = codeLines[lineNumber].groupID;
        let fromLine = lineNumber;
        let toLine = lineNumber;
        if (groupID === undefined){
            toLine = fromLine+1;
        } else {
            while(codeLines[fromLine-1].groupID && codeLines[fromLine-1].groupID === groupID){
                fromLine -= 1;
            }
            while(codeLines[toLine].groupID && codeLines[toLine].groupID === groupID){
                toLine += 1;
            }
        }        
        return {fromLine: fromLine, toLine: toLine};
    }
}    

function setRunQueue(editorView: EditorView): boolean {
    const executorID = store.getState().projectManager.executorID;
    let inViewID = store.getState().projectManager.inViewID;
    if (inViewID === executorID){
        const doc = editorView.state.doc;
        const state = editorView.state;
        const anchor = state.selection.ranges[0].anchor;
        let lineAtAnchor = doc.lineAt(anchor);
        let text: string = lineAtAnchor.text;   
        let lineNumberAtAnchor = lineAtAnchor.number - 1;     
        /** convert to 0-based which is used internally */
        let fromLine = doc.lineAt(anchor).number-1;
        let lineRange: ILineRange|undefined;
        let inViewId = store.getState().projectManager.inViewID;

        if(inViewId) {
            if(text.startsWith(MAGIC_STARTER)){
                /** Get line range of group starting from next line */
                let codeEditorReduxLines: ICodeLine[] = getCodeLineRedux(store.getState());            
                /** this if condition is looking at the next line*/
                if (codeEditorReduxLines[lineNumberAtAnchor+1].generated){
                    lineRange = getLineRangeOfGroup(lineNumberAtAnchor+1);
                }
            } else {
                /** Get line range of group starting from the current line */
                /** convert to 0-based */
                lineRange = getLineRangeOfGroup(lineNumberAtAnchor);
            }

            if (lineRange){
                console.log('CodeEditor setRunQueue: ', lineRange);
                store.dispatch(setReduxRunQueue(lineRange));
            }
        }    
    } else {
        console.log("CodeEditor can't execute code on none executor file!")
    }   
    return true;
}

const extensions = [
    basicSetup,
    // oneDark,
    EditorView.lineWrapping,
    lineNumbers(),
    editStatusGutter,
    bracketMatching(),
    defaultHighlightStyle.fallback,
    python(),
    ls,
    // keymap.of([{key: 'Mod-l', run: runLine}]),
    keymap.of([{key: 'Mod-l', run: setRunQueue}]),
    indentUnit.of('    '),
];

const getCodeText = () => {
    let state = store.getState();
    let inViewID = state.projectManager.inViewID;    
    console.log('CodeEditor CodeMirror inViewID', inViewID);
    if (inViewID) {        
        let codeText = ifElse(state.codeEditor.codeText, inViewID, null);        
        console.log('CodeEditor CodeMirror codeText', codeText);
        if (codeText)
            return codeText.join('\n');
    }
    return undefined;
}



const parseMagicText = (cursor, text) => {
    let plotData: MagicPlotData = {
        magicTextRange: {from: cursor.from, to: cursor.to},
        df: null,
        x: null,
        y: null
    };              
    // let endPlotPos = cursor.to;  
    plotData.magicTextRange = {from: cursor.from, to: cursor.to};                      
    // while(cursor.to <= endPlotPos){
    cursor.next();
    if(cursor.type.id === CNextPlotKeyword){
        cursor.nextSibling(); //skip CNextPlotKeyword
    }
    // console.log(cursor.name);
    if (cursor.type.id == CNextDataFrameExpresion){
        // console.log('DF: ', text.substring(cursor.from, cursor.to));
        plotData.df = text.substring(cursor.from, cursor.to);
        cursor.nextSibling();
        // console.log(cursor.name);
    } 
    if (cursor.type.id === CNextPlotYDimExpression){
        let endYDim = cursor.to;
        plotData.y = []
        while((cursor.to <= endYDim) && cursor){
            if(cursor.type.id === CNextYDimColumnNameExpression){
                // console.log('Y dim: ', text.substring(cursor.from, cursor.to));
                // remove quotes
                plotData.y.push(text.substring(cursor.from+1, cursor.to-1));
            }       
            cursor.next();     
            // console.log(cursor.name);       
        }         
        cursor.nextSibling(); //skip CNextPlotAddDimKeyword
        // console.log(cursor.name);
        if (cursor.type.id === CNextPlotXDimExpression){
            let endXDim = cursor.to;
            plotData.x = []
            while((cursor.to <= endXDim) && cursor){                                        
                if(cursor.type.id === CNextXDimColumnNameExpression){
                    // console.log('X dim: ', text.substring(cursor.from, cursor.to));
                    // remove quotes
                    plotData.x.push(text.substring(cursor.from+1, cursor.to-1));
                }
                cursor.next();                  
                // console.log(cursor.name);
            }         
        }
    }
    return plotData; 
}

const magicsPreProcess = () => {
    if(view){
        let state = view.state;
        let inViewID = store.getState().projectManager.inViewID;
        if(state && inViewID){
            let tree = state.tree;
            let curPos = state.selection.ranges[0].anchor;             
            let cursor = tree.cursor(curPos, 0);                    
                                
            if ([CNextDataFrameExpresion, CNextXDimColumnNameExpression, CNextYDimColumnNameExpression]
                .includes(cursor.type.id)){
                /** 
                 * Move the cursor up to CNextPlotExpression so we can parse the whole cnext text and
                 * generate the new inline plot command 
                 * */
                cursor.parent();
                cursor.parent();
            }
            console.log('CodeEditor Magics magicsPreProcess: ', cursor.toString());
            if (cursor.type.id === CNextPlotExpression) {                        
                let text: string = state.doc.toString();
                let newMagicText: string = text.substring(cursor.from, cursor.to);                         
                let generatedLine = view.state.doc.lineAt(cursor.to);
                // console.log('CodeEditor Magics current magicInfo: ', magicInfo);
                /** 
                 * Check the status here to avoid circular update because this code will generate
                 * new content added to the editor, which will trigger onCMChange -> _handleMagic. 
                 * Note: if magicInfo status is CodeGenStatus.INSERTED, we also reset the magicInfo content
                 * */                       
                if (magicInfo === undefined || (magicInfo && magicInfo.status === CodeGenStatus.INSERTED)) {            
                    let plotData = parseMagicText(cursor, text);
                    let magicInfo: IMagicInfo = {
                        status: CodeGenStatus.INSERTING, 
                        magicText: newMagicText, 
                        plotData: plotData, 
                        line: generatedLine,
                        /** generatedLine.number in state.doc is 1 based, so convert to 0 base */ 
                        lineInfo: {
                            fromLine: generatedLine.number-1, 
                            fromPos: generatedLine.from,
                            toLine: generatedLine.number, /** this will need to be replaced when the code is generated */
                        }
                    };
                    setMagicInfo(magicInfo);
                    console.log('CodeEditor Magics inserting magicInfo: ', magicInfo);                                              
                } else if (magicInfo && magicInfo.status === CodeGenStatus.INSERTING && magicInfo.line && magicInfo.lineInfo) {
                    /** The second time _handleMagic being called is after new code has been inserted */
                    /** convert line number to 0-based */
                    let lineStatus: ICodeLineGroupStatus = {
                        inViewID: inViewID,
                        fromLine: magicInfo.lineInfo.fromLine, 
                        toLine: magicInfo.lineInfo.toLine, 
                        status: LineStatus.EDITED, 
                        generated: true,
                        setGroup: SetLineGroupCommand.NEW,
                    };                        
                    dispatch(setLineGroupStatus(lineStatus));
                    // console.log('Magics after inserted lineStatus: ', lineStatus);
                    magicInfo.status = CodeGenStatus.INSERTED;
                    setMagicInfo({...magicInfo});           
                    console.log('CodeEditor Magics after inserted magicInfo: ', magicInfo);                
                }                    
            } 
        }
    }      
} 

function onCodeMirrorChange(value: string, viewUpdate: ViewUpdate){
    try{
        let doc = viewUpdate.state.doc;    
        let inViewID = store.getState().projectManager.inViewID;
        let serverSynced = store.getState().projectManager.serverSynced;
        // console.log('CodeEditor onCodeMirrorChange', );
        viewUpdate.changes.iterChanges(
            (fromA, toA, fromB, toB, inserted) => {console.log('CodeEditor onCodeMirrorChange', fromA, toA, fromB, toB)});
        if (serverSynced && inViewID){                
            // let startText = viewUpdate.startState.doc.text;
            // let text = viewUpdate.state.doc.text;
            let startDoc = viewUpdate.startState.doc;
            // let doc = viewUpdate.state.doc
            let text: string[] = doc.toJSON();
            // let startLineLength = (typeof startDoc == TextLeaf ? startDoc.text.length : startDoc.lines)
            let updatedLineCount = doc.lines - startDoc.lines;                
            let changeStartLine;
            //currently handle only one change
            viewUpdate.changes.iterChanges(
                (fromA, toA, fromB, toB, inserted) => {changeStartLine = doc.lineAt(fromA)});
            // convert the line number 0-based index, which is what we use internally
            let changeStartLineNumber = changeStartLine.number-1;          
            // console.log(changes); 
            // console.log('changeStartLineNumber', changeStartLineNumber);
            let updatedLineInfo: ILineUpdate = {
                inViewID: inViewID,
                text: text, 
                updatedStartLineNumber: changeStartLineNumber, 
                updatedLineCount: updatedLineCount};
            if (updatedLineCount>0){                
                // Note 1: _getCurrentLineNumber returns line number indexed starting from 1.
                // Convert it to 0-indexed by -1.
                // Note 2: the lines being added are lines above currentLine.
                // If there is new text in the current line then current line is `edited` not `added`                
                store.dispatch(updateLines(updatedLineInfo));
                store.dispatch(setFileToSave(inViewID));
            } else if (updatedLineCount<0){               
                // Note 1: _getCurrentLineNumber returns line number indexed starting from 1.
                // Convert it to 0-indexed by -1. 
                // Note 2: the lines being deleted are lines above currentLine.
                // If there is new text in the current line then current line is `edited`                            
                store.dispatch(updateLines(updatedLineInfo));
                store.dispatch(setFileToSave(inViewID));
            } else {
                let lineStatus: ICodeLineStatus;
                lineStatus = {
                    inViewID: inViewID,
                    text: text, 
                    lineNumber: changeStartLineNumber, 
                    status: LineStatus.EDITED, 
                    generated: false };                    
                store.dispatch(setLineStatus(lineStatus));
                store.dispatch(setFileToSave(inViewID));
            }
            
            // magicsPreProcess();
        }
    } catch(error) {
        throw(error);
    }
}

export {extensions, onCodeMirrorChange, getCodeText};