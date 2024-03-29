import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import { IMessage, WebAppEndpoint, ContentType, CommandName } from "../../interfaces/IApp";
import { useSelector, useDispatch } from "react-redux";
import { setTableData } from "../../../redux/reducers/DataFramesRedux";
import store, { RootState } from "../../../redux/store";
import { SocketContext } from "../Socket";
import { python } from "../../codemirror/grammar/lang-cnext-python";
import { sql } from "@codemirror/lang-sql";
import { json } from "@codemirror/lang-json";
import { EditorView, keymap, lineNumbers, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { Line } from "@codemirror/state";
import { defaultKeymap, historyKeymap, insertNewlineAndIndent } from "@codemirror/commands";
import { searchKeymap } from "@codemirror/search";
import { StyledCodeEditor } from "../StyledComponents";
import { languageServer } from "../../codemirror/autocomplete-lsp/index.js";

import {
    addResult,
    updateLines,
    setLineStatus as setLineStatusRedux,
    setActiveLine as setActiveLineRedux,
    setLineGroupStatus,
    addToRunQueue as addToRunQueueRedux,
    updateCAssistInfo,
    setCodeToInsert,
    setRunQueueStatus,
    removeFirstItemFromRunQueue,
    clearRunQueue,
    setCellCommand,
    clearAllOutputs,
} from "../../../redux/reducers/CodeEditorRedux";
import {
    ICodeResultMessage,
    ILineUpdate,
    IRunningCommandContent,
    LineStatus,
    ICodeLineStatus,
    ICodeLine,
    ICodeLineGroupStatus,
    SetLineGroupCommand,
    RunQueueStatus,
    ILineRange,
    ICodeActiveLine,
    ICodeToInsertInfo,
    CodeInsertMode,
    IRunQueueItem,
    IRunQueue,
    CellCommand,
    IPythonMessageType,
} from "../../interfaces/ICodeEditor";
import { useCodeMirror } from "@uiw/react-codemirror";
import { EditorState, Extension, Transaction, TransactionSpec } from "@codemirror/state";
import {
    ICodeGenResult,
    CodeInsertStatus,
    ICAssistInfo,
    LINE_SEP,
    CASSIST_STARTER,
    ICAssistInfoRedux,
} from "../../interfaces/ICAssist";
import { cAssistGetPlotCommand } from "../../cassist/CAssistPlotGen";
import {
    CNextDataFrameExpresion,
    CNextPlotExpression,
    CNextXDimColumnNameExpression,
    CNextYDimColumnNameExpression,
} from "../../codemirror/grammar/cnext-python.terms";
import {
    editStatusGutter,
    getCodeLine,
    getCodeText,
    getLineRangeOfGroup,
    isPromise,
    scrollToPrevPos,
    setFlashingEffect,
    setGenLineDeco,
    setHTMLEventHandler,
    setCodeTextAndStates,
    setAnchor,
    setLineStatus,
    isRunQueueBusy,
    setGroup,
    setUnGroup,
    addToRunQueue,
    addToRunQueueThenMoveDown,
    execLines,
    fileClosingHandler,
    addToRunQueueHover,
    setAnchorToPos,
} from "./libCodeEditor";
import { cAssistExtraOptsPlugin, parseCAssistText } from "./libCAssist";
import CypressIds from "../tests/CypressIds";

import {
    defaultHighlightStyle,
    foldAll,
    foldCode,
    foldKeymap,
    foldService,
    indentUnit,
    syntaxHighlighting,
    unfoldAll,
    unfoldCode,
    bracketMatching,
} from "@codemirror/language";
import { lintKeymap } from "@codemirror/lint";
import { basicSetup } from "../../codemirror/basic-setup";
import { cellWidget, cellWidgetStateField, setCodeMirrorCellWidget } from "./libCellWidget";
import { getCellFoldRange } from "./libCellFold";
import { cellDeco, cellDecoStateField, setCodeMirrorCellDeco } from "./libCellDeco";

// let pyLanguageServer = languageServer({
//     serverUri: "ws://localhost:3001/python",
//     rootUri: "file:///",
//     documentUri: "file:///",
//     languageId: "python",
// });

const CodeEditor = ({ stopMouseEvent }) => {
    const socket = useContext(SocketContext);
    // const CodeEditor = (props: any) => {
    /** This state is used to indicate server sync status. Code doc need to be resynced only
     * when it is first opened or being selected to be in view */
    // const [serverSynced, setServerSynced] = useState(false);
    const serverSynced = useSelector((state: RootState) => state.projectManager.serverSynced);
    const executorRestartCounter = useSelector(
        (state: RootState) => state.executorManager.executorRestartCounter
    );
    const inViewID = useSelector((state: RootState) => state.projectManager.inViewID);
    /** this is used to save the state such as scroll pos and folding status */
    const [curInViewID, setCurInViewID] = useState<string | null>(null);
    const activeProjectID = useSelector(
        (state: RootState) => state.projectManager.activeProject?.id
    );
    /** using this to trigger refresh in gutter */
    // const codeText = useSelector((state: RootState) => getCodeText(state));

    const cellAssocUpdateCount = useSelector(
        (state: RootState) => state.codeEditor.cellAssocUpdateCount
    );
    const runQueue = useSelector((state: RootState) => state.codeEditor.runQueue);
    const cAssistInfo = useSelector((state: RootState) => state.codeEditor.cAssistInfo);
    const codeToInsert = useSelector((state: RootState) => state.codeEditor.codeToInsert);
    /** using this to trigger refresh in group highlight */
    const activeGroup = useSelector((state: RootState) => state.codeEditor.activeGroup);

    const shortcutKeysConfig = useSelector(
        (state: RootState) => state.projectManager.settings.code_editor_shortcut
    );

    const lineStatusUpdate = useSelector(
        (state: RootState) => state.codeEditor.lineStatusUpdateCount
    );
    // const mouseOverGroupID = useSelector((state: RootState) => state.codeEditor.mouseOverGroupID);
    const cellCommand = useSelector((state: RootState) => state.codeEditor.cellCommand);

    // const [cmUpdatedCounter, setCMUpdatedCounter] = useState(0);

    // const [cAssistInfo, setCAssistInfo] = useState<ICAssistInfo|undefined>();
    const dispatch = useDispatch();
    const editorRef = useRef<HTMLDivElement>();

    /** this state is used to indicate when the codemirror view needs to be loaded from internal source
     * i.e. from codeText */
    const [codeReloading, setCodeReloading] = useState<boolean>(true);

    const defaultExtensions = [
        basicSetup,
        foldService.of(getCellFoldRange),
        lineNumbers(),
        editStatusGutter(store.getState().projectManager.inViewID, getCodeLine(store.getState())),
        cellWidgetStateField,
        cellWidget(),
        cellDecoStateField,
        cellDeco(),
        bracketMatching(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of([
            { key: shortcutKeysConfig.run_queue, run: () => addToRunQueue(view) },
            {
                key: shortcutKeysConfig.run_queue_then_move_down,
                run: () => addToRunQueueThenMoveDown(view),
            },

            { key: shortcutKeysConfig.set_group, run: () => setGroup(view) },
            { key: shortcutKeysConfig.set_ungroup, run: () => setUnGroup(view) },
            {
                key: shortcutKeysConfig.insert_group_below,
                run: () => insertBelow(CodeInsertMode.GROUP),
            },
            {
                key: shortcutKeysConfig.insert_line_below,
                run: () => insertBelow(CodeInsertMode.LINE),
            },
            { key: "Mod-Shift-f", run: foldAll },
            { key: "Mod-Shift-u", run: unfoldAll },
            { key: "Mod-Shift-c", run: foldCode },
            { key: "Mod-Shift-v", run: unfoldCode },
            // ...closeBracketsKeymap,
            ...defaultKeymap,
            ...searchKeymap,
            ...historyKeymap,
            ...foldKeymap,
            ...lintKeymap,
        ]),
        indentUnit.of("    "),
    ];

    const getLangExtenstions = (inViewID: string | null) => {
        console.log("CodeEditor LangExtenstions: ", inViewID);

        const path = store.getState().projectManager.activeProject?.path;
        const pyLanguageServer = languageServer({
            serverUri: "ws://localhost:3001/python",
            rootUri: "file:///" + path,
            documentUri: "file:///" + path,
            languageId: "python",
            socket: socket
        });

        const fileLangExtensions: { [name: string]: Extension[] } = {
            py: [python(), pyLanguageServer, cAssistExtraOptsPlugin.extension],
            sql: [sql()],
            json: [json()],
        };
        if (inViewID == null) return [fileLangExtensions["py"]];
        const nameSplit = inViewID.split(".");
        const fileExt = nameSplit[nameSplit.length - 1];
        if (Object.keys(fileLangExtensions).includes(fileExt)) {
            return fileLangExtensions[fileExt];
        } else {
            return fileLangExtensions["py"];
        }
    };

    const [langExtensions, setLangExtensions] = useState(getLangExtenstions(inViewID));

    const { view, container, setContainer } = useCodeMirror({
        basicSetup: false,
        // container: editorRef.current,
        extensions: [...defaultExtensions, ...langExtensions],
        height: "100%",
        theme: "light",
        onChange: (value, viewUpdate) => onCodeMirrorChange(value, viewUpdate),
        /** do not allow edit when there are items in the run queue */
        readOnly: isRunQueueBusy(runQueue),
    });

    const resetEditorState = (inViewID: string | null, view: EditorView | undefined) => {
        if (view != null) {
            setLangExtensions(getLangExtenstions(inViewID));
            view.setState(EditorState.create({ doc: "" }));
        }
    };

    const handleResultData = (message: IMessage) => {
        // console.log(`${WebAppEndpoint.CodeEditor} got result data`);
        let inViewID = store.getState().projectManager.inViewID;
        if (inViewID) {
            let result: ICodeResultMessage = {
                inViewID: inViewID,
                content: message.content,
                type: message.type,
                subType: message.sub_type,
                metadata: message.metadata,
            };

            // content['plot'] = JSON.parse(content['plot']);
            console.log("CodeEditor dispatch result data: ", result);
            dispatch(addResult(result));
        }
    };

    /**
     * Init CodeEditor socket connection. This should be run only once on the first mount.
     */
    const socketInit = () => {
        socket?.emit("ping", WebAppEndpoint.CodeEditor);
        socket?.on(WebAppEndpoint.CodeEditor, (result: string, ack) => {
            console.log("CodeEditor got result ", result);
            // console.log("CodeEditor: got results...");
            try {
                let codeOutput: IMessage = JSON.parse(result);
                let inViewID = store.getState().projectManager.inViewID;
                if (inViewID) {
                    handleResultData(codeOutput);
                    if (
                        codeOutput.metadata?.msg_type === IPythonMessageType.EXECUTE_REPLY &&
                        codeOutput.content?.status != null
                    ) {
                        // let lineStatus: ICodeLineStatus;
                        dispatch(removeFirstItemFromRunQueue());
                        if (
                            codeOutput.content?.status === "ok" &&
                            "line_range" in codeOutput.metadata
                        ) {
                            setLineStatus(
                                inViewID,
                                codeOutput.metadata?.line_range,
                                LineStatus.EXECUTED_SUCCESS
                            );
                            dispatch(setRunQueueStatus(RunQueueStatus.STOP));
                        } else {
                            if ("line_range" in codeOutput.metadata) {
                                setLineStatus(
                                    inViewID,
                                    codeOutput.metadata?.line_range,
                                    LineStatus.EXECUTED_FAILED
                                );
                            }
                            dispatch(clearRunQueue());
                        }
                        // TODO: check the status output
                        // console.log('CodeEditor socket ', lineStatus);
                        // dispatch(setLineStatusRedux(lineStatus));
                        /** set active code line to be the current line after it is excuted so the result will be show accordlingly
                         * not sure if this is a good design but will live with it for now */
                        // let activeLine: ICodeActiveLine = {
                        //     inViewID: inViewID,
                        //     lineNumber: codeOutput.metadata.line_range?.fromLine,
                        // };
                        // dispatch(setActiveLine(activeLine));
                    }                    
                }
            } catch (error) {
                console.error(error);
            }
            if (ack) ack();
        });
    };

    /** this useEffect forces CM to update cell status whenever codeLine.length changes
     * Note that this is only conditioned on codeLine.length not codeLine because codeLine
     * itself might change when the code is being excuted like when the line status change
     * Make widget update on every status change will make the screen jittering */
    useEffect(() => {
        if (view != null) {
            setCodeMirrorCellWidget(view);
        }
    }, [cellAssocUpdateCount]);

    /** this useEffect forces CM to update cell status whenever codeLine or activeGroup changes */
    useEffect(() => {
        if (view != null) {
            setCodeMirrorCellDeco(view);
        }
    }, [cellAssocUpdateCount, activeGroup]);

    /** clear the run queue when the executor restarted */
    useEffect(() => {
        const runQueueItem = runQueue.queue[0];
        let inViewID = store.getState().projectManager.inViewID;
        if (inViewID != null && runQueueItem != null) {
            dispatch(removeFirstItemFromRunQueue());
            setLineStatus(inViewID, runQueueItem.lineRange, LineStatus.EXECUTED_FAILED);
            dispatch(clearRunQueue());
        }
    }, [executorRestartCounter]);

    useEffect(() => {
        console.log("CodeEditor init");
        socketInit();
        resetEditorState(inViewID, view);
        return () => {
            console.log("CodeEditor unmount");
            socket?.off(WebAppEndpoint.CodeEditor);
        };
    }, [socket]);

    /**
     * FIXME: This is used to set onmousedown event handler. This does not seem to be the best way.
     * Also set the SOLID effect for generated lines
     * */

    useEffect(() => {
        // console.log("CodeEditor useEffect container view", container, view);
        if (container && view) {
            setHTMLEventHandler(container, view, stopMouseEvent);
        }
    });

    /**
     * Reset the code editor state when the doc is selected to be in view
     * */
    useEffect(() => {
        if (curInViewID != inViewID) {
            if (curInViewID != null && view != null) {
                fileClosingHandler(view.state, curInViewID);
            }
            setCurInViewID(inViewID);
        }
        resetEditorState(inViewID, view);
        setCodeReloading(true);
    }, [inViewID]);

    /**
     * Init CodeEditor value with content load from the file
     * Also scroll the file to the previous position
     */
    useEffect(() => {
        console.log(
            "CodeEditor useEffect serverSynced, codeReloading, view",
            serverSynced,
            codeReloading,
            view
        );
        // console.log("CodeEditor useEffect codeText", view, codeReloading, serverSynced);
        if (serverSynced && codeReloading && view != null) {
            // make sure that codeeditor content is set first before setting codeReloading to false to avoid
            // unnecessary calls to updatedLines
            // console.log("CodeEditor useEffect serverSynced, codeReloading, view");
            setCodeTextAndStates(store.getState(), view);
            setCodeReloading(false);

            /** have to use Timeout this to make sure the code text got populated to CodeMirror first */
            setTimeout(() => {
                scrollToPrevPos(store.getState());
            }, 10);
        }
    }, [serverSynced, codeReloading, view]);

    useEffect(() => {
        try {
            if (view != null) {
                // setHTMLEventHandler(container, view, dispatch);
                //TODO: improve this
                // setGroupedLineDeco(store.getState(), view);
                setGenLineDeco(store.getState(), view);
                // console.log("CodeEditor useEffect setGenCodeLineDeco");
            }
        } catch (error) {
            console.log(error);
        }
    });

    /** this will force the CodeMirror to refresh when codeLines update. Need this to make the gutter update
     * with line status. This works but might need to find a better performant solution. */
    // useEffect(() => {
    //     if (view != null) {
    //         // view.dispatch();
    //     }
    // }, [lineStatusUpdate, mouseOverGroupID]);

    useEffect(() => {
        const state = store.getState();
        const mouseOverGroupID = state.codeEditor.mouseOverGroupID;
        console.log("change", cellCommand, state.codeEditor.mouseOverLine);

        if (view != null && cellCommand) {
            let line = null;
            if (state.codeEditor.mouseOverLine) {
                const inViewID = state.projectManager.inViewID;
                line = state.codeEditor.mouseOverLine.number;
                let activeLine: ICodeActiveLine = {
                    inViewID: inViewID || "",
                    lineNumber: line - 1,
                };
                store.dispatch(setActiveLineRedux(activeLine));
            }

            switch (cellCommand) {
                case CellCommand.RUN_CELL:
                    addToRunQueueHover(view);
                    break;
                case CellCommand.CLEAR:
                    dispatch(clearAllOutputs({ inViewID, mouseOverGroupID }));
                    break;
                case CellCommand.ADD_CELL:
                    insertBelow(CodeInsertMode.GROUP, line);
                    break;
            }
            dispatch(setCellCommand(undefined));
        }
    }, [cellCommand]);

    useEffect(() => {
        console.log("CodeEditor useEffect magicInfo ", cAssistInfo);
        handleCAssistInfoUpdate();
    }, [cAssistInfo]);

    useEffect(() => {
        console.log("CodeEditor editorRef.current");
        if (editorRef.current != null && inViewID != null && container == null) {
            setContainer(editorRef.current);
        }
    }, [inViewID, editorRef.current]);

    useEffect(() => {
        console.log("CodeEditor runQueue");
        if (runQueue.status === RunQueueStatus.STOP) {
            if (runQueue.queue.length > 0) {
                let runQueueItem = runQueue.queue[0];
                dispatch(setRunQueueStatus(RunQueueStatus.RUNNING));
                execLines(socket, view, runQueueItem);
            }
        }
    }, [runQueue]);

    useEffect(() => {
        handleCodeToInsert(codeToInsert);
    }, [codeToInsert]);

    /** handle code insertions requested by other components */
    const handleCodeToInsert = (codeToInsert: ICodeToInsertInfo | undefined) => {
        if (view && codeToInsert && inViewID)
            if (codeToInsert.status === CodeInsertStatus.TOINSERT) {
                let fromPos;
                if (codeToInsert.fromPos == null) {
                    const state = view.state;
                    const doc = view.state.doc;
                    const anchor = state.selection.ranges[0].anchor;
                    fromPos = doc.lineAt(anchor).from;
                } else {
                    fromPos = codeToInsert.fromPos;
                }
                // console.log("CodeEditor handleCodeToInsert", codeToInsert, fromPos);
                insertCodeToView(codeToInsert.code, fromPos);
                dispatch(setCodeToInsert({ ...codeToInsert, status: CodeInsertStatus.INSERTING }));
            } else if (
                codeToInsert.status === CodeInsertStatus.INSERTING &&
                codeToInsert.fromPos != null
            ) {
                // const state = view.state;
                const doc = view.state.doc;
                if (codeToInsert.mode === CodeInsertMode.GROUP) {
                    /** line inserted after fromPost */
                    const instertedLine = doc.lineAt(codeToInsert.fromPos + 1).number - 1; //** convert to 0-based */
                    let lineStatus: ICodeLineGroupStatus = {
                        inViewID: inViewID,
                        fromLine: instertedLine,
                        toLine: instertedLine + 1,
                        status: LineStatus.EDITED,
                        setGroup: SetLineGroupCommand.NEW,
                    };
                    dispatch(setLineGroupStatus(lineStatus));
                    // console.log("CodeEditor handleCodeToInsert ", lineStatus);
                } else if (codeToInsert.mode === CodeInsertMode.LINE) {
                    /** line inserted after fromPost */
                    const instertedLine = doc.lineAt(codeToInsert.fromPos + 1).number - 1; //** convert to 0-based */
                    let lineStatus: ICodeLineGroupStatus = {
                        inViewID: inViewID,
                        fromLine: instertedLine,
                        toLine: instertedLine + 1,
                        status: LineStatus.EDITED,
                        setGroup: SetLineGroupCommand.UNDEF,
                    };
                    dispatch(setLineGroupStatus(lineStatus));
                    // console.log("CodeEditor handleCodeToInsert ", lineStatus);
                } else if (codeToInsert.mode === CodeInsertMode.LINEANDGROUP) {
                    /** line inserted after fromPost */
                    const instertedLine = doc.lineAt(codeToInsert.fromPos + 1).number - 1; //** convert to 0-based */
                    let lineStatus: ICodeLineGroupStatus = {
                        inViewID: inViewID,
                        fromLine: instertedLine,
                        toLine: instertedLine + 1,
                        status: LineStatus.EDITED,
                        setGroup: SetLineGroupCommand.UNDEF,
                    };
                    dispatch(setLineGroupStatus(lineStatus));
                    lineStatus = {
                        inViewID: inViewID,
                        fromLine: instertedLine + 1,
                        toLine: instertedLine + 2,
                        status: LineStatus.EDITED,
                        setGroup: SetLineGroupCommand.NEW,
                    };
                    dispatch(setLineGroupStatus(lineStatus));

                    // console.log("CodeEditor handleCodeToInsert ", lineStatus);
                }
                // set the anchor to the inserted line
                setAnchorToPos(view, inViewID, codeToInsert.fromPos + 1);
                dispatch(setCodeToInsert(null));
            }
    };

    function insertBelow(mode: CodeInsertMode, line?: number | null): boolean {
        if (view && inViewID) {
            const codeLines = store.getState().codeEditor.codeLines[inViewID];
            const state = view.state;
            const doc = view.state.doc;
            const anchor = state.selection.ranges[0].anchor;
            let curLineNumber = 0; // 1-based
            if (line) {
                curLineNumber = line;
            } else {
                curLineNumber = doc.lineAt(anchor).number;
            }
            let fromPos: number;
            let curGroupID = codeLines[curLineNumber - 1].groupID;
            while (
                curGroupID != null &&
                curLineNumber < codeLines.length + 1 /** note that curLineNumber is 1-based */ &&
                codeLines[curLineNumber - 1].groupID === curGroupID
            ) {
                curLineNumber += 1;
            }
            if (curLineNumber === 1 || curGroupID == null) {
                /** insert from the end of the current line */
                fromPos = doc.line(curLineNumber).to;
            } else {
                /** insert from the end of the prev line */
                fromPos = doc.line(curLineNumber - 1).to;
            }
            let newCodeToInsert = {
                code: "\n",
                fromPos: fromPos,
                status: CodeInsertStatus.TOINSERT,
                mode: mode,
            };
            dispatch(setCodeToInsert(newCodeToInsert));
            console.log("CodeEditor insertGroupBelow ", newCodeToInsert);
        }
        return true;
    }

    /**
     * Any code change after initialization will be handled by this function
     * @param value
     * @param viewUpdate
     */
    function onCodeMirrorChange(value: string, viewUpdate: ViewUpdate) {
        try {
            console.log("CodeEditor onCodeMirrorChange");
            const state = store.getState();
            let inViewID = state.projectManager.inViewID;
            /** do nothing if the update is due to code reloading from external source */
            if (codeReloading) return;
            let doc = viewUpdate.state.doc;

            let serverSynced = store.getState().projectManager.serverSynced;
            if (serverSynced && inViewID) {
                const inViewCodeText = state.codeEditor.codeText[inViewID];
                let startDoc = viewUpdate.startState.doc;
                let text: string[] = doc.toJSON();
                let updatedLineCount = doc.lines - startDoc.lines;
                let changeStartLineList: Line[] = [];
                viewUpdate.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
                    changeStartLineList.push(doc.lineAt(fromA));
                });
                //currently handle only one change
                let changeStartLine = changeStartLineList[0];
                if (changeStartLineList != null) {
                    // convert the line number 0-based index, which is what we use internally
                    let changeStartLineNumber = changeStartLine.number - 1;
                    // console.log(changes);
                    // console.log('changeStartLineNumber', changeStartLineNumber);

                    if (updatedLineCount > 0) {
                        console.log(
                            "CodeEditor changeStartLine: ",
                            changeStartLine,
                            updatedLineCount,
                            inViewCodeText[changeStartLineNumber],
                            changeStartLine.text != inViewCodeText[changeStartLineNumber]
                        );
                        // Note: _getCurrentLineNumber returns line number indexed starting from 1.
                        // Convert it to 0-indexed by -1.
                        let updatedLineInfo: ILineUpdate = {
                            inViewID: inViewID,
                            text: text,
                            updatedStartLineNumber: changeStartLineNumber,
                            updatedLineCount: updatedLineCount,
                            startLineChanged:
                                changeStartLine.text != inViewCodeText[changeStartLineNumber],
                        };
                        dispatch(updateLines(updatedLineInfo));
                    } else if (updatedLineCount < 0) {
                        console.log(
                            "CodeEditor changeStartLine: ",
                            changeStartLine,
                            inViewCodeText[changeStartLineNumber],
                            changeStartLine.text != inViewCodeText[changeStartLineNumber]
                        );
                        // Note 1: _getCurrentLineNumber returns line number indexed starting from 1.
                        // Convert it to 0-indexed by -1.
                        let updatedLineInfo: ILineUpdate = {
                            inViewID: inViewID,
                            text: text,
                            updatedStartLineNumber: changeStartLineNumber,
                            updatedLineCount: updatedLineCount,
                            startLineChanged:
                                changeStartLine.text != inViewCodeText[changeStartLineNumber],
                        };
                        dispatch(updateLines(updatedLineInfo));
                    } else {
                        let updatedLineInfo: ILineUpdate = {
                            inViewID: inViewID,
                            text: text,
                            updatedStartLineNumber: changeStartLineNumber,
                            updatedLineCount: updatedLineCount,
                            startLineChanged: true,
                            // changeStartLine.text != inViewCodeText[changeStartLineNumber],
                        };
                        dispatch(updateLines(updatedLineInfo));
                    }
                    handleCAsisstTextUpdate();
                    // setCMUpdatedCounter(cmUpdatedCounter + 1);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * This function is called inside onCodeMirrorChange.
     * It will check if there is new cAssist information in the code text.
     * If yes, generate new cAssistInfo which will be processed later in processCAssistInfo
     */
    const handleCAsisstTextUpdate = () => {
        const updateCAssistInfoWithGenCode = (
            inViewID: string,
            cAssistInfo: ICAssistInfo,
            codeGenResult: ICodeGenResult
        ) => {
            console.log("CodeEditor cAssist updateCAssistInfoWithGenCode: ", codeGenResult);
            if (codeGenResult && !codeGenResult.error && cAssistInfo) {
                let lineCount: number | undefined = codeGenResult.lineCount;
                cAssistInfo.insertedLinesInfo.toLine =
                    cAssistInfo.insertedLinesInfo.fromLine + (lineCount ? lineCount : 0);
                cAssistInfo.genCode = codeGenResult.code;
                cAssistInfo.cAssistExtraOpts = codeGenResult.extraOpts;
                console.log(
                    "CodeEditor cAssist updateCAssistInfoWithGenCode cAssistInfo: ",
                    cAssistInfo
                );
                // setCAssistInfo(cAssistInfo);
                let cAssistInfoRedux: ICAssistInfoRedux = {
                    inViewID: inViewID,
                    cAssistLineNumber: cAssistInfo.cAssistLineNumber,
                    cAssistInfo: cAssistInfo,
                };
                dispatch(updateCAssistInfo(cAssistInfoRedux));
            }
        };

        if (view) {
            let state = view.state;
            let inViewID = store.getState().projectManager.inViewID;
            if (state && inViewID) {
                let tree = state.tree;
                let curPos = state.selection.ranges[0].anchor;
                let cursor = tree.cursor(curPos, 0);

                if (
                    [
                        CNextDataFrameExpresion,
                        CNextXDimColumnNameExpression,
                        CNextYDimColumnNameExpression,
                    ].includes(cursor.type.id)
                ) {
                    /**
                     * Move the cursor up to CNextPlotExpression so we can parse the whole cnext text and
                     * generate the new inline plot command
                     * */
                    cursor.parent();
                    cursor.parent();
                }
                console.log("CodeEditor cAssist handleCAsisstTextUpdate tree: ", cursor.toString());
                if (cursor.type.id === CNextPlotExpression) {
                    let text: string = state.doc.toString();
                    let newMagicText: string = text.substring(cursor.from, cursor.to);
                    let generatedLine = view.state.doc.lineAt(cursor.to);
                    console.log(
                        `CodeEditor cAssist magicsPreProcess current cAssistInfo: `,
                        cAssistInfo,
                        newMagicText
                    );
                    // console.log(
                    //     `CodeEditor cAssist magicsPreProcess new magic text: `,
                    //     newMagicText
                    // );
                    /**
                     * Check the status here to avoid circular update because this code will generate
                     * new content added to the editor, which will trigger onCMChange -> handleCAsisstTextUpdate.
                     * Note: if cAssistInfo status is CodeGenStatus.INSERTED, we also reset the cAssistInfo content
                     * */
                    if (
                        cAssistInfo == null ||
                        (cAssistInfo && cAssistInfo.status === CodeInsertStatus.INSERTED)
                    ) {
                        let parsedCAText = parseCAssistText(cursor, text);
                        let newCAssistInfo: ICAssistInfo | undefined = {
                            status: CodeInsertStatus.INSERTING,
                            cAssistText: newMagicText,
                            plotData: parsedCAText,
                            /** generatedLine.number in state.doc is 1 based, so convert to 0 base
                             * and minus another 1 to get the line where cAssist's text is */
                            cAssistLineNumber: generatedLine.number - 2,
                            insertedLinesInfo: {
                                fromLine: generatedLine.number - 1,
                                fromPos: generatedLine.from,
                                toLine: generatedLine.number /** this will need to be replaced when the code is generated */,
                            },
                        };

                        let result: Promise<ICodeGenResult> | ICodeGenResult =
                            cAssistGetPlotCommand(socket, parsedCAText);
                        if (isPromise(result)) {
                            result.then((codeGenResult: ICodeGenResult) => {
                                updateCAssistInfoWithGenCode(
                                    inViewID,
                                    newCAssistInfo,
                                    codeGenResult
                                );
                            });
                        } else {
                            let codeGenResult: ICodeGenResult = result;
                            updateCAssistInfoWithGenCode(inViewID, newCAssistInfo, codeGenResult);
                        }
                    } else if (
                        cAssistInfo &&
                        cAssistInfo.status === CodeInsertStatus.INSERTING &&
                        cAssistInfo.insertedLinesInfo
                    ) {
                        /** The second time _handleMagic being called is after new code has been inserted */
                        /** convert line number to 0-based */
                        let lineStatus: ICodeLineGroupStatus = {
                            inViewID: inViewID,
                            fromLine: cAssistInfo.insertedLinesInfo.fromLine,
                            toLine: cAssistInfo.insertedLinesInfo.toLine,
                            status: LineStatus.EDITED,
                            generated: true,
                            setGroup: SetLineGroupCommand.NEW,
                        };
                        dispatch(setLineGroupStatus(lineStatus));

                        // console.log('Magics after inserted lineStatus: ', lineStatus);
                        let newCAssistInfo = { ...cAssistInfo, status: CodeInsertStatus.INSERTED };
                        // newCAssistInfo.status = CodeInsertStatus.INSERTED;
                        console.log("CodeEditor cAssist after inserted: ", newCAssistInfo);
                        // setCAssistInfo(newCAssistInfo);
                        let cAssistInfoRedux: ICAssistInfoRedux = {
                            inViewID: inViewID,
                            cAssistLineNumber: newCAssistInfo.cAssistLineNumber,
                            cAssistInfo: newCAssistInfo,
                        };
                        dispatch(updateCAssistInfo(cAssistInfoRedux));
                    }
                }
            }
        }
    };

    // useEffect(() => {
    //     handleCAsisstTextUpdate();
    // }, [cmUpdatedCounter]);

    function insertCodeToView(code: string, insertFrom: number) {
        if (view) {
            let state: EditorState = view.state;
            let transactionSpec: TransactionSpec = {
                changes: {
                    from: insertFrom,
                    to: insertFrom, // only insert not replace anything
                    insert: code,
                },
            };
            let transaction: Transaction = state.update(transactionSpec);
            view.dispatch(transaction);
        }
    }

    /**
     * This function create transaction to update codemirror view with generated code.
     * This has to be done async after onCodeMirrorUpdate has been complete.
     */
    const handleCAssistInfoUpdate = () => {
        /**
         * The replacement range will be identified from the line group that contains cAssistInfo.insertedLinesInfo.fromLine
         * If that line is not gerated, then just insertFrom and insertTo will have the same value, else the insert range
         * will replace the previous insert range.
         * @param codeGenResult
         */
        const insertCode = (genCode: string) => {
            if (view && cAssistInfo && cAssistInfo.insertedLinesInfo) {
                // let state: EditorState = view.state;
                // let genCode: string = codeGenResult.code;
                let fromLine = cAssistInfo.insertedLinesInfo.fromLine;
                let insertFrom = cAssistInfo.insertedLinesInfo.fromPos; //magicInfo.line.from;
                let codeLines: ICodeLine[] | null = getCodeLine(store.getState());
                if (codeLines) {
                    let isLineGenerated = codeLines[fromLine].generated;
                    let lineRange = getLineRangeOfGroup(codeLines, fromLine);
                    let codeText = getCodeText(store.getState());
                    let insertTo: number = insertFrom;
                    if (isLineGenerated) {
                        for (let i = lineRange.fromLine; i < lineRange.toLine; i++) {
                            console.log(
                                "CodeEditor Magic codeText length: ",
                                codeText[i].length,
                                insertTo
                            );
                            insertTo += codeText[i].length;
                        }
                        /** add the number of the newline character between fromLine to toLine excluding the last one*/
                        insertTo += lineRange.toLine - lineRange.fromLine - 1;
                    }

                    console.log(
                        "CodeEditor Magic insert range: ",
                        insertFrom,
                        insertTo,
                        lineRange,
                        fromLine,
                        codeText
                    );
                    insertCodeToView(isLineGenerated ? genCode : genCode + LINE_SEP, insertFrom);
                }
            }
        };

        if (view && cAssistInfo) {
            if (cAssistInfo.status === CodeInsertStatus.INSERTING) {
                if (cAssistInfo.genCode !== undefined) {
                    insertCode(cAssistInfo.genCode);
                }
            } else if (
                cAssistInfo.status === CodeInsertStatus.INSERTED &&
                cAssistInfo.insertedLinesInfo !== undefined
            ) {
                setFlashingEffect(store.getState(), view, cAssistInfo);
            }
        }
    };

    return (
        <StyledCodeEditor data-cy={CypressIds.codeEditor} ref={editorRef}>
            {console.log("CodeEditor render")}
        </StyledCodeEditor>
    );
};

export default CodeEditor;
