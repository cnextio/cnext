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
            let start = 1;
            let end = 1;
            for (let ln = 0; ln < lines.length; ln++) {
                if (!lines[ln].generated && lines[ln].groupID != null) {
                    console.log(`lines`, lines);

                    const ln1based = ln + 1;
                    if (lines[ln].groupID != currentGroupID && start > end) {
                        cellFold.push({
                            start: start,
                            end: end,
                        });
                        end = ln + 1;
                        start = ln + 1;
                    } else {
                        end = end + 1;
                    }
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
