import store from "../../../../redux/store";
import { addToRunQueue as addToRunQueueRedux } from "../../../../redux/reducers/CodeEditorRedux";
import { ICodeLine, ILineRange } from "../../../interfaces/ICodeEditor";
import { getCodeLine } from "./libCodeEditor";
import { CASSIST_STARTER } from "../../../interfaces/ICAssist";

/**
 * Get the line range of the group that contains lineNumber
 * @param lineNumber
 * @returns line range which is from fromLine to toLine excluding toLine
 */
const getLineRangeOfGroupAroundLine = (codeLines: ICodeLine[], lineNumber: number): ILineRange => {
    let groupID = codeLines[lineNumber].groupID;
    let fromLine = lineNumber;
    let toLine = lineNumber;
    if (groupID === undefined) {
        toLine = fromLine + 1;
    } else {
        while (
            fromLine > 0 &&
            codeLines[fromLine - 1].groupID &&
            codeLines[fromLine - 1].groupID === groupID
        ) {
            fromLine -= 1;
        }
        while (
            toLine < codeLines.length &&
            codeLines[toLine].groupID &&
            codeLines[toLine].groupID === groupID
        ) {
            toLine += 1;
        }
    }
    return { fromLine: fromLine, toLine: toLine };
};

const getLineRangeOfGroup = (codeLines: ICodeLine[], groupID: string): ILineRange | null => {
    let fromLine = null;
    let toLine = null;
    if (groupID) {
        for (let ln = 0; ln < codeLines.length; ln++) {
            if (codeLines[ln].groupID === groupID) {
                if (fromLine === null) fromLine = ln;
                else toLine = ln;
            }
        }
        if (fromLine !== null && toLine !== null) return { fromLine: fromLine, toLine: toLine };
    }
    return null;
};

/** add group a line belongs to to run queue */
function addGroupAroundLineToRunQueue(line) {
    let text: string = line.text;
    let lineNumberAtAnchor = line.number - 1; /** 0-based */
    let lineRange: ILineRange | undefined;
    let inViewID = store.getState().projectManager.inViewID;
    let codeLines: ICodeLine[] | null = getCodeLine(store.getState());
    console.log("CodeEditor setRunQueue lineNumberAtAnchor: ", lineNumberAtAnchor);
    /** we only allow line in a group to be executed */
    if (inViewID && codeLines && codeLines[lineNumberAtAnchor].groupID != null) {
        if (text.startsWith(CASSIST_STARTER)) {
            /** Get line range of group starting from next line */
            /** this if condition is looking at the next line*/
            if (codeLines[lineNumberAtAnchor].generated) {
                lineRange = getLineRangeOfGroupAroundLine(codeLines, lineNumberAtAnchor + 1);
            }
        } else {
            /** Get line range of group starting from the current line */
            /** convert to 0-based */
            lineRange = getLineRangeOfGroupAroundLine(codeLines, lineNumberAtAnchor);
        }

        if (lineRange) {
            console.log("CodeEditor setRunQueue: ", lineRange);
            store.dispatch(addToRunQueueRedux({ lineRange: lineRange, inViewID: inViewID }));
        }
    }
}

function addGroupToRunQueue(groupID: string) {
    let lineRange: ILineRange | null;
    let inViewID = store.getState().projectManager.inViewID;
    let codeLines: ICodeLine[] | null = getCodeLine(store.getState());

    /** we only allow line in a group to be executed */
    if (inViewID && codeLines) {
        lineRange = getLineRangeOfGroup(codeLines, groupID);
        if (lineRange) {
            console.log("CodeEditor setRunQueue: ", lineRange);
            store.dispatch(addToRunQueueRedux({ lineRange: lineRange, inViewID: inViewID }));
        }
    }
}

export const addToRunQueueHoverLine = () => {
    let line = store.getState().codeEditor.mouseOverLine; /** 1-based */
    if (line != null) {
        addGroupAroundLineToRunQueue(line);
    }
    return true;
};

export const addToRunQueueHoverCell = () => {
    let groupID = store.getState().codeEditor.mouseOverGroupID; /** 1-based */
    console.log("CodeEditor addToRunQueueHoverCell: ", groupID);
    if (groupID != null) {
        addGroupToRunQueue(groupID);
    }
    return true;
};
