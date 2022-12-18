import { DiffEditor, useMonaco } from "@monaco-editor/react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import store, { RootState } from "../../../../redux/store";
import {
    execLines,
    foldAll,
    unfoldAll,
    getMainEditorModel,
    setCodeTextAndStates,
    setHTMLEventHandler,
    setLineStatus,
    getCodeText,
    deleteCellHover,
    runCellAboveGroup,
    runCellBelowGroup,
    runAllCell,
    setGroup,
    setUnGroup,
    setWidgetOpacity,
    addText,
    sendTextToOpenai,
    sendOpenAi,
} from "./libCodeEditor";
import { setCellWidgets } from "./libCellWidget";
import { setCellDeco } from "./libCellDeco";
import { MonacoEditor as StyledMonacoEditor } from "../styles";
import {
    CellCommand,
    CodeInsertMode,
    ICodeLineGroupStatus,
    ICodeResultMessage,
    ICodeToInsertInfo,
    ILineUpdate,
    LineStatus,
    RunQueueStatus,
    SetLineGroupCommand,
} from "../../../interfaces/ICodeEditor";
import {
    addResult,
    clearAllOutputs,
    clearRunQueue,
    removeFirstItemFromRunQueue,
    setCellCommand,
    setRunQueueStatus,
    updateLines,
    setActiveLine as setActiveLineRedux,
    setLineGroupStatus,
    setViewStateEditor,
} from "../../../../redux/reducers/CodeEditorRedux";
import { IMessage, WebAppEndpoint } from "../../../interfaces/IApp";
import {
    addToRunQueueHoverCell,
    addToRunQueueHoverLine,
    addToRunQueueMoveDown,
    getLineRangeOfGroup,
} from "./libRunQueue";
import { SocketContext } from "../../Socket";
import { getCellFoldRange } from "./libCellFold";
import { CodeInsertStatus } from "../../../interfaces/ICAssist";
// import  Diff  from "diff";
const Diff = require("diff");
import { PythonLanguageClient, LanguageProvider } from "./languageClient";

