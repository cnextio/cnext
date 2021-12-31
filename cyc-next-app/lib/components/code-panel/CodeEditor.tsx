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
import { ICodeResultMessage, ILineUpdate, ILineContent, LineStatus, ICodeLineStatus, ICodeLine, ICodeLineGroupStatus, SetLineGroupCommand, RunQueueStatus, ILineRange, ICodeActiveLine } from "../../interfaces/ICodeEditor";
import { EditorState, StateEffect, Transaction, TransactionSpec } from "@codemirror/state";
// import { extensions } from './codemirror-extentions/extensions';
import { useCodeMirror } from '@uiw/react-codemirror';
import { CodeGenResult, CodeGenStatus, IInsertLinesInfo, IMagicInfo, LINE_SEP, MagicPlotData, MAGIC_STARTER } from "../../interfaces/IMagic";
import { magicsGetPlotCommand } from "../../cnext-magics/magic-plot-gen";
import { CNextPlotKeyword, CNextDataFrameExpresion, CNextPlotExpression, CNextPlotXDimExpression, CNextPlotYDimExpression, CNextXDimColumnNameExpression, CNextYDimColumnNameExpression } from "../../codemirror/grammar/cnext-python.terms";
import { ifElse } from "../libs";
import { setFileToSave, setScrollPos } from "../../../redux/reducers/ProjectManagerRedux";
import { editStatusGutter, getCodeLine, getCodeText, getLineContent, getLineRangeOfGroup, getNonGeneratedLinesInRange, isPromise, resetEditorState, scrollToPrevPos, setFlashingEffect, setGenLineDeco, setGroupedLineDeco, setHTMLEventHandler, setViewCodeText } from "./libCodeEditor";

const ls = languageServer({
    serverUri: "ws://localhost:3001/python",
    rootUri: 'file:///',
    documentUri: 'file:///',
    languageId: 'python'
});
  
