import { EditorState } from "@codemirror/state";
import store from "../../../redux/store";

export const getGroupFoldRange = (state: EditorState, lineStart: number, lineEnd: number) => {
    let reduxState = store.getState();
    let inViewID = reduxState.projectManager.inViewID;
    if (state && inViewID) {
        const codeLines = store.getState().codeEditor.codeLines[inViewID];
        const doc = state.doc;
        /** compare doc and codeLines to avoid bug when codeLines has been loaded but doc has not */
        if (codeLines != null && doc.lines === codeLines.length && lineStart !== lineEnd) {
            const startLine: number = doc.lineAt(lineStart).number - 1; // 0-based
            let endLine: number = startLine;
            let curGroupID = codeLines[startLine].groupID;
            console.log("CodeEditor getGroupedLineFoldRange: ", startLine, lineStart, lineEnd);
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
                    return { from: lineStart, to: doc.line(endLine + 1).to }; // convert to 1-based
                }
            }
        }
    }
    return null;
};
