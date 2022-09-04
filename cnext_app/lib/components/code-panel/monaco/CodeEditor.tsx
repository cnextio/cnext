import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

import Editor, { useMonaco } from "@monaco-editor/react";
import { useDispatch, useSelector } from "react-redux";
import store, { RootState } from "../../../../redux/store";
import { getMainEditorModel, setCodeTextAndStates } from "./libCodeEditor";
import { setEditorWidgets } from "./libCodeWidget";
import { MonacoEditor as StyledMonacoEditor } from "../styles";
import { ILineUpdate } from "../../../interfaces/ICodeEditor";
import { updateLines } from "../../../../redux/reducers/CodeEditorRedux";

const CodeEditor = () => {
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
    // const editorRef = useRef<HTMLDivElement>();

    /** this state is used to indicate when the codemirror view needs to be loaded from internal source
     * i.e. from codeText */
    const [codeReloading, setCodeReloading] = useState<boolean>(true);

    const editorRef = useRef(null);

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
        if (serverSynced && codeReloading) {
            // Note: I wasn't able to get editor directly out of monaco so have to use editorRef
            // TODO: improve this by rely only on monaco
            if (monaco && editorRef.current) {
                setCodeTextAndStates(store.getState(), monaco);
                setEditorWidgets(store.getState(), editorRef.current);
                setCodeReloading(false);
            }
        }
    }, [serverSynced, codeReloading, monaco, editorRef]);

    useEffect(() => {
        if (editorRef.current) {
            setEditorWidgets(store.getState(), editorRef.current);
        }
    }, [cellAssocUpdateCount]);

    const handleEditorDidMount = (editor, monaco) => {
        // Note: I wasn't able to get editor directly out of monaco so have to use editorRef
        editorRef.current = editor;
    };

    const handleEditorChange = (value, event) => {
        try {
            const state = store.getState();
            let inViewID = state.projectManager.inViewID;
            /** do nothing if the update is due to code reloading from external source */
            if (event.isFlush) return;
            console.log("Monaco here is the current model value:", event);
            let serverSynced = store.getState().projectManager.serverSynced;
            let model = getMainEditorModel(monaco);

            if (serverSynced && inViewID && model) {
                const inViewCodeText = state.codeEditor.codeText[inViewID];
                let updatedLineCount = model.getLineCount() - inViewCodeText.length;
                console.log(
                    "Monaco updates ",
                    updatedLineCount,
                    event.changes,
                    model?.getLineCount(),
                    inViewCodeText.length
                );
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
