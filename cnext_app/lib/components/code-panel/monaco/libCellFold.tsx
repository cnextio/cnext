import store, { RootState } from "../../../../redux/store";
import { ICodeLine, LineStatus } from "../../../interfaces/ICodeEditor";
import { getCodeLine } from "./libCodeEditor";

let cellFold: any[] = [];

export const getCellFoldRange = (monaco, editor) => {
    let state = store.getState();
    let inViewID = state.projectManager.inViewID;
    cellFold = [];
    if (inViewID) {
        let lines: ICodeLine[] | null = getCodeLine(state);
        if (lines) {
            let currentGroupID = null;
            let countLineCurrentGroupID = 0;
            let start = 1;
            let end = 1;
            for (let ln = 0; ln < lines.length; ln++) {
                if (!lines[ln].generated && lines[ln].groupID != null) {
                    const ln1based = ln + 1;
                    countLineCurrentGroupID = countLineCurrentGroupID + 1;

                    if (lines[ln].groupID != currentGroupID) {
                        if (start != end && countLineCurrentGroupID > 1) {
                            cellFold.push({
                                start: start,
                                end: end,
                            });
                            end = ln1based;
                            start = ln1based;
                        }
                    } else {
                        end = end + 1;
                        if (countLineCurrentGroupID > 0 && ln === lines.length - 1) {
                            cellFold.push({
                                start: start,
                                end: end,
                            });
                            end = ln1based;
                            start = ln1based;
                        }
                    }
                }
                if (lines[ln].groupID !== currentGroupID) {
                }
                currentGroupID = lines[ln].groupID;
            }
        }
    }
    monaco.languages.register({
        id: "python",
    });
    console.log(`Monaco CellFold`, cellFold);
    monaco.languages.registerFoldingRangeProvider("python", {
        provideFoldingRanges: function (model, context, token) {
            return cellFold;
        },
    });
};
