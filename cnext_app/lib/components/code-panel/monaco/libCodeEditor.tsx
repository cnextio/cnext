import { Monaco } from "@monaco-editor/react";
import { setMouseOverGroup, setMouseOverLine } from "../../../../redux/reducers/CodeEditorRedux";
import store, { RootState } from "../../../../redux/store";
import { ICodeLine } from "../../../interfaces/ICodeEditor";
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
function setOpacityWidget(id: string, opacity: string) {
    let element = document.getElementById(`groupwidget-${id}`) as HTMLElement | null;
    if (element) {
        element.style.opacity = opacity;
    }
}
function onMouseMove(event: MouseEvent) {
    try {
        if (event.target) {
            let reduxState = store.getState();
            const mouseOverGroupID = reduxState.codeEditor.mouseOverGroupID;
            let lines: ICodeLine[] | null = getCodeLine(reduxState);
            let lineNumber = event?.target?.position?.lineNumber - 1; /** 0-based */
            if (mouseOverGroupID) {
                setOpacityWidget(mouseOverGroupID, "0");
            }
            let currentGroupID = lines[lineNumber].groupID;
            // console.log(`CodeEditor onMouseOver`, currentGroupID, doc.line(lineNumber + 1));
            if (currentGroupID) {
                setOpacityWidget(currentGroupID, "1");
            }
            store.dispatch(setMouseOverGroup(currentGroupID));
            // store.dispatch(setMouseOverLine({ ...hoveredLine }));
        }

        // console.log('CodeEditor onMouseDown', view, event, dispatch);
    } catch (error) {
        console.error(error);
    }
}
function onMouseLeave(event: MouseEvent,) {
    try {
        if (event != null) {
            let reduxState = store.getState();
            const mouseOverGroupID = reduxState.codeEditor.mouseOverGroupID;
            if (mouseOverGroupID) {
                /* eslint-disable */
                setOpacityWidget(mouseOverGroupID, "0");
            }
            store.dispatch(setMouseOverGroup(undefined));
            store.dispatch(setMouseOverLine(undefined));
        }
    } catch (error) {
        console.error(error);
    }
}
export const setHTMLEventHandler = (editor) => {
    editor.onMouseMove((e) => onMouseMove(e));
    editor.onMouseLeave((e) => onMouseLeave(e));
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
