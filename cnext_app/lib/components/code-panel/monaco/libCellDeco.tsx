import store, { RootState } from "../../../../redux/store";
import { ICodeLine, LineStatus } from "../../../interfaces/ICodeEditor";
import { getCodeLine } from "./libCodeEditor";

let decorations = [];

export const setCellDeco = (monaco, editor) => {
    let state = store.getState();
    const activeGroup = state.codeEditor.activeGroup;
    const cellLineDeco = [];
    const lineStatus = [];

    let inViewID = state.projectManager.inViewID;
    if (inViewID) {
        let lines: ICodeLine[] | null = getCodeLine(state);
        if (lines) {
            let currentGroupID = null;
            for (let ln = 0; ln < lines.length; ln++) {
                const ln1based = ln + 1;
                if (!lines[ln].generated && lines[ln].groupID != null) {
                    const active_clazz = activeGroup === lines[ln].groupID ? "active" : "";
                    if (lines[ln].groupID !== currentGroupID) {
                        cellLineDeco.push({
                            range: new monaco.Range(ln1based, 1, ln1based, 1),
                            options: { blockClassName: "cellfirstline " + active_clazz },
                        });
                        lineStatus.push({
                            range: new monaco.Range(ln1based, 1, ln1based, 1),
                            options: {
                                isWholeLine: true,
                                linesDecorationsClassName:
                                    `${getClassLineStatus(lines[ln].status)}` + " first-status",
                            },
                        });
                    } else {
                        if (
                            /** this is the last line of the file */
                            ln1based === lines.length ||
                            /** next line belongs to a different group */
                            lines[ln].groupID !== lines[ln + 1].groupID
                        ) {
                            lineStatus.push({
                                range: new monaco.Range(ln1based, 1, ln1based, 1),
                                options: {
                                    isWholeLine: true,
                                    linesDecorationsClassName:
                                        `${getClassLineStatus(lines[ln].status)}` + " last-status",
                                },
                            });
                        } else {
                            cellLineDeco.push({
                                range: new monaco.Range(ln1based, 1, ln1based, 1),
                                options: { blockClassName: "cellline " + active_clazz },
                            });
                            lineStatus.push({
                                range: new monaco.Range(ln1based, 1, ln1based, 1),
                                options: {
                                    isWholeLine: true,
                                    linesDecorationsClassName: `${getClassLineStatus(
                                        lines[ln].status
                                    )}`,
                                },
                            });
                        }
                    }
                    /** due to the special way that ME use to handle view zones (see libCellWidget),
                     * the cell bottom boundary will be handle by the border-top of the .cellwidget */
                }

                currentGroupID = lines[ln].groupID;
            }
        }
    }
    // console.log("Monaco libCellDeco: ", cellBoundaryDeco);
    decorations = editor.deltaDecorations(decorations, cellLineDeco.concat(lineStatus));
};

const executedOkClass = "line-status ok";
const executedFailedClass = "line-status failed";
const executingClass = "line-status executing";
const inqueueClass = "line-status inqueue";

function getClassLineStatus(status: number) {
    switch (status) {
        case LineStatus.EDITED:
            return "";
        case LineStatus.EXECUTING:
            return inqueueClass;
        case LineStatus.EXECUTED_SUCCESS:
            return executedOkClass;
        case LineStatus.EXECUTED_FAILED:
            return executedFailedClass;
        case LineStatus.INQUEUE:
            return inqueueClass;
    }
}
