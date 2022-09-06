import React, { useEffect, useRef, useState } from "react";
import { useMonaco } from "@monaco-editor/react";
import { useDispatch, useSelector } from "react-redux";
import store, { RootState } from "../../../../redux/store";
import {
    execLines,
    getMainEditorModel,
    insertCellBelow,
    setCodeTextAndStates,
    setHTMLEventHandler,
    setLineStatus,
} from "./libCodeEditor";
import { setCellWidgets } from "./libCellWidget";
import { setCellDeco } from "./libCellDeco";
import { MonacoEditor as StyledMonacoEditor } from "../styles";
import {
    CellCommand,
    CodeInsertMode,
    ICodeActiveLine,
    ICodeResultMessage,
    ILineUpdate,
    LineStatus,
    RunQueueStatus,
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
} from "../../../../redux/reducers/CodeEditorRedux";
import { IMessage, WebAppEndpoint } from "../../../interfaces/IApp";
import socket from "../../Socket";
import { addToRunQueueHoverCell } from "./libRunQueue";
import { getCellFoldRange } from "./libCellFold";

const CodeEditor = ({ stopMouseEvent }) => {
    const monaco = useMonaco();
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

    /** this state is used to indicate when the codemirror view needs to be loaded from internal source
     * i.e. from codeText */
    const [codeReloading, setCodeReloading] = useState<boolean>(true);

    const [editor, setEditor] = useState(null);

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
        });
    };

    useEffect(() => {
        console.log("CodeEditor mount");
        socketInit();
        // resetEditorState(inViewID, view);
        return () => {
            console.log("CodeEditor unmount");
            socket.off(WebAppEndpoint.CodeEditor);
        };
    }, []);

    useEffect(() => {
        // console.log("CodeEditor useEffect container view", container, view);
        if (monaco) {
            monaco.languages.register({ id: "python" });
            monaco.languages.registerFoldingRangeProvider("python", {
                provideFoldingRanges: (model, context, token) => getCellFoldRange(),
            });
        }
    });

    useEffect(() => {
        console.log("CodeEditor runQueue");
        if (runQueue.status === RunQueueStatus.STOP) {
            if (runQueue.queue.length > 0) {
                let runQueueItem = runQueue.queue[0];
                dispatch(setRunQueueStatus(RunQueueStatus.RUNNING));
                execLines(runQueueItem);
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
    }, [executorRestartCounter]);

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
    }, [inViewID]);

    useEffect(() => {
        if (serverSynced && codeReloading && monaco && editor) {
            // Note: I wasn't able to get editor directly out of monaco so have to use editorRef
            // TODO: improve this by rely only on monaco

            setCodeTextAndStates(store.getState(), monaco);
            setCellDeco(monaco, editor);
            getCellFoldRange(monaco, editor);
            setCellWidgets(editor);
            setCodeReloading(false);
        }
    }, [serverSynced, codeReloading, monaco, editor]);

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
                    // insertBelow(CodeInsertMode.GROUP, line);
                    insertCellBelow(monaco, editor, CodeInsertMode.GROUP, ln0based);
                    break;
            }
            dispatch(setCellCommand(undefined));
        }
    }, [cellCommand]);

    useEffect(() => {
        if (editor) {
            setCellDeco(monaco, editor);
            setCellWidgets(editor);
        }
    }, [cellAssocUpdateCount, activeGroup]);

    const handleEditorDidMount = (mountedEditor, monaco) => {
        // Note: I wasn't able to get editor directly out of monaco so have to use editorRef
        setEditor(mountedEditor);
        setHTMLEventHandler(mountedEditor, stopMouseEvent);
    };

    const handleEditorChange = (value, event) => {
        try {
            const state = store.getState();
            let inViewID = state.projectManager.inViewID;
            /** do nothing if the update is due to code reloading from external source */
            if (event.isFlush) return;
            console.log("Monaco here is the current model value:", event);
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

    return (
        <StyledMonacoEditor
            height="90vh"
            defaultValue=""
            defaultLanguage="python"
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
        />
    );
};

export default CodeEditor;
