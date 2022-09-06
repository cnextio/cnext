import store, { RootState } from "../../../../redux/store";
import { ICodeLine, LineStatus } from "../../../interfaces/ICodeEditor";
import { getCodeLine } from "./libCodeEditor";

let cellFold: any[] = [];

export const getCellFoldRange = () => {
    let state = store.getState();
    let inViewID = state.projectManager.inViewID;
    cellFold = [];
    if (inViewID) {
        let lines: ICodeLine[] | null = getCodeLine(state);
        if (lines) {
            let currentGroupID = null;
            let startLine = 0;
            let endLine = 0;
            // console.log("Monaco getCellFoldRange: ", lines);
            while (endLine < lines.length) {
                // console.log("Monaco getCellFoldRange: ", endLine);
                if (lines[endLine].groupID && lines[endLine].groupID != currentGroupID) {
                    /** start of a new group */
                    startLine = endLine;
                    currentGroupID = lines[endLine].groupID;
                    while (endLine+1 < lines.length && lines[endLine+1].groupID === currentGroupID) {
                        currentGroupID = lines[endLine].groupID;
                        endLine += 1;
                    }
                    if (startLine != endLine) {
                        cellFold.push({
                            start: startLine+1,
                            end: endLine+1,
                        });
                    }
                } else {
                    currentGroupID = lines[endLine].groupID;
                    endLine += 1;
                }
            }
        }
    }
    
    return cellFold;    
};
