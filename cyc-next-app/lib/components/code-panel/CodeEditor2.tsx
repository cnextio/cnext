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



const CodeEditor = ({id, cm}) => {
// const CodeEditor = (props: any) => {
    /** This state is used to indicate server sync status. Code doc need to be resynced only 
     * when it is first opened or being selected to be in view */
    // const [serverSynced, setServerSynced] = useState(false);
    const serverSynced = useSelector(state => state.projectManager.serverSynced);
    const inViewID = useSelector(state => state.projectManager.inViewID);
    const codeLines: ICodeLine[] = useSelector(state => getCodeLineRedux(state));
    // const codeText: string[] = useSelector(state => getCodeTextRedux(state));    
    const runQueue = useSelector(state => state.codeEditor.runQueue);
    const dispatch = useDispatch();
    const editorRef = useRef();
    const [magicInfo, setMagicInfo] = useState<IMagicInfo|undefined>();
    
    function getCodeTextRedux(state) {
        let inViewID = state.projectManager.inViewID;
        if (inViewID) {
            return ifElse(state.codeEditor.codeText, inViewID, null);
        }
        return null;
    }

    function getCodeLineRedux(state) {
        let inViewID = state.projectManager.inViewID;
        if (inViewID) {
            return ifElse(state.codeEditor.codeLines, inViewID, null);
        }
        return null;
    }

    /** 
     * This function should only be called after `codeLines` has been updated. However because this is controlled by CodeMirror 
     * intenal, we can't dictate when it will be called. To cope with this, we have to check the object existence carefully 
     * and rely on useEffect to force this to be called again when `codeLines` updated 
    */ 
    
    /** */
    
    

    // const { view, container, setContainer } = React.useMemo(() => useCodeMirror({
    //     container: editorRef.current,
    //     extensions: extensions,
    //     height: "100%",
    //     theme: 'light',
    //     onChange: onCodeMirrorChange,     
    // }), []);

    const getCodeText = () => {
        let state = store.getState();
        let inViewID = state.projectManager.inViewID;
        if (inViewID) {
            let codeText = ifElse(state.codeEditor.codeText, inViewID, null);
            if (codeText)
                return codeText.join('\n');
        }
        return undefined;
    }

    

    const _handlePlotData = (message: Message) => {
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
            // console.log("Got results: ", result, '\n');
            console.log("CodeEditor got results...");
            try {
                let codeOutput: Message = JSON.parse(result);   
                let inViewID = store.getState().projectManager.inViewID;
                if (inViewID) {
                    if (codeOutput.content_type == ContentType.STRING){
                        recvCodeOutput(codeOutput); //TODO: move this to redux
                    } else {
                        if(codeOutput.error==true){
                            recvCodeOutput(codeOutput);
                        } else if (codeOutput.content_type==ContentType.PANDAS_DATAFRAME){
                            console.log("dispatch tableData");               
                            dispatch(setTableData(codeOutput.content));
                        } else if (codeOutput.content_type==ContentType.PLOTLY_FIG){
                            // _handlePlotData(codeOutput); 
                            _handlePlotData(codeOutput);                       
                        }
                        else {  
                            console.log("dispatch text output:", codeOutput);                        
                            recvCodeOutput(codeOutput);
                        }
                    }
                    let lineStatus: ILineStatus = {
                        inViewID: inViewID,
                        lineNumber: codeOutput.metadata.line_number, 
                        status: LineStatus.EXECUTED};
                    console.log('CodeEditor socket ', lineStatus);
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
    const setMouseDownHandler = () => {                
        if (cm.container){
            cm.container.onmousedown = onMouseDown;  
        }                 
    }
    useEffect(() => {        
        setMouseDownHandler();
    }, [cm.container]);
    
    const setGenCodeLineDeco = () => {
        if (cm.view) {
            // console.log('CodeEditor set gencode solid')
            cm.view.dispatch({effects: [StateEffect.appendConfig.of([generatedCodeDeco])]});
            cm.view.dispatch({effects: [generatedCodeStateEffect.of({type: GenCodeEffectType.SOLID})]});             
        }
    }
    useEffect(() => {
        if (serverSynced){ 
            console.log('CodeEditor useEffect');           
            // loadCodeText();
            setGenCodeLineDeco();
        }        
    })

    /**
     * Reset the code editor state when the doc is selected to be in view
     * */
    const resetEditorState = () => {
        if(cm.view){
            // console.log('CodeEditor useEffect inViewID');
            // dispatch(setServerSynced(false));
            // clear the state
            cm.view.setState(EditorState.create({doc: '', extensions: extensions}));
        }
    }
    useEffect(() => {
        // resetEditorState();
    }, [inViewID]);

    /**
     * Init CodeEditor value with content load from the file if `initilized` is False
     */
    const loadCodeText = () => {
        // console.log('CodeEditor useEffect _initCM', view, codeText[0]);
        let inViewID = store.getState().projectManager.inViewID;
        let codeText = ifElse(store.getState().codeEditor.codeText, inViewID, null);        
        console.log('CodeEditor ', cm.view, inViewID, codeText);
        if (cm.view && codeText) {            
            // view.setState(EditorState.create({
            //     doc: codeText.join('\n'), extensions: extensions
            // }))
            let transactionSpec: TransactionSpec = {
                changes: {
                    from: 0, 
                    to: 0, 
                    insert: codeText.join('\n')
                }
            };                
            let transaction: Transaction = cm.view.state.update(transactionSpec);
            cm.view.dispatch(transaction); 
        }
    }
    useEffect(() => {
        // console.log('CodeEditor useEffect codeText', view, codeText[0], serverSynced);
        if (serverSynced){      
            console.log('CodeEditor useEffect serverSynced');                 
            loadCodeText();
        }
    }, [serverSynced]);
    // useEffect(() => {
    //     // console.log('CodeEditor useEffect codeText', view, codeText[0], serverSynced);
    //     if (codeText && view && !serverSynced){            
    //         _initCM();
    //         setServerSynced(true);                        
    //     }
    // }, [codeText, view]);
    

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

    /** Functions that support runQueue */
    function _getLineContent(lineNumber: number): string|undefined {
        let text: string|undefined;
        if (cm.view){ 
            const doc = cm.view.state.doc;
            /** convert lineNumber to 1-based */
            // console.log('CodeEditor', cm, doc, doc.line(10));
            let line = doc.line(lineNumber+1);
            text = line.text;         
            console.log('CodeEditor _getLineContent2 code line to run: ', lineNumber+1, text);
            // convert the line number to 0-based index, which is what we use internally
        }
        return text;
    }

    

    function execLine(){
        if(runQueue.status === RunQueueStatus.RUNNING){
            let text: string|undefined = _getLineContent(runQueue.runningLine);
            let inViewID = store.getState().projectManager.inViewID;
            if(text && inViewID){
                console.log('CodeEditor execLine: ', runQueue.runningLine);
                let content: ILineContent = {lineNumber: runQueue.runningLine, content: text};
                _send_message(content);
                let lineStatus: ILineStatus = {
                    inViewID: inViewID, 
                    lineNumber: content.lineNumber, 
                    status: LineStatus.EXECUTING};
                dispatch(setLineStatus(lineStatus));
            }
        }
    }
    
    useEffect(()=>{
        execLine()
    },[runQueue])
    /** */
    
    function onMouseDown(event){
        try {
            if(cm.view){
                //Note: can't use editorRef.current.state.doc, this one is useless, did not update with the doc.
                let doc = cm.view.state.doc;
                let pos = cm.view.posAtDOM(event.target);                
                //convert to 0-based
                let lineNumber = doc.lineAt(pos).number-1;        
                dispatch(setActiveLine(lineNumber));
                // console.log('CodeEditor onMouseDown', doc, pos, lineNumber);
            }                    
        } catch(error) {
            console.log(error);
            console.trace();
        }
        
    }

    /** this will force the CodeMirror to refresh when codeLines update. Need this to make the gutter update 
     * with line status. This works but might need to find a better performant solution. */ 
    useEffect(() => {
        if(cm.view){            
            cm.view.dispatch();
        }         
    }, [codeLines]);
    
    /**
     * Any code change after initialization will be handled by this function
     * @param value 
     * @param viewUpdate 
     */
    

    /**
     * This handle all the CNext magics.
     */
    // const magicsPreProcess = () => {
    //     if(view){
    //         let state = view.state;
    //         let inViewID = store.getState().projectManager.inViewID;
    //         if(state && inViewID){
    //             let tree = state.tree;
    //             let curPos = state.selection.ranges[0].anchor;             
    //             let cursor = tree.cursor(curPos, 0);                    
                                    
    //             if ([CNextDataFrameExpresion, CNextXDimColumnNameExpression, CNextYDimColumnNameExpression]
    //                 .includes(cursor.type.id)){
    //                 /** 
    //                  * Move the cursor up to CNextPlotExpression so we can parse the whole cnext text and
    //                  * generate the new inline plot command 
    //                  * */
    //                 cursor.parent();
    //                 cursor.parent();
    //             }
    //             console.log('CodeEditor Magics magicsPreProcess: ', cursor.toString());
    //             if (cursor.type.id === CNextPlotExpression) {                        
    //                 let text: string = state.doc.toString();
    //                 let newMagicText: string = text.substring(cursor.from, cursor.to);                         
    //                 let generatedLine = view.state.doc.lineAt(cursor.to);
    //                 console.log('CodeEditor Magics current magicInfo: ', magicInfo);
    //                 /** 
    //                  * Check the status here to avoid circular update because this code will generate
    //                  * new content added to the editor, which will trigger onCMChange -> _handleMagic. 
    //                  * Note: if magicInfo status is CodeGenStatus.INSERTED, we also reset the magicInfo content
    //                  * */                       
    //                 if (magicInfo === undefined || (magicInfo && magicInfo.status === CodeGenStatus.INSERTED)) {            
    //                     let plotData = parseMagicText(cursor, text);
    //                     let magicInfo: IMagicInfo = {
    //                         status: CodeGenStatus.INSERTING, 
    //                         magicText: newMagicText, 
    //                         plotData: plotData, 
    //                         line: generatedLine,
    //                         /** generatedLine.number in state.doc is 1 based, so convert to 0 base */ 
    //                         lineInfo: {
    //                             fromLine: generatedLine.number-1, 
    //                             fromPos: generatedLine.from,
    //                             toLine: generatedLine.number, /** this will need to be replaced when the code is generated */
    //                         }
    //                     };
    //                     setMagicInfo(magicInfo);
    //                     console.log('CodeEditor Magics inserting magicInfo: ', magicInfo);                                              
    //                 } else if (magicInfo && magicInfo.status === CodeGenStatus.INSERTING && magicInfo.line && magicInfo.lineInfo) {
    //                     /** The second time _handleMagic being called is after new code has been inserted */
    //                     /** convert line number to 0-based */
    //                     let lineStatus: ICodeLineGroupStatus = {
    //                         inViewID: inViewID,
    //                         fromLine: magicInfo.lineInfo.fromLine, 
    //                         toLine: magicInfo.lineInfo.toLine, 
    //                         status: LineStatus.EDITED, 
    //                         generated: true,
    //                         setGroup: SetLineGroupCommand.NEW,
    //                     };                        
    //                     dispatch(setLineGroupStatus(lineStatus));
    //                     // console.log('Magics after inserted lineStatus: ', lineStatus);
    //                     magicInfo.status = CodeGenStatus.INSERTED;
    //                     setMagicInfo({...magicInfo});           
    //                     console.log('CodeEditor Magics after inserted magicInfo: ', magicInfo);                
    //                 }                    
    //             } 
    //         }
    //     }      
    // } 

    /**
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
                let isLineGenerated = codeLines[lineNumber].generated;
                let lineRange = getLineRangeOfGroup(lineNumber);
                
                let insertTo: number = insertFrom;
                if(isLineGenerated){
                    for(let i=lineRange.fromLine; i<lineRange.toLine; i++){
                        insertTo += codeText[i].length; 
                    }
                    /** add the number of the newline character between fromLine to toLine excluding the last one*/
                    insertTo += (lineRange.toLine-lineRange.fromLine-1); 
                }
                /** Update magicInfo with lineCount */
                magicInfo.lineInfo.toLine = magicInfo.lineInfo.fromLine + (lineCount?lineCount:0);
                setMagicInfo(magicInfo); //only update do not create new magic info so state wont be updated

                console.log('CodeEditor Magic insert range: ', insertFrom, insertTo);
                let transactionSpec: TransactionSpec = {
                    changes: {
                        from: insertFrom, 
                        to: insertTo, 
                        insert: isLineGenerated ? genCode : genCode + LINE_SEP
                    }
                };                
                let transaction: Transaction = state.update(transactionSpec);
                view.dispatch(transaction);                                       
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
        console.log('CodeEditor processMagicInfo: ', magicInfo);
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
                _setFlashingEffect();
            }
        }
    }
    useEffect(() => {
        // processMagicInfo();
    }, [magicInfo])
    
    function isPromise(object) {
        if (Promise && Promise.resolve) {
            return Promise.resolve(object) == object;
        } else {
            throw "Promise not supported in your environment"; // Most modern browsers support Promises
        }
    }

    /**
     * Get the line range of the group that contains lineNumber
     * @param lineNumber 
     * @returns line range which is from fromLine to toLine excluding toLine
     */
    // function _getLineRangeOfGroup(lineNumber: number): ILineRange {
    //     let groupID = codeLines[lineNumber].groupID;
    //     let fromLine = lineNumber;
    //     let toLine = lineNumber;
    //     if (groupID === undefined){
    //         toLine = fromLine+1;
    //     } else {
    //         while(codeLines[fromLine-1].groupID && codeLines[fromLine-1].groupID === groupID){
    //             fromLine -= 1;
    //         }
    //         while(codeLines[toLine].groupID && codeLines[toLine].groupID === groupID){
    //             toLine += 1;
    //         }
    //     }        
    //     return {fromLine: fromLine, toLine: toLine};
    // }    
    /** */
    
    

    /** Implement the decoration for magic generated code lines */
    /** 
     * Implement the flashing effect after line is inserted.
     * This function also reset magicInfo after the animation completes. 
     * */
    function _setFlashingEffect(){
        console.log('Magic _setFlashingEffect', magicInfo, cm.view, cm.container);    
        if(magicInfo && cm.view){
            cm.view.dispatch({effects: [StateEffect.appendConfig.of([generatedCodeDeco])]});
            cm.view.dispatch({effects: [generatedCodeStateEffect.of({
                lineInfo: magicInfo.lineInfo, 
                type: GenCodeEffectType.FLASHING})]});             
        }        
    }
    enum GenCodeEffectType {
        FLASHING,
        SOLID
    };
    /** note that this lineNumber is 1-based */
    const generatedCodeStateEffect = StateEffect.define<{lineInfo?: IInsertLinesInfo, type: GenCodeEffectType}>()
    const generatedCodeDeco = StateField.define<DecorationSet>({
        create() {
            return Decoration.none;
        },
        update(marks, tr) {
            if (cm.view){                               
                marks = marks.map(tr.changes)
                for (let effect of tr.effects) if (effect.is(generatedCodeStateEffect)) {
                    // console.log('Magic generatedCodeDeco update ', effect.value.type);     
                    if (effect.value.type === GenCodeEffectType.FLASHING) {
                        if (effect.value.lineInfo !== undefined){
                            let lineInfo = effect.value.lineInfo;
                            for (let i=lineInfo.fromLine; i<lineInfo.toLine; i++){
                                /** convert line number to 1-based */
                                let line = cm.view.state.doc.line(i+1);
                                // console.log('Magics line from: ', line, line.from);
                                marks = marks.update({
                                    add: [genCodeFlashCSS.range(line.from)]
                                })
                                // console.log('Magic _setFlashingEffect generatedCodeDeco update ', line.from);                         
                            }                            
                        }                        
                    } else { /** effect.value.type is SOLID */
                        let inViewID = store.getState().projectManager.inViewID;
                        if (inViewID) {
                            let lines: ICodeLine[] = getCodeLineRedux(store.getState());
                            if (lines) {
                                for (let l=0; l < lines.length; l++){
                                    if (lines[l].generated === true){
                                        let line = cm.view.state.doc.line(l+1);
                                        marks = marks.update({
                                            add: [genCodeSolidCSS.range(line.from)]
                                        })
                                    }                            
                                }
                            }
                        }    
                    }
                }           
                return marks
            }
        },
        provide: f => EditorView.decorations.from(f)
    });
    const genCodeFlashCSS = Decoration.line({attributes: {class: "cm-gencode-flash"}});
    const genCodeSolidCSS = Decoration.line({attributes: {class: "cm-gencode-solid"}});
    /** end of generated code line decoration */
        
    useEffect(() => {
        if (editorRef.current) {
            cm.setContainer(editorRef.current);
            // let myView = new EditorView({
            //     state: EditorState.create({doc: "hello"}),
            //     parent: editorRef.current
            //   })
        }
    }, [editorRef.current]);

    return (
        <StyledCodeEditor ref={editorRef}>
            {console.log('CodeEditor render ', id)}
        </StyledCodeEditor>
    );
};

export default CodeEditor;



