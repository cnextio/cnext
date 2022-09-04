import { Monaco } from "@monaco-editor/react";
import { RootState } from "../../../../redux/store";
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
        let codeText = ifElse(state.codeEditor.codeText, inViewID, null)
        if (codeText) return codeText.join("\n");
    }
    return null;
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
