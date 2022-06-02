import React, { Fragment, useEffect, useRef, useState } from "react";
import { IMessage, WebAppEndpoint, ContentType, CommandName } from "../../interfaces/IApp";
import { useSelector, useDispatch } from "react-redux";
import { setTableData } from "../../../redux/reducers/DataFramesRedux";
import store, { RootState } from "../../../redux/store";
import socket from "../Socket";
import { basicSetup } from "../../codemirror/basic-setup";
import { bracketMatching } from "@codemirror/matchbrackets";
import { defaultHighlightStyle } from "@codemirror/highlight";
import { python } from "../../codemirror/grammar/lang-cnext-python";
import { sql } from "@codemirror/lang-sql";
import { json } from "@codemirror/lang-json";
import { EditorView, keymap, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { completionKeymap } from "../../codemirror/autocomplete-lsp/autocomplete";
import { foldService, indentUnit } from "@codemirror/language";
import { lineNumbers } from "@codemirror/gutter";
import { StyledCodeEditor } from "../StyledComponents";
import { languageServer } from "../../codemirror/autocomplete-lsp/index.js";
import {
    addResult,
    updateLines,
    setLineStatus,
    setActiveLine,
    setLineGroupStatus,
    setRunQueue as setReduxRunQueue,
    updateCAssistInfo,
    compeleteRunQueue,
    setCodeToInsert,
    clearRunQueueTextOutput,
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
} from "../../interfaces/ICodeEditor";
import { EditorState, Extension, Transaction, TransactionSpec } from "@codemirror/state";
import { useCodeMirror } from "@uiw/react-codemirror";
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
    getRunningCommandContent,
    getLineRangeOfGroup,
    getNonGeneratedLinesInRange,
    isPromise,
    // resetEditorState,
    scrollToPrevPos,
    setFlashingEffect,
    setGenLineDeco,
    setGroupedLineDeco,
    setHTMLEventHandler,
    setViewCodeText,
    textShouldBeExec as isExpression,
} from "./libCodeEditor";
import { cAssistExtraOptsPlugin, parseCAssistText } from "./libCAssist";
import CypressIds from "../tests/CypressIds";

const pyLanguageServer = languageServer({
    serverUri: "ws://localhost:3001/python",
    rootUri: "file:///",
    documentUri: "file:///",
    languageId: "python",
});

