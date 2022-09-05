import { Monaco } from "@monaco-editor/react";
import {
    setActiveLine as setActiveLineRedux,
    setMouseOverGroup,
    setMouseOverLine,
} from "../../../../redux/reducers/CodeEditorRedux";
import store, { RootState } from "../../../../redux/store";
import { ICodeActiveLine, ICodeLine } from "../../../interfaces/ICodeEditor";
import { ifElse } from "../../libs";

export const getCodeLine = (state: RootState): ICodeLine[] | null => {
    let inViewID = state.projectManager.inViewID;
    if (inViewID) {
        return ifElse(state.codeEditor.codeLines, inViewID, null);
    }
    return null;
};

export const getCodeText = (state: RootState) => {
    let inViewID = state.projectManager.inViewID;
    if (inViewID) {
        let codeText = ifElse(state.codeEditor.codeText, inViewID, null);
        if (codeText) return codeText.join("\n");
    }
    return null;
};

function setActiveLine(inViewID: string, lineNumber: number) {
    try {
        if (inViewID) {
            let activeLine: ICodeActiveLine = {
                inViewID: inViewID,
                lineNumber: lineNumber,
            };
            store.dispatch(setActiveLineRedux(activeLine));
            // console.log('CodeEditor onMouseDown', doc, pos, lineNumber);
        }
    } catch (error) {
        console.error(error);
    }
}

function setOpacityWidget(id: string, opacity: string) {
    let element = document.getElementById(`cellwidget-${id}`) as HTMLElement | null;
    if (element) {
        // element.style.opacity = opacity;
        if (opacity === "1") element.classList.add("show-children");
        else element.classList.remove("show-children");
    }
}

function onKeyUp(editor, event) {
    try {
        // event.stopPropagation();
        // console.log("Monaco onMouseDown", event?.target?.position);
        let ln1based = editor.getPosition().lineNumber;
        let state = store.getState();
        const activeLineNumber = state.codeEditor.activeLineNumber;
        let inViewID = state.projectManager.inViewID;
        if (inViewID && ln1based != null && activeLineNumber !== ln1based - 1) {
            setActiveLine(inViewID, ln1based - 1);
        }
    } catch (error) {
        console.error(error);
    }
}

function onMouseDown(event) {
    try {
        // event.stopPropagation();
        // console.log("Monaco onMouseDown", event?.target?.position);
        let ln1based = event?.target?.position?.lineNumber;
        let state = store.getState();
        const activeLineNumber = state.codeEditor.activeLineNumber;
        let inViewID = store.getState().projectManager.inViewID;
        if (inViewID && ln1based != null && activeLineNumber !== ln1based - 1) {
            setActiveLine(inViewID, ln1based - 1);
        }
    } catch (error) {
        console.error(error);
    }
}

function onMouseMove(event) {
    try {
        if (event.target && !event.target?.detail?.viewZoneId) {
            let reduxState = store.getState();
            const mouseOverGroupID = reduxState.codeEditor.mouseOverGroupID;
            let lines: ICodeLine[] | null = getCodeLine(reduxState);
            let lineNumber = event?.target?.position?.lineNumber - 1; /** 0-based */
            // console.log(`lineNumber`, event, lineNumber);

            let currentGroupID = lines[lineNumber].groupID;
            // console.log(`CodeEditor onMouseOver`, currentGroupID, doc.line(lineNumber + 1));
            if (currentGroupID && currentGroupID !== mouseOverGroupID) {
                setOpacityWidget(currentGroupID, "1");
                if (mouseOverGroupID) {
                    setOpacityWidget(mouseOverGroupID, "0");
                }
                store.dispatch(setMouseOverGroup(currentGroupID));
            }

            // store.dispatch(setMouseOverLine({ ...hoveredLine }));
        }

        // console.log('CodeEditor onMouseDown', view, event, dispatch);
    } catch (error) {
        console.error(error);
    }
}

function onMouseLeave(event) {
    try {
        if (event != null) {
            let reduxState = store.getState();
            const mouseOverGroupID = reduxState.codeEditor.mouseOverGroupID;
            if (mouseOverGroupID) {
                /* eslint-disable */
                setOpacityWidget(mouseOverGroupID, "0");
            }
            store.dispatch(setMouseOverGroup(undefined));
            // store.dispatch(setMouseOverLine(undefined));
        }
    } catch (error) {
        console.error(error);
    }
}

export const setHTMLEventHandler = (editor) => {
    editor.onMouseMove((event) => onMouseMove(event));
    editor.onMouseLeave((event) => onMouseLeave(event));
    editor.onMouseDown((event) => onMouseDown(event));
    editor.onKeyUp((event) => onKeyUp(editor, event));
};

export const getMainEditorModel = (monaco: Monaco) => {
    if (monaco) {
        let models = monaco.editor.getModels();
        if (models.length > 0) return models[0];
    }
    return null;
};

export const setCodeTextAndStates = (state: RootState, monaco: Monaco) => {
    let codeText = getCodeText(state);
    let editorModel = getMainEditorModel(monaco);
    if (codeText) {
        editorModel?.setValue(codeText);
    }
};
