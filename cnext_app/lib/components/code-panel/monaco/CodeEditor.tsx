import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

import Editor, { useMonaco } from "@monaco-editor/react";
import { useDispatch, useSelector } from "react-redux";
import store, { RootState } from "../../../../redux/store";
import { setCodeTextAndStates, setEditorWidgets } from "./libCodeEditor";
import { MonacoEditor as StyledMonacoEditor } from "../styles";

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

    const editorRef = useRef(null);

    /**
     * Init CodeEditor value with content load from the file
     * Also scroll the file to the previous position
     */
    useEffect(() => {
        if (serverSynced && codeReloading) {
            if (monaco) {
                setCodeTextAndStates(store.getState(), monaco);
                setCodeReloading(false);
            }
            if (editorRef.current) {
                setEditorWidgets(store.getState(), editorRef.current);
            }
        }
    }, [serverSynced, codeReloading, monaco, editorRef]);

    function handleEditorChange(value, event) {
        console.log("Monica here is the current model value:", value, event);
    }

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
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