const CodeEditor = () => {
    // const CodeEditor = (props: any) => {
    /** This state is used to indicate server sync status. Code doc need to be resynced only
     * when it is first opened or being selected to be in view */
    // const [serverSynced, setServerSynced] = useState(false);
    const serverSynced = useSelector((state: RootState) => state.projectManager.serverSynced);

    const inViewID = useSelector((state: RootState) => state.projectManager.inViewID);

    // using this to trigger refresh in gutter
    const codeText = useSelector((state: RootState) => getCodeText(state));

    const runQueue = useSelector((state: RootState) => state.codeEditor.runQueue);

    const cAssistInfo = useSelector((state: RootState) => state.codeEditor.cAssistInfo);

    const codeToInsert = useSelector((state: RootState) => state.codeEditor.codeToInsert);

    const shortcutKeysConfig = useSelector(
        (state: RootState) => state.projectManager.configs.code_editor_shortcut
    );

    const lineStatusUpdate = useSelector(
        (state: RootState) => state.codeEditor.lineStatusUpdateCount
    );

    // const [cmUpdatedCounter, setCMUpdatedCounter] = useState(0);

    // const [cAssistInfo, setCAssistInfo] = useState<ICAssistInfo|undefined>();
    const dispatch = useDispatch();
    const editorRef = useRef();

    /** this state is used to indicate when the codemirror view needs to be loaded from internal source
     * i.e. from codeText */
    const [codeReloading, setCodeReloading] = useState<boolean>(true);

    const getGroupedLineFoldRange = (state: EditorState, lineStart: number, lineEnd: number) => {
        if (state && inViewID) {
            const codeLines = store.getState().codeEditor.codeLines[inViewID];
            const doc = state.doc;
            /** compare doc and codeLines to avoid bug when codeLines has been loaded but doc has not */
            if (codeLines != null && doc.lines === codeLines.length) {
                const startLine: number = doc.lineAt(lineStart).number - 1; // 0-based
                let endLine: number = startLine;
                let curGroupID = codeLines[startLine].groupID;
                console.log("CodeEditor getGroupedLineFoldRange: ", lineStart, lineEnd, codeLines);
                if (
                    curGroupID != null &&
                    (startLine === 0 ||
                        (startLine > 0 && curGroupID != codeLines[startLine - 1].groupID))
                ) {
                    /** start of a group */
                    while (
                        endLine < codeLines.length - 1 &&
                        codeLines[endLine + 1].groupID === curGroupID
                    ) {
                        endLine += 1;
                    }
                    if (lineEnd < doc.line(endLine + 1).to) {
                        return { from: lineEnd, to: doc.line(endLine + 1).to }; // convert to 1-based
                    }
                }
            }
        }
        return null;
    };

    const defaultExtensions = [
        basicSetup,
        lineNumbers(),
        editStatusGutter(store.getState().projectManager.inViewID, getCodeLine(store.getState())),
        bracketMatching(),
        defaultHighlightStyle.fallback,
        keymap.of([
            { key: shortcutKeysConfig.run_queue, run: setRunQueue },
            { key: shortcutKeysConfig.set_group, run: setGroup },
            { key: shortcutKeysConfig.set_ungroup, run: setUnGroup },
            {
                key: shortcutKeysConfig.insert_group_below,
                run: () => insertBelow(CodeInsertMode.GROUP),
            },
            {
                key: shortcutKeysConfig.insert_line_below,
                run: () => insertBelow(CodeInsertMode.LINE),
            },
            ...completionKeymap,
        ]),
        indentUnit.of("    "),
        foldService.of(getGroupedLineFoldRange),
    ];

    const getLangExtenstions = (inViewID: string | null) => {
        if (inViewID == null) return [];
        const nameSplit = inViewID.split(".");
        const fileExt = nameSplit[nameSplit.length - 1];
        const fileLangExtensions: { [name: string]: Extension[] } = {
            py: [python(), pyLanguageServer, cAssistExtraOptsPlugin.extension],
            sql: [sql()],
            json: [json()],
        };
        return fileLangExtensions[fileExt];
    };

    const [langExtensions, setLangExtensions] = useState(getLangExtenstions(inViewID));

    const { view, container, setContainer } = useCodeMirror({
        basicSetup: false,
        container: editorRef.current,
        extensions: [...defaultExtensions, ...langExtensions],
        height: "100%",
        theme: "light",
        onChange: onCodeMirrorChange,
    });

    const resetEditorState = (inViewID: string, view: EditorView | undefined) => {
        if (view != null) {
            let fileLangExtensions = getLangExtenstions(inViewID);
            setLangExtensions(fileLangExtensions);
            view.setState(EditorState.create({ doc: "" }));
        }
    };

    // function getCodeLineStatus(state: RootState) {
    //     let inViewID = state.projectManager.inViewID;
    //     if (inViewID) {
    //         return state.codeEditor.codeLines[inViewID];
    //     }
    //     return null;
    // }
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
        socket.emit("ping", WebAppEndpoint.CodeEditor);
        socket.on(WebAppEndpoint.CodeEditor, (result: string) => {
            console.log("CodeEditor got result ", result);
            // console.log("CodeEditor: got results...");
            try {
                let codeOutput: IMessage = JSON.parse(result);
                let inViewID = store.getState().projectManager.inViewID;
                if (inViewID) {
                    handleResultData(codeOutput);
                    if (
                        codeOutput.metadata?.msg_type === "execute_reply" &&
                        codeOutput.content?.status != null
                    ) {
                        let lineStatus: ICodeLineStatus
                        if (codeOutput.content?.status === 'ok') {
                            lineStatus = {
                                inViewID: inViewID,
                                lineRange: codeOutput.metadata?.line_range,
                                status: LineStatus.EXECUTED_SUCCESS,
                            };
                        } else {
                            lineStatus = {
                                inViewID: inViewID,
                                lineRange: codeOutput.metadata?.line_range,
                                status: LineStatus.EXECUTED_FAILED,
                            };
                        }
                        // TODO: check the status output
                        // console.log('CodeEditor socket ', lineStatus);
                        dispatch(setLineStatus(lineStatus));
                        /** set active code line to be the current line after it is excuted so the result will be show accordlingly
                         * not sure if this is a good design but will live with it for now */
                        let activeLine: ICodeActiveLine = {
                            inViewID: inViewID,
                            lineNumber: codeOutput.metadata.line_range.fromLine,
                        };
                        dispatch(setActiveLine(activeLine));
                        dispatch(compeleteRunQueue(null));
                    }
                }
            } catch {}
        });
    };

    useEffect(() => {
        console.log("CodeEditor init");
        socketInit();
        return () => {
            socket.off(WebAppEndpoint.CodeEditor);
        };
    }, []);

    /**
     * FIXME: This is used to set onmousedown event handler. This does not seem to be the best way.
     * Also set the SOLID effect for generated lines
     * */

    useEffect(() => {
        console.log("CodeEditor useEffect container", container);
        if (container && view) {
            setHTMLEventHandler(container, view, dispatch);
        }
    }, [container, view]);

    /**
     * Reset the code editor state when the doc is selected to be in view
     * */
    useEffect(() => {
        console.log("CodeEditor useEffect inViewID ", inViewID);
        if (inViewID != null) {
            resetEditorState(inViewID, view);
            setCodeReloading(true);
        }
        setLangExtensions(getLangExtenstions(inViewID));
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
        // console.log('CodeEditor useEffect codeText', view, codeText[0], serverSynced);
        if (serverSynced && codeReloading && view) {
            // make sure that codeeditor content is set first before setting codeReloading to false to avoid
            // unnecessary calls to updatedLines
            setViewCodeText(store.getState(), view);
            setCodeReloading(false);
            scrollToPrevPos(store.getState());
        }
    }, [serverSynced, codeReloading, view]);

    useEffect(() => {
        try {
            setHTMLEventHandler(container, view, dispatch);
            //TODO: improve this
            setGroupedLineDeco(store.getState(), view);
            setGenLineDeco(store.getState(), view);
            console.log("CodeEditor useEffect setGenCodeLineDeco");
        } catch {}
    });

    /** this will force the CodeMirror to refresh when codeLines update. Need this to make the gutter update
     * with line status. This works but might need to find a better performant solution. */
    useEffect(() => {
        if (view) {
            view.dispatch();
        }
    }, [lineStatusUpdate]);

    useEffect(() => {
        console.log("CodeEditor useEffect magicInfo ", cAssistInfo);
        handleCAssistInfoUpdate();
    }, [cAssistInfo]);

    useEffect(() => {
        console.log(
            "CodeEditor useEffect editorRef.current inViewID container",
            editorRef.current,
            inViewID,
            container
        );
        if (editorRef.current != null) {
            if (inViewID != null) {
                if (container == null) {
                    setContainer(editorRef.current);
                }
            } else {
                setContainer(null);
            }
        }
    }, [inViewID, editorRef.current]);

    useEffect(() => {
        if (runQueue.status !== RunQueueStatus.STOP) {
            let state = store.getState();
            let inViewID = state.projectManager.inViewID;
            dispatch(clearRunQueueTextOutput(inViewID));
            execLines();
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
                dispatch(setCodeToInsert(null));
            }
    };

    function insertBelow(mode: CodeInsertMode): boolean {
        if (view && inViewID) {
            const codeLines = store.getState().codeEditor.codeLines[inViewID];
            const state = view.state;
            const doc = view.state.doc;
            const anchor = state.selection.ranges[0].anchor;
            let curLineNumber = doc.lineAt(anchor).number; // 1-based
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

    const createMessage = (content: IRunningCommandContent) => {
        let message: IMessage = {
            webapp_endpoint: WebAppEndpoint.CodeEditor,
            command_name: CommandName.exec_line,
            seq_number: 1,
            content: content.content,
            type: ContentType.STRING,
            error: false,
            metadata: { line_range: content.lineRange },
        };

        return message;
    };

    const sendMessage = (content: IRunningCommandContent) => {
        const message = createMessage(content);
        console.log(`${message.webapp_endpoint} send message: `, message);
        socket.emit(message.webapp_endpoint, JSON.stringify(message));
    };

    function setRunQueue(): boolean {
        const executorID = store.getState().projectManager.executorID;
        let inViewID = store.getState().projectManager.inViewID;
        // if (view && inViewID === executorID) {
        if (view) {
            const doc = view.state.doc;
            const state = view.state;
            const anchor = state.selection.ranges[0].anchor;
            let lineAtAnchor = doc.lineAt(anchor);
            let text: string = lineAtAnchor.text;
            let lineNumberAtAnchor = lineAtAnchor.number - 1;
            /** convert to 0-based which is used internally */
            let fromLine = doc.lineAt(anchor).number - 1;
            let lineRange: ILineRange | undefined;
            let inViewId = store.getState().projectManager.inViewID;

            if (inViewId) {
                let codeLines: ICodeLine[] | null = getCodeLine(store.getState());
                if (text.startsWith(CASSIST_STARTER)) {
                    /** Get line range of group starting from next line */
                    /** this if condition is looking at the next line*/
                    if (codeLines && codeLines[lineNumberAtAnchor + 1].generated) {
                        lineRange = getLineRangeOfGroup(codeLines, lineNumberAtAnchor + 1);
                    }
                } else {
                    /** Get line range of group starting from the current line */
                    /** convert to 0-based */
                    if (codeLines) lineRange = getLineRangeOfGroup(codeLines, lineNumberAtAnchor);
                }

                if (lineRange) {
                    console.log("CodeEditor setRunQueue: ", lineRange);
                    dispatch(setReduxRunQueue(lineRange));
                }
            }
        } else {
            console.log("CodeEditor can't execute code on none executor file!");
        }
        return true;
    }

    const execLines = () => {
        let inViewID = store.getState().projectManager.inViewID;
        if (inViewID && view && runQueue.status === RunQueueStatus.RUNNING) {
            const doc = view.state.doc;
            let rangeToRun: ILineRange[];
            if (process.env.REACT_APP_MAIN_KERNEL === "base_kernel") {
                /** if the last line is an Expression instead of a Statement then separate it out.
                 * The server will 'exec' every group of multiple lines. And will either 'exec' or 'eval' single line
                 * This is not a perfect solution but working for now */
                if (isExpression(doc.line(runQueue.toLine).text)) {
                    rangeToRun = [
                        {
                            fromLine: runQueue.fromLine,
                            toLine: runQueue.toLine - 1,
                        },
                        { fromLine: runQueue.toLine - 1, toLine: runQueue.toLine },
                    ];
                } else {
                    rangeToRun = [{ fromLine: runQueue.fromLine, toLine: runQueue.toLine }];
                }
            } else {
                /** No need to handle range line, because we use IPython kernel to execute lines. It help us to handle this  */
                rangeToRun = [{ fromLine: runQueue.fromLine, toLine: runQueue.toLine }];
            }

            console.log("CodeEditor execLines: ", rangeToRun);
            for (let lineRange of rangeToRun) {
                let content: IRunningCommandContent | undefined = getRunningCommandContent(
                    view,
                    lineRange
                );
                if (content && inViewID) {
                    console.log("CodeEditor execLines: ", content, lineRange);
                    // let content: IRunningCommandContent = {lineRange: runQueue.runningLine, content: text};
                    sendMessage(content);
                    let lineStatus: ICodeLineStatus = {
                        inViewID: inViewID,
                        lineRange: content.lineRange,
                        status: LineStatus.EXECUTING,
                    };
                    dispatch(setLineStatus(lineStatus));
                }
            }
        }
    };

    /**
     * Do not allow grouping involed generated lines
     */
    function setGroup(): boolean {
        if (view) {
            let range = view.state.selection.asSingle().ranges[0];
            let lineRange = getNonGeneratedLinesInRange(
                getCodeLine(store.getState()),
                view,
                range.from,
                range.to
            );
            let inViewID = store.getState().projectManager.inViewID;
            console.log("CodeEditor setGroup: ", lineRange, range);
            if (inViewID && lineRange && lineRange.toLine > lineRange.fromLine) {
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
        if (view) {
            const doc = view.state.doc;
            const anchor = view.state.selection.asSingle().ranges[0].anchor;
            let lineAtAnchor = doc.lineAt(anchor);
            let reduxState = store.getState();
            let inViewID = reduxState.projectManager.inViewID;
            if (inViewID) {
                let codeLines = reduxState.codeEditor.codeLines[inViewID];
                /** minus 1 to convert to 0-based */
                let lineRange = getLineRangeOfGroup(codeLines, lineAtAnchor.number - 1);
                console.log("CodeEditor setUnGroup: ", lineRange);
                if (inViewID && lineRange && lineRange.toLine > lineRange.fromLine) {
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
    function onCodeMirrorChange(value: string, viewUpdate: ViewUpdate) {
        try {
            console.log("CodeEditor onCodeMirrorChange");
            const state = store.getState();
            let inViewID = store.getState().projectManager.inViewID;
            const inViewCodeText = state.codeEditor.codeText[inViewID];
            /** do nothing if the update is due to code reloading from external source */
            if (codeReloading) return;
            let doc = viewUpdate.state.doc;
            let serverSynced = store.getState().projectManager.serverSynced;
            // viewUpdate.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
            //     console.log(
            //         "CodeEditor render onCodeMirrorChange",
            //         fromA,
            //         toA,
            //         fromB,
            //         toB,
            //         inserted
            //     );
            // });
            if (serverSynced && inViewID) {
                // let startText = viewUpdate.startState.doc.text;
                // let text = viewUpdate.state.doc.text;
                let startDoc = viewUpdate.startState.doc;
                // let doc = viewUpdate.state.doc
                let text: string[] = doc.toJSON();
                // let startLineLength = (typeof startDoc == TextLeaf ? startDoc.text.length : startDoc.lines)
                let updatedLineCount = doc.lines - startDoc.lines;
                let changeStartLine;
                //currently handle only one change
                viewUpdate.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
                    changeStartLine = doc.lineAt(fromA);
                });

                // convert the line number 0-based index, which is what we use internally
                let changeStartLineNumber = changeStartLine.number - 1;
                // console.log(changes);
                // console.log('changeStartLineNumber', changeStartLineNumber);

                if (updatedLineCount > 0) {
                    console.log(
                        "changeStartLine: ",
                        changeStartLine,
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
                    // let lineStatus: ICodeLineStatus;
                    // lineStatus = {
                    //     inViewID: inViewID,
                    //     text: text,
                    //     lineRange: {
                    //         fromLine: changeStartLineNumber,
                    //         toLine: changeStartLineNumber + 1,
                    //     },
                    //     status: LineStatus.EDITED,
                    //     generated: false,
                    // };
                    // dispatch(setLineStatus(lineStatus));
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
        } catch (error) {
            throw error;
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
                            cAssistGetPlotCommand(parsedCAText);
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