const CodeEditor = ({id, recvCodeOutput}) => {
// const CodeEditor = (props: any) => {
    /** This state is used to indicate server sync status. Code doc need to be resynced only 
     * when it is first opened or being selected to be in view */
    // const [serverSynced, setServerSynced] = useState(false);
    const serverSynced = useSelector(state => state.projectManager.serverSynced);
    const inViewID = useSelector(state => state.projectManager.inViewID);
    const codeLines: ICodeLine[]|null = useSelector(state => getCodeLine(state));
    // const codeText: string[] = useSelector(state => getCodeTextRedux(state));    
    const runQueue = useSelector(state => state.codeEditor.runQueue);
    const dispatch = useDispatch();
    const editorRef = useRef();
    const [magicInfo, setMagicInfo] = useState<IMagicInfo|undefined>();
    /** this state is used to indicate when the codemirror view needs to be loaded from internal source
     * i.e. from codeText */
    const [codeReloading, setCodeReloading] = useState<boolean>(true);
    
    const extensions = [
        basicSetup,
        // oneDark,
        // EditorView.lineWrapping,
        lineNumbers(),
        editStatusGutter(
            store.getState().projectManager.inViewID, 
            getCodeLine(store.getState())
        ),
        bracketMatching(),
        defaultHighlightStyle.fallback,
        python(),
        ls,
        // keymap.of([{key: 'Mod-l', run: runLine}]),
        keymap.of([
            {key: 'Mod-l', run: setRunQueue},
            {key: 'Mod-k', run: setGroup},
            {key: 'Mod-j', run: setUnGroup}]),
        indentUnit.of('    '),
    ];

    const { view, container, setContainer } = useCodeMirror({
        container: editorRef.current,
        extensions: extensions,
        height: "100%",
        theme: 'light',
        onChange: onCodeMirrorChange,     
    });

    const handlePlotData = (message: Message) => {
        console.log(`${WebAppEndpoint.CodeEditor} got plot data`);
        let inViewID = store.getState().projectManager.inViewID;
        if (inViewID) {
            let result: ICodeResultMessage = {
                inViewID: inViewID,
                content: message.content, 
                type: message.content_type,
                metadata: message.metadata
            };

            // content['plot'] = JSON.parse(content['plot']);      
            console.log("dispatch plot data");                  
            dispatch(addPlotResult(result));     
        }
    }

    /**
     * Init component socket connection. This should be run only once on the first mount.
     */
    function _socketInit(){
        socket.emit("ping", WebAppEndpoint.CodeEditor);
        socket.on(WebAppEndpoint.CodeEditor, (result: string) => {
            console.log("Got results: ", result, '\n');
            // console.log("CodeEditor got results...");
            try {
                let codeOutput: Message = JSON.parse(result);   
                let inViewID = store.getState().projectManager.inViewID;
                if (inViewID) {
                    if ((codeOutput.content_type===ContentType.STRING) || (codeOutput.error===true)){
                        recvCodeOutput(codeOutput); //TODO: move this to redux
                    } else {
                        if (codeOutput.content_type==ContentType.PANDAS_DATAFRAME){
                            console.log("dispatch tableData");               
                            dispatch(setTableData(codeOutput.content));
                        } else if (codeOutput.content_type==ContentType.PLOTLY_FIG){
                            // _handlePlotData(codeOutput); 
                            handlePlotData(codeOutput);                       
                        }
                        else {  
                            console.log("dispatch text output:", codeOutput);                        
                            recvCodeOutput(codeOutput);
                        }
                    }
                    let lineStatus: ICodeLineStatus = {
                        inViewID: inViewID,
                        lineNumber: codeOutput.metadata.line_number, 
                        status: LineStatus.EXECUTED};
                    // console.log('CodeEditor socket ', lineStatus);
                    dispatch(setLineStatus(lineStatus));
                    /** set active code line to be the current line after it is excuted so the result will be show accordlingly
                     * not sure if this is a good design but will live with it for now */ 
                    let activeLine: ICodeActiveLine = {
                        inViewID: inViewID,
                        lineNumber: codeOutput.metadata.line_number
                    }
                    dispatch(setActiveLine(activeLine)); 
                    dispatch(compeleteRunLine(null));
                }    
            } catch {

            }
        });
    }
    useEffect(() => {
        _socketInit();
    }, []); 

    /**
     * FIXME: This is used to set onmousedown event handler. This does not seem to be the best way. 
     * Also set the SOLID effect for generated lines
     * */
    
    useEffect(() => { 
        console.log('CodeEditor useEffect container', container);                  
        setHTMLEventHandler(container, view, dispatch);                   
    }, [container]);
    
    /**
     * Reset the code editor state when the doc is selected to be in view
     * */
    useEffect(() => {
        console.log('CodeEditor useEffect inViewID ', inViewID);   
        if(inViewID){
            resetEditorState(view, extensions);
            setCodeReloading(true);
        }            
    }, [inViewID]);

    /**
     * Init CodeEditor value with content load from the file
     * Also scroll the file to the previous position
     */    
    useEffect(() => {
        console.log('CodeEditor useEffect serverSynced, mustReload, view', serverSynced, codeReloading, view);    
        // console.log('CodeEditor useEffect codeText', view, codeText[0], serverSynced);
        if (serverSynced && codeReloading && view){      
            setViewCodeText(store.getState(), view);
            setCodeReloading(false);
            scrollToPrevPos(store.getState());
        }        
    }, [serverSynced, codeReloading, view]);

    useEffect(() => {
        try {
            //TODO: improve this            
            setGroupedLineDeco(store.getState(), view);
            setGenLineDeco(store.getState(), view);
            console.log('CodeEditor useEffect setGenCodeLineDeco');
        } catch {
               
        }        
    })
    
    useEffect(()=>{
        execLine()
    },[runQueue])
    /** */
    
    /** this will force the CodeMirror to refresh when codeLines update. Need this to make the gutter update 
     * with line status. This works but might need to find a better performant solution. */ 
    useEffect(() => {
        console.log('CodeEditor useEffect codeLines', codeLines!==null);                 
        if(view){            
            view.dispatch();
        }         
    }, [codeLines]);

    useEffect(() => {
        console.log('CodeEditor useEffect magicInfo ', magicInfo);
        processMagicInfo();
    }, [magicInfo])
    
    useEffect(() => {
        console.log('CodeEditor useEffect editorRef.current ', editorRef.current);
        if (editorRef.current) {
            setContainer(editorRef.current);
        }
    }, [editorRef.current]);

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
        console.log(`${message.webapp_endpoint} send message: `, message);
        socket.emit(message.webapp_endpoint, JSON.stringify(message));
    }

    function setRunQueue(): boolean {
        const executorID = store.getState().projectManager.executorID;
        let inViewID = store.getState().projectManager.inViewID;
        if (view && inViewID === executorID){
            const doc = view.state.doc;
            const state = view.state;
            const anchor = state.selection.ranges[0].anchor;
            let lineAtAnchor = doc.lineAt(anchor);
            let text: string = lineAtAnchor.text;   
            let lineNumberAtAnchor = lineAtAnchor.number - 1;     
            /** convert to 0-based which is used internally */
            let fromLine = doc.lineAt(anchor).number-1;
            let lineRange: ILineRange|undefined;
            let inViewId = store.getState().projectManager.inViewID;

            if(inViewId) {
                let codeLines: ICodeLine[]|null = getCodeLine(store.getState());            
                if(text.startsWith(MAGIC_STARTER)){
                    /** Get line range of group starting from next line */                    
                    /** this if condition is looking at the next line*/
                    if (codeLines && codeLines[lineNumberAtAnchor+1].generated){
                        lineRange = getLineRangeOfGroup(codeLines, lineNumberAtAnchor+1);
                    }
                } else {
                    /** Get line range of group starting from the current line */
                    /** convert to 0-based */
                    if (codeLines)
                        lineRange = getLineRangeOfGroup(codeLines, lineNumberAtAnchor);
                }

                if (lineRange){
                    console.log('CodeEditor setRunQueue: ', lineRange);
                    dispatch(setReduxRunQueue(lineRange));
                }
            }    
        } else {
            console.log("CodeEditor can't execute code on none executor file!")
        }   
        return true;
    }

    const execLine = () => {
        if(runQueue.status === RunQueueStatus.RUNNING){
            let text: string|undefined = getLineContent(view, runQueue.runningLine);
            let inViewID = store.getState().projectManager.inViewID;
            if(text && inViewID){
                console.log('CodeEditor execLine: ', runQueue.runningLine);
                let content: ILineContent = {lineNumber: runQueue.runningLine, content: text};
                _send_message(content);
                let lineStatus: ICodeLineStatus = {
                    inViewID: inViewID, 
                    lineNumber: content.lineNumber, 
                    status: LineStatus.EXECUTING};
                dispatch(setLineStatus(lineStatus));
            }
        }
    }
    
    /**
     * Do not allow grouping involed generated lines
     */
    function setGroup(): boolean {
        if(view){
            let range = view.state.selection.asSingle().ranges[0];
            let lineRange = getNonGeneratedLinesInRange(
                getCodeLine(store.getState()), 
                view, 
                range.from, 
                range.to);
            let inViewID = store.getState().projectManager.inViewID;
            console.log('CodeEditor setGroup: ', lineRange, range);
            if(inViewID && lineRange && lineRange.toLine>lineRange.fromLine){
                let lineStatus: ICodeLineGroupStatus = {
                    inViewID: inViewID,
                    fromLine: lineRange.fromLine, 
                    toLine: lineRange.toLine, 
                    status: LineStatus.EDITED, 
                    setGroup: SetLineGroupCommand.NEW,
                };                        
                dispatch(setLineGroupStatus(lineStatus));
            }            
        }     
        return true;       
    }

    function setUnGroup(): boolean {
        if(view){
            const doc = view.state.doc;
            const anchor = view.state.selection.asSingle().ranges[0].anchor;
            let lineAtAnchor = doc.lineAt(anchor);
            let reduxState = store.getState()
            let inViewID = reduxState.projectManager.inViewID;
            if(inViewID){
                let codeLines = reduxState.codeEditor.codeLines[inViewID];
                /** minus 1 to convert to 0-based */
                let lineRange = getLineRangeOfGroup(codeLines, lineAtAnchor.number-1);
                console.log('CodeEditor setUnGroup: ', lineRange);
                if(inViewID && lineRange && lineRange.toLine>lineRange.fromLine){
                    let lineStatus: ICodeLineGroupStatus = {
                        inViewID: inViewID,
                        fromLine: lineRange.fromLine, 
                        toLine: lineRange.toLine, 
                        // status: LineStatus.EDITED, 
                        setGroup: SetLineGroupCommand.UNDEF,
                    };                        
                    dispatch(setLineGroupStatus(lineStatus));
                }    
            }                    
        }     
        return true;       
    }

    /**
     * Any code change after initialization will be handled by this function
     * @param value 
     * @param viewUpdate 
     */
    function onCodeMirrorChange(value: string, viewUpdate: ViewUpdate){
        try{
            /** do nothing if the update is due to code reloading from external source */
            if (codeReloading)
                return;

            if (viewUpdate.viewportChanged)
                console.log('CodeEditor viewport ', document.querySelector('div.cm-scroller').scrollTop);

            let doc = viewUpdate.state.doc;    
            let inViewID = store.getState().projectManager.inViewID;
            let serverSynced = store.getState().projectManager.serverSynced;
            // console.log('CodeEditor onCodeMirrorChange', );
            viewUpdate.changes.iterChanges(
                (fromA, toA, fromB, toB, inserted) => {console.log('CodeEditor render onCodeMirrorChange', fromA, toA, fromB, toB)});
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
                    dispatch(updateLines(updatedLineInfo));
                    dispatch(setFileToSave(inViewID));
                } else if (updatedLineCount<0){               
                    // Note 1: _getCurrentLineNumber returns line number indexed starting from 1.
                    // Convert it to 0-indexed by -1. 
                    // Note 2: the lines being deleted are lines above currentLine.
                    // If there is new text in the current line then current line is `edited`                            
                    dispatch(updateLines(updatedLineInfo));
                    dispatch(setFileToSave(inViewID));
                } else {
                    let lineStatus: ICodeLineStatus;
                    lineStatus = {
                        inViewID: inViewID,
                        text: text, 
                        lineNumber: changeStartLineNumber, 
                        status: LineStatus.EDITED, 
                        generated: false};                    
                    dispatch(setLineStatus(lineStatus));
                    dispatch(setFileToSave(inViewID));
                }
                
                magicsPreProcess();
            }
        } catch(error) {
            throw(error);
        }
    }

    /**
     * This handle all the CNext magics.
     */
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
                    console.log('CodeEditor Magics magicsPreProcess current magicInfo: ', magicInfo);
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
                        console.log('CodeEditor Magics magicsPreProcess inserting magicInfo: ', magicInfo);
                        setMagicInfo(magicInfo);                                                                      
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
                        console.log('CodeEditor Magics magicsPreProcess after inserted magicInfo: ', magicInfo); 
                        setMagicInfo({...magicInfo});                                                  
                    }                    
                } 
            }
        }      
    } 

    /**
     * Parse the magic code lines and generate magic internal data structure
     * 
     * Currently only implement the plot magic. The plot will start first with #! plot.
     * The current grammar will make good detection of CNextStatement except for when 
     * the command line ends with eof. Not sure why the grammar does not work with it.
     * The cnext plot pattern looks like this:
     * CNextPlotExpression(CNextPlotKeyword,
     * DataFrameExpresion,
     * CNextPlotYDimExpression(ColumnNameExpression),
     * CNextPlotAddDimKeyword(vs),
     * CNextPlotXDimExpression(ColumnNameExpression))
     * */
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

    /**
     * The replacement range will be identified from the line group that contains magicInfo.lineInfo.fromLine
     * @param genCodeResult 
     */
    // TODO: make this pure function
    const processGenCodeResult = (genCodeResult: CodeGenResult) => {
        if (view){
            let state: EditorState = view.state;
            if (!genCodeResult.error && genCodeResult.code && magicInfo && magicInfo.line && magicInfo.lineInfo){
                let genCode: string = genCodeResult.code;
                let lineCount: number|undefined = genCodeResult.lineCount;                
                let lineNumber = magicInfo.lineInfo.fromLine;
                let insertFrom =  magicInfo.lineInfo.fromPos; //magicInfo.line.from;
                let codeLines: ICodeLine[]|null = getCodeLine(store.getState());
                if(codeLines){
                    let isLineGenerated = codeLines[lineNumber].generated;                
                    let lineRange = getLineRangeOfGroup(codeLines, lineNumber);
                    let codeText = getCodeText(store.getState());
                    let insertTo: number = insertFrom;
                    if(isLineGenerated){
                        for(let i=lineRange.fromLine; i<lineRange.toLine; i++){
                            console.log('CodeEditor Magic codeText length: ', codeText[i].length, insertTo);
                            insertTo += codeText[i].length; 
                        }
                        /** add the number of the newline character between fromLine to toLine excluding the last one*/
                        insertTo += (lineRange.toLine-lineRange.fromLine-1); 
                    }
                    /** Update magicInfo with lineCount */
                    magicInfo.lineInfo.toLine = magicInfo.lineInfo.fromLine + (lineCount?lineCount:0);
                    setMagicInfo(magicInfo); //only update do not create new magic info so state wont be updated

                    console.log('CodeEditor Magic insert range: ', insertFrom, insertTo, lineRange, lineNumber, codeText);
                    let transactionSpec: TransactionSpec = {
                        changes: {
                            from: insertFrom, 
                            to: insertTo, 
                            insert: isLineGenerated ? genCode : genCode + LINE_SEP
                        }
                    };                
                    let transaction: Transaction = state.update(transactionSpec);
                    view.dispatch(transaction);  
                }                  
            } else {
                setMagicInfo(undefined);       
            }
        }
    }

    /**
     * This useEffect handle the plot magic. This is used in conjunction with _handleMagics. 
     * This will be triggered when there are updates on magicInfo. 
     * Could not make it work when run this directly inside _handleMagics(), 
     * might be because that function is called within onCMUpdate which is in the middle of
     * a transaction.
     */
    const processMagicInfo = () => {
        // console.log('CodeEditor processMagicInfo: ', magicInfo);
        if (view && magicInfo){
            if (magicInfo.status === CodeGenStatus.INSERTING){
                if (magicInfo.plotData !== undefined && magicInfo.lineInfo !== undefined) {          
                    // console.log('Magic inlinePlotData: ', inlinePlotData);
                    let result: Promise<CodeGenResult>|CodeGenResult = magicsGetPlotCommand(magicInfo.plotData);
                    if (isPromise(result)){
                        result.then((genCodeResult: CodeGenResult) => {
                            console.log('CodeEditor Magic code gen result: ', genCodeResult);
                            processGenCodeResult(genCodeResult);
                        });
                    } else {
                        let genCodeResult: CodeGenResult = result;
                        console.log('CodeEditor Magic code gen result: ', genCodeResult);
                        processGenCodeResult(genCodeResult)
                    } 
                }
            } else if (magicInfo.status === CodeGenStatus.INSERTED && magicInfo.lineInfo !== undefined) {
                setFlashingEffect(store.getState(), view, magicInfo);
            }
        }
    }
    
    return (
        <StyledCodeEditor ref={editorRef}>
            {console.log('CodeEditor render')}
        </StyledCodeEditor>
    );
};

export default CodeEditor;