const CodeEditor = ({ stopMouseEvent }) => {
    const socket = useContext(SocketContext);

    const monaco = useMonaco();
    const textToOpenAI = useSelector((state: RootState) => state.codeEditor.textToOpenAI);
    const openaiUpdateSignal = useSelector(
        (state: RootState) => state.codeEditor.openaiUpdateSignal
    );

    const textOpenai = useSelector((state: RootState) => state.codeEditor.textOpenai);
    const codeTextDiffView = useSelector((state: RootState) => state.codeEditor.codeTextDiffView);
    const diffView = useSelector((state: RootState) => state.codeEditor.diffView);
    const codeTextDiffUpdateSignal = useSelector(
        (state: RootState) => state.codeEditor.codeTextDiffUpdateSignal
    );

    const [original, setOriginal] = useState(``);
    const [modified, setModified] = useState(``);

    //applyPatch
    useEffect(() => {
        if (codeTextDiffView.text && codeTextDiffView.text.length > 0) {
            const codeTextDiff = codeTextDiffView.text.join("\n");
            setModified(codeTextDiff);
            const reverse_gitpatch = codeTextDiffView.diff;
            const applyPatch = Diff.applyPatch(codeTextDiff, reverse_gitpatch);
            setOriginal(applyPatch);
        }
    }, [codeTextDiffUpdateSignal]);

    const serverSynced = useSelector((state: RootState) => state.projectManager.serverSynced);
    const executorRestartCounter = useSelector(
        (state: RootState) => state.executorManager.executorRestartSignal
    );
    const executorInterruptSignal = useSelector(
        (state: RootState) => state.executorManager.executorInterruptSignal
    );
    const inViewID = useSelector((state: RootState) => state.projectManager.inViewID);

    const inViewIDUPdateSignal = useSelector(
        (state: RootState) => state.projectManager.inViewIDUpdateSignal
    );
    /** this is used to save the state such as scroll pos and folding status */
    const [curInViewID, setCurInViewID] = useState<string | null>(null);
    const [oldState, setOldState] = useState<boolean>(false);
    const activeProjectID = useSelector(
        (state: RootState) => state.projectManager.activeProject?.id
    );
    const saveViewStateEditor = useSelector(
        (state: RootState) => state.codeEditor.saveViewStateEditor
    );
    /** using this to trigger refresh in gutter */
    const codeText = useSelector((state: RootState) => getCodeText(state));

    const cellAssocUpdateCount = useSelector(
        (state: RootState) => state.codeEditor.cellAssocUpdateCount
    );
    const runQueue = useSelector((state: RootState) => state.codeEditor.runQueue);
    // const cAssistInfo = useSelector((state: RootState) => state.codeEditor.cAssistInfo);
    // const codeToInsert = useSelector((state: RootState) => state.codeEditor.codeToInsert);
    const [codeToInsert, setCodeToInsert] = useState<ICodeToInsertInfo | null>(null);

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

    /** this state is used to indicate when the codemirror view needs to be loaded from internal source
     * i.e. from codeText */
    const [codeReloading, setCodeReloading] = useState<boolean>(true);

    const [editor, setEditor] = useState(null);

    const [pyLanguageClient, setLanguageClient] = useState<any>(null);

    const insertCellBelow = (mode: CodeInsertMode, ln0based: number | null): boolean => {
        let model = getMainEditorModel(monaco);
        let lnToInsertAfter;
        let state = store.getState();
        const inViewID = state.projectManager.inViewID;
        let posToInsertAfter;

        if (ln0based) {
            lnToInsertAfter = ln0based + 1;
        } else {
            lnToInsertAfter = editor.getPosition().lineNumber;
        }

        if (model && inViewID) {
            const codeLines = state.codeEditor.codeLines[inViewID];
            let curGroupID = codeLines[lnToInsertAfter - 1]?.groupID;

            while (
                curGroupID != null &&
                lnToInsertAfter <
                    codeLines.length + 1 /** note that lnToInsertAfter is 1-based */ &&
                codeLines[lnToInsertAfter - 1].groupID === curGroupID
            ) {
                lnToInsertAfter += 1;
            }

            if (lnToInsertAfter === 1 || curGroupID == null) {
                /** insert from the end of the current line */
                posToInsertAfter = model?.getLineLength(lnToInsertAfter) + 1;
            } else {
                /** insert from the end of the prev line */
                lnToInsertAfter -= 1;
                posToInsertAfter = model?.getLineLength(lnToInsertAfter) + 1;
            }
            // console.log(
            //     "Monaco lnToInsertAfter posToInsertAfter",
            //     lnToInsertAfter,
            //     posToInsertAfter
            // );
            let range = new monaco.Range(
                lnToInsertAfter,
                posToInsertAfter,
                lnToInsertAfter,
                posToInsertAfter
            );
            let id = { major: 1, minor: 1 };
            let text = "\n";
            var op = { identifier: id, range: range, text: text, forceMoveMarkers: true };
            editor.executeEdits("insertCellBelow", [op]);

            setCodeToInsert({
                code: "",
                /** fromLine is 0-based while lnToInsertAfter is 1-based
                 * so setting fromLine to lnToInsertAfter means fromLine will
                 * point to the next line */
                fromLine: lnToInsertAfter,
                status: CodeInsertStatus.INSERTING,
                mode: mode,
            });
        }
        return true;
    };

    /** this is called after the code has been inserted to monaco */
    useEffect(() => {
        if (codeToInsert?.status === CodeInsertStatus.INSERTING && codeToInsert.fromLine) {
            let lineStatus: ICodeLineGroupStatus = {
                inViewID: inViewID,
                fromLine: codeToInsert.fromLine,
                toLine: codeToInsert.fromLine + 1,
                status: LineStatus.EDITED,
                setGroup:
                    codeToInsert.mode === CodeInsertMode.GROUP
                        ? SetLineGroupCommand.NEW
                        : SetLineGroupCommand.UNDEF,
            };
            dispatch(setLineGroupStatus(lineStatus));
            setCodeToInsert(null);
        }
    }, [cellAssocUpdateCount]);

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
                    setWidgetOpacity(codeOutput?.metadata?.groupID, "1");
                    if (
                        codeOutput.metadata?.msg_type === "execute_reply" &&
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

    useEffect(() => {
        console.log("CodeEditor mount");
        socketInit();
        // resetEditorState(inViewID, view);
        return () => {
            console.log("CodeEditor unmount");
            socket?.off(WebAppEndpoint.CodeEditor);
        };
    }, []);

    useEffect(() => {
        // console.log("CodeEditor useEffect container view", container, view);
        if (monaco && inViewID) {
            const nameSplit = inViewID.split(".");
            const fileExt = nameSplit[nameSplit.length - 1];
            const languageID = LanguageProvider[fileExt];
            monaco.languages.register({ id: languageID });

            // TODO: make folding for JSON code
            monaco.languages.registerFoldingRangeProvider(languageID, {
                provideFoldingRanges: (model, context, token) => getCellFoldRange(),
            });

            // TODO: init LS for another code [json,sql]
            if (languageID === LanguageProvider["py"]) {
                const path = store.getState().projectManager.activeProject?.path;
                const pyLanguageServer = {
                    serverUri: "ws://" + process.env.NEXT_PUBLIC_SERVER_SOCKET_ENDPOINT,
                    rootUri: "file:///" + path,
                    documentUri: "file:///" + path,
                    languageId: languageID,
                };
                let pyLanguageClient = new PythonLanguageClient(pyLanguageServer, monaco, socket);
                setLanguageClient(pyLanguageClient);
                pyLanguageClient.setupLSConnection();
                pyLanguageClient.registerHover();
                pyLanguageClient.registerAutocompletion();
                pyLanguageClient.registerSignatureHelp();
            }
        }
    }, [monaco]);

    // add action
    useEffect(() => {
        // console.log("CodeEditor useEffect container view", container, view);
        if (monaco && editor) {
            let keymap: any[] = [
                {
                    id: shortcutKeysConfig.insert_group_below,
                    keybindings: [
                        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyG,
                    ],
                    run: () => insertCellBelow(CodeInsertMode.GROUP, null),
                },
                {
                    id: "open-ai",
                    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ],
                    run: () => sendOpenAi(editor),
                },
                {
                    id: shortcutKeysConfig.insert_line_below,
                    keybindings: [
                        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyL,
                    ],
                    run: () => insertCellBelow(CodeInsertMode.LINE, null),
                },
                {
                    id: shortcutKeysConfig.run_queue,
                    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
                    run: () => addToRunQueueHoverCell(),
                },
                {
                    id: shortcutKeysConfig.run_queue_then_move_down,
                    keybindings: [monaco.KeyMod.Shift | monaco.KeyCode.Enter],
                    run: () => addToRunQueueMoveDown(editor),
                },
                {
                    id: `foldAll`,
                    keybindings: [
                        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
                    ],
                    run: () => foldAll(editor),
                },
                {
                    id: `unfoldAll`,
                    keybindings: [
                        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyU,
                    ],
                    run: () => unfoldAll(editor),
                },
                {
                    id: shortcutKeysConfig.set_group,
                    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG],
                    run: () => setGroup(editor),
                },
                {
                    id: shortcutKeysConfig.set_ungroup,
                    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyU],
                    run: () => setUnGroup(editor),
                },
            ];
            keymap.forEach(function (element) {
                (editor as any).addAction({ ...element, label: element.id });
            });
        }
    });

    useEffect(() => {
        console.log("CodeEditor runQueue");
        if (runQueue.status === RunQueueStatus.STOP) {
            if (runQueue.queue.length > 0) {
                let runQueueItem = runQueue.queue[0];
                dispatch(setRunQueueStatus(RunQueueStatus.RUNNING));
                execLines(socket, runQueueItem);
            }
        }
    }, [runQueue]);

    /** clear the run queue when the executor restarted */
    useEffect(() => {
        const runQueueItem = runQueue.queue[0];
        let inViewID = store.getState().projectManager.inViewID;
        if (inViewID != null && runQueueItem != null) {
            dispatch(removeFirstItemFromRunQueue());
            setLineStatus(inViewID, runQueueItem.lineRange, LineStatus.EXECUTED_FAILED);
            dispatch(clearRunQueue());
        }
    }, [executorRestartCounter, executorInterruptSignal]);

    useEffect(() => {
        if (inViewID && monaco && editor) {
            let groupID = textOpenai.metadata.groupID;
            let lineNumber = textOpenai.metadata.lineNumber; /** 1-based */
            const codeLines = store.getState().codeEditor.codeLines[inViewID];

            let lineRange: any = getLineRangeOfGroup(codeLines, groupID);

            var range = new monaco.Range(lineNumber + 1, 1, lineNumber + 1, 1);
            var id = { major: 1, minor: 1 };
            var text = textOpenai.content.choices[0].text + `\n`;
            var op = { identifier: id, range: range, text: text, forceMoveMarkers: true };
            editor.executeEdits("my-source", [op]);
        }
    }, [openaiUpdateSignal]);
    useEffect(() => {
        if (inViewID && monaco && editor) {
            sendTextToOpenai(socket, textToOpenAI);
        }
    }, [textToOpenAI]);
    /**
     * Reset the code editor state when the doc is selected to be in view
     * */
    useEffect(() => {
        if (curInViewID != inViewID) {
            if (curInViewID && monaco) {
                // fileClosingHandler(view.state, curInViewID);
            }
            setCurInViewID(inViewID);
        }
        // resetEditorState(inViewID, view);
        setCodeReloading(true);
    }, [inViewID, diffView]);

    useEffect(() => {
        if (!diffView) {
            setTimeout(() => {
                setCodeReloading(true);
            }, 0);
        }
    }, [diffView]);

    useEffect(() => {
        if (serverSynced && codeReloading && monaco && editor) {
            // Note: I wasn't able to get editor directly out of monaco so have to use editorRef
            // TODO: improve this by rely only on monaco
            setCodeTextAndStates(store.getState(), monaco);
            setCellDeco(monaco, editor);
            getCellFoldRange(monaco, editor);
            setCellWidgets(editor);
            setCodeReloading(false);

            // //When you create the new instance load the model that you saved
            if (inViewID && saveViewStateEditor[inViewID]) {
                editor.restoreViewState(saveViewStateEditor[inViewID]);
                // setOldState(true)
            }
        }
    }, [serverSynced, codeReloading, monaco, editor, diffView]);

    useEffect(() => {
        const state = store.getState();
        const mouseOverGroupID = state.codeEditor.mouseOverGroupID;
        // console.log("CodeEditor useEffect cellCommand: ", cellCommand);
        if (cellCommand) {
            let ln0based = null;
            if (state.codeEditor.mouseOverLine) {
                // const inViewID = state.projectManager.inViewID;
                ln0based = state.codeEditor.mouseOverLine;
                // let activeLine: ICodeActiveLine = {
                //     inViewID: inViewID || "",
                //     lineNumber: ln0based,
                // };
                // store.dispatch(setActiveLineRedux(activeLine));
            }
            switch (cellCommand) {
                case CellCommand.RUN_CELL:
                    addToRunQueueHoverCell();
                    break;
                case CellCommand.CLEAR:
                    dispatch(clearAllOutputs({ inViewID, mouseOverGroupID }));
                    break;
                case CellCommand.ADD_CELL:
                    /** TODO: fix the type issue with ln0based */
                    insertCellBelow(CodeInsertMode.GROUP, ln0based);
                    break;
                case CellCommand.DELL_CELL:
                    deleteCellHover(editor, monaco);
                    break;
                case CellCommand.RUN_ABOVE_CELL:
                    runCellAboveGroup(editor);
                    break;
                case CellCommand.RUN_BELOW_CELL:
                    runCellBelowGroup();
                    break;
                case CellCommand.RUN_ALL_CELL:
                    runAllCell();
                    break;
                // case CellCommand.ADD_TEXT:
                //     addText(socket);
                //     break;
            }
            dispatch(setCellCommand(undefined));
        }
    }, [cellCommand]);

    useEffect(() => {
        if (editor) {
            setCellDeco(monaco, editor);
            setCellWidgets(editor);
        }
    }, [cellAssocUpdateCount, activeGroup, lineStatusUpdate]);

    const handleEditorDidMount = (mountedEditor, monaco) => {
        // Note: I wasn't able to get editor directly out of monaco so have to use editorRef
        setEditor(mountedEditor);
        setHTMLEventHandler(mountedEditor, stopMouseEvent);
    };

    const handleEditorChange = (value, event) => {
        try {
            pyLanguageClient.doValidate();
            const state = store.getState();
            let inViewID = state.projectManager.inViewID;
            /** do nothing if the update is due to code reloading from external source */
            if (event.isFlush) return;
            // console.log("Monaco here is the current model value:", event);
            let serverSynced = store.getState().projectManager.serverSynced;
            if (monaco) {
                let model = getMainEditorModel(monaco);

                if (serverSynced && inViewID && model) {
                    const inViewCodeText = state.codeEditor.codeText[inViewID];
                    let updatedLineCount = model.getLineCount() - inViewCodeText.length;
                    // console.log(
                    //     "Monaco updates ",
                    //     updatedLineCount,
                    //     event.changes,
                    //     model?.getLineCount(),
                    //     inViewCodeText.length
                    // );
                    for (const change of event.changes) {
                        // convert the line number 0-based index, which is what we use internally
                        let changeStartLine1Based = change.range.startLineNumber;
                        let changeStartLineNumber0Based = changeStartLine1Based - 1;
                        // console.log(
                        //     "Monaco updates ",
                        //     model?.getLineContent(changeStartLine1Based),
                        //     inViewCodeText[changeStartLineNumber0Based]
                        // );
                        if (updatedLineCount > 0) {
                            let updatedLineInfo: ILineUpdate = {
                                inViewID: inViewID,
                                text: model.getLinesContent(),
                                updatedStartLineNumber: changeStartLineNumber0Based,
                                updatedLineCount: updatedLineCount,
                                startLineChanged:
                                    model.getLineContent(changeStartLine1Based) !=
                                    inViewCodeText[changeStartLineNumber0Based],
                            };
                            dispatch(updateLines(updatedLineInfo));
                        } else if (updatedLineCount < 0) {
                            let updatedLineInfo: ILineUpdate = {
                                inViewID: inViewID,
                                text: model.getLinesContent(),
                                updatedStartLineNumber: changeStartLineNumber0Based,
                                updatedLineCount: updatedLineCount,
                                startLineChanged:
                                    model.getLineContent(changeStartLine1Based) !=
                                    inViewCodeText[changeStartLineNumber0Based],
                            };
                            dispatch(updateLines(updatedLineInfo));
                        } else {
                            let updatedLineInfo: ILineUpdate = {
                                inViewID: inViewID,
                                text: model.getLinesContent(),
                                updatedStartLineNumber: changeStartLineNumber0Based,
                                updatedLineCount: updatedLineCount,
                                startLineChanged: true,
                            };
                            dispatch(updateLines(updatedLineInfo));
                        }
                        // handleCAsisstTextUpdate();
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    return !diffView ? (
        <StyledMonacoEditor
            height="90vh"
            defaultValue=""
            defaultLanguage="python"
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
            saveViewState
            options={{
                minimap: { enabled: true, autohide: true },
                fontSize: 11,
                renderLineHighlight: "none",
                scrollbar: { verticalScrollbarSize: 10 },
                // foldingStrategy: "indentation",
            }}
        />
    ) : (
        <DiffEditor
            height="90vh"
            language="python"
            original={original}
            modified={modified}
            options={{
                minimap: { enabled: true, autohide: true },
                fontSize: 11,
                renderLineHighlight: "none",
                scrollbar: { verticalScrollbarSize: 10 },
                // foldingStrategy: "indentation",
            }}
            // onMount={handleEditorDidMountDiff}
        />
    );
};

export default CodeEditor;
