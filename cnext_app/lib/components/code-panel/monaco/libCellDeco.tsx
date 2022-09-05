import store, { RootState } from "../../../../redux/store";
import { ICodeLine } from "../../../interfaces/ICodeEditor";
import { getCodeLine } from "./libCodeEditor";

let decorations = [];

export const setCellDeco = (monaco, editor) => {
    let state = store.getState();
    const activeGroup = state.codeEditor.activeGroup;
    const cellBoundaryDeco = [];

    let inViewID = state.projectManager.inViewID;
    if (inViewID) {
        let lines: ICodeLine[] | null = getCodeLine(state);
        if (lines) {
            let currentGroupID = null;
            for (let ln = 0; ln < lines.length; ln++) {
                if (!lines[ln].generated && lines[ln].groupID != null) {
                    const active_clazz = activeGroup === lines[ln].groupID ? "active" : "";
                    const ln1based = ln + 1;
                    if (lines[ln].groupID != currentGroupID) {
                        cellBoundaryDeco.push({
                            range: new monaco.Range(ln1based, 1, ln1based, 1),
                            options: { blockClassName: "cellfirstline " + active_clazz },
                        });
                    } else {
                        cellBoundaryDeco.push({
                            range: new monaco.Range(ln1based, 1, ln1based, 1),
                            options: { blockClassName: "cellline " + active_clazz },
                        });
                    }
                    /** due to the special way that ME use to handle view zones (see libCellWidget),
                     * the cell bottom boundary will be handle by the border-top of the .cellwidget */
                    // if (
                    //     /** this is the last line of the file */
                    //     ln1based === lines.length
                    //     /** next line belongs to a different group */
                    //     || lines[ln].groupID !== lines[ln + 1].groupID
                    // ) {
                    //     cellBoundaryDeco.push({
                    //         range: new monaco.Range(ln1based, 1, ln1based, 1),
                    //         options: { blockClassName: "celllastline " + active_clazz },
                    //     });
                    // }
                }
                currentGroupID = lines[ln].groupID;
            }
        }
    }
    // console.log("Monaco libCellDeco: ", cellBoundaryDeco, monaco, editor);
    decorations = editor.deltaDecorations(decorations, cellBoundaryDeco);
};