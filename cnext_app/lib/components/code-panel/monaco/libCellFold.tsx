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
            for (let ln = 0; ln < lines.length; ln++) {
                if (!lines[ln].generated && lines[ln].groupID != null) {
                    const ln1based = ln + 1;
                    if (lines[ln].groupID != currentGroupID) {
                        // cellFold.push({
                        //     start: ln1based,
                        //     end: ln1based,
                        // });
                    } else {
                    }
                }

                currentGroupID = lines[ln].groupID;
            }
        }
    }
    monaco.languages.register({
        id: "python",
    });
    console.log(`cellFold`, cellFold);

    monaco.languages.registerFoldingRangeProvider("python", {
        provideFoldingRanges: function (model, context, token) {
            return cellFold;
        },
    });
};
