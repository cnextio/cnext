import shortid from "shortid";
import { createSlice } from "@reduxjs/toolkit";
import {
    ICodeResultMessage,
    ICodeLine,
    ILineUpdate,
    LineStatus,
    ICodeLineStatus,
    ICodeLineGroupStatus,
    SetLineGroupCommand,
    IRunQueue,
    RunQueueStatus,
    ICodeActiveLine,
    ICodeText,
    ILineRange,
    ICodeToInsert,
} from "../../lib/interfaces/ICodeEditor";
import { ifElseDict } from "../../lib/components/libs";
import { ContentType, SubContentType } from "../../lib/interfaces/IApp";
import { ICAssistInfo, ICAssistInfoRedux } from "../../lib/interfaces/ICAssist";

type CodeEditorState = {
    codeText: { [id: string]: string[] };
    codeLines: { [id: string]: ICodeLine[] };
    /** file timestamp will be used to check whether the code need to be reloaded
     * A better design might be to move all codeText, codeLines and fileTimestamp under
     * a same dictionary */
    timestamp: { [id: string]: number };
    fileSaved: boolean;
    runQueue: IRunQueue;

    /** This count is used to trigger the update of ResultView view.
     * It will increase whenever there is an update to results*/
    resultUpdateCount: number;

    /** This stores the current max text output order.
     * This is used to set the order of the text output. */
    maxTextOutputOrder: number;

    /** This count is used to trigger the update of CodeOutput view.
     * It will increase whenever there is an update to text output results*/
    textOutputUpdateCount: number;

    lineStatusUpdateCount: number;
    activeLine: string | null;
    cAssistInfo: ICAssistInfo | undefined;
    runDict: {} | undefined;
    runningId: string | undefined;
    codeToInsert: ICodeToInsert | undefined;
};

const initialState: CodeEditorState = {
    codeText: {},
    codeLines: {},
    timestamp: {},
    fileSaved: true,
    runQueue: { status: RunQueueStatus.STOP },
    resultUpdateCount: 0,
    maxTextOutputOrder: 0,
    textOutputUpdateCount: 0,
    lineStatusUpdateCount: 0,
    activeLine: null,
    cAssistInfo: undefined,
    runDict: undefined,
    runningId: undefined,
    codeToInsert: undefined,
};

/**
 * Return the max text ouput order from the list
 */
function getMaxTextOutputOrder(codeLines: ICodeLine[]) {
    let maxTextOutputOrder: number = 0;
    codeLines
        .filter(
            (codeLine) =>
                codeLine.hasOwnProperty("textOutput") &&
                codeLine.textOutput !== null
        )
        .map((item) => {
            maxTextOutputOrder =
                item.textOutput?.order == null ||
                maxTextOutputOrder > item.textOutput?.order
                    ? maxTextOutputOrder
                    : item.textOutput?.order;
        });
    return maxTextOutputOrder;
}

export const CodeEditorRedux = createSlice({
    name: "codeEditor",
    initialState: initialState,

    reducers: {
        initCodeText: (state, action) => {
            let codeTextData: ICodeText = action.payload;
            let reduxFileID = codeTextData.reduxFileID;
            state.codeText[reduxFileID] = codeTextData.codeText;

            let codeLines: ICodeLine[] = codeTextData.codeLines;
            // let maxTextOutputOrder = 0;
            /** If codeLines doesn't have data,
             *  read codeText from file data then create codeLines line by line from codeText */
            if (codeLines == null || codeLines.length === 0) {
                codeLines = [];
                /** create at least 1 empty line when code text is empty */
                if (state.codeText[reduxFileID].length == 0) {
                    let codeLine: ICodeLine = {
                        lineID: shortid(),
                        status: LineStatus.EDITED,
                        generated: false,
                    };
                    codeLines.push(codeLine);
                } else {
                    for (
                        let i = 0;
                        i < state.codeText[reduxFileID].length;
                        i++
                    ) {
                        let codeLine: ICodeLine = {
                            lineID: shortid(),
                            status: LineStatus.EDITED,
                            generated: false,
                        };
                        codeLines.push(codeLine);
                    }
                }
            } else {
                /** If codeLines have data, that mean the state data was already saved,
                 *  assign the resultUpdate to display richoutput result */
                let resultData = codeLines.filter(
                    (codeLine) =>
                        codeLine.hasOwnProperty("result") &&
                        codeLine.result !== null
                );
                state.resultUpdateCount += 1;
                
                state.maxTextOutputOrder = getMaxTextOutputOrder(codeLines);
                state.textOutputUpdateCount += 1;
            }
            state.codeLines[reduxFileID] = codeLines;
        },

        updateLines: (state, action) => {
            let lineUpdate: ILineUpdate = action.payload;
            let inViewID = lineUpdate.inViewID;
            let updatedStartLineNumber = lineUpdate.updatedStartLineNumber;
            let codeLines: ICodeLine[] = state.codeLines[inViewID];

            state.codeText[inViewID] = lineUpdate.text;
            state.fileSaved = false;

            console.log(
                "CodeEditorRedux line update info: ",
                lineUpdate,
                state.fileSaved
            );
            // console.log('added line index started at: ', updatedStartLineNumber+1);
            if (lineUpdate.updatedLineCount > 0) {
                let addedLines: ICodeLine[] = [];
                /** use the same groupID of updatedStartLineNumber*/
                for (let i = 0; i < lineUpdate.updatedLineCount; i++) {
                    let codeLine: ICodeLine = {
                        lineID: shortid(),
                        status: LineStatus.EDITED,
                        result: null,
                        generated: false,
                        groupID: codeLines[updatedStartLineNumber]?.groupID,
                    };
                    addedLines.push(codeLine);
                }
                /** Insert the insersted lines into the array. Keep the ID of lines between 0 and updatedStartLineNumber
                 * the same. That means line updatedStartLineNumber will be considered as `edited` not a new line.
                 * See more note below. */
                codeLines = [
                    ...codeLines.slice(0, updatedStartLineNumber + 1),
                    ...addedLines,
                    ...codeLines.slice(updatedStartLineNumber + 1),
                ];
            } else if (lineUpdate.updatedLineCount < 0) {
                let deletedLineCount = -lineUpdate.updatedLineCount;
                /** Some lines have been deleted */
                for (let i = 0; i < deletedLineCount; i++) {
                    //TODO: make this thing like plugin and hook so we can handle different kind of output
                    if (
                        codeLines[updatedStartLineNumber + 1 + i].result &&
                        codeLines[updatedStartLineNumber + 1 + i].result
                            ?.type === ContentType.RICH_OUTPUT
                    ) {
                        state.resultUpdateCount += 1;
                    }
                    if (
                        codeLines[updatedStartLineNumber + 1 + i].textOutput 
                    ) {
                        state.textOutputUpdateCount += 1;
                    }
                }
                /** Remove lines from updatedStartLineNumber+1. Keep the ID of lines between 0 and updatedStartLineNumber
                 * the same. That means line updatedStartLineNumber will be considered as `edited` but not a new line.
                 * See more note below. */
                codeLines = [
                    ...codeLines.slice(0, updatedStartLineNumber + 1),
                    ...codeLines.slice(
                        updatedStartLineNumber + 1 + deletedLineCount
                    ),
                ];
            }

            /** mark the first line where the insert is `edited`, this is correct in most case except for case
             * where the anchor is right before the new line character. In this case, after inserting the anchor will be
             * right at the beginning of an existing line, so technically this line is not edited.
             * for simplicity, we ignore this case for now */
            codeLines[updatedStartLineNumber].status = LineStatus.EDITED;
            state.codeLines[inViewID] = codeLines;
        },

        //TODO: unify this with setLineGroupStatus
        setLineStatus: (state, action) => {
            let lineStatus: ICodeLineStatus = action.payload;
            let inViewID = lineStatus.inViewID;
            let codeLines: ICodeLine[] = state.codeLines[inViewID];
            if (lineStatus.status !== undefined) {
                if (
                    lineStatus.status === LineStatus.EDITED &&
                    lineStatus.text !== undefined
                ) {
                    // console.log('CodeEditorRedux: ', lineStatus.status);
                    state.codeText[inViewID] = lineStatus.text;
                    state.fileSaved = false;
                }
                const lineRange: ILineRange = lineStatus.lineRange;
                for (let ln = lineRange.fromLine; ln < lineRange.toLine; ln++) {
                    codeLines[ln].status = lineStatus.status;
                }
            }
            if (lineStatus.generated !== undefined) {
                const lineRange: ILineRange = lineStatus.lineRange;
                for (let ln = lineRange.fromLine; ln < lineRange.toLine; ln++) {
                    codeLines[ln].generated = lineStatus.generated;
                }
            }
            state.lineStatusUpdateCount++;
        },

        setLineGroupStatus: (state, action) => {
            let lineGroupStatus: ICodeLineGroupStatus = action.payload;
            let inViewID = lineGroupStatus.inViewID;
            let codeLines: ICodeLine[] = state.codeLines[inViewID];
            let groupID;

            if (lineGroupStatus.setGroup === SetLineGroupCommand.NEW) {
                groupID = shortid();
            }

            for (
                let i = lineGroupStatus.fromLine;
                i < lineGroupStatus.toLine;
                i++
            ) {
                if (lineGroupStatus.status !== undefined) {
                    if (
                        lineGroupStatus.status === LineStatus.EDITED &&
                        lineGroupStatus.text !== undefined
                    ) {
                        // console.log('CodeEditorRedux: ', lineStatus.status);
                        state.codeText[inViewID] = lineGroupStatus.text;
                    }
                    codeLines[i].status = lineGroupStatus.status;
                }
                if (lineGroupStatus.generated !== undefined) {
                    codeLines[i].generated = lineGroupStatus.generated;
                }
                codeLines[i].groupID = groupID;
            }
            state.lineStatusUpdateCount++;
        },

        /**
         *
         * @param state
         * @param action
         *
         * TODO: implement an optimized version to store result. currently the consumer of the resul will
         * be invoked anytime `codeLines` updated
         */
        addResult: (state, action) => {
            let resultMessage: ICodeResultMessage = action.payload;
            let inViewID = resultMessage.inViewID;
            let content: object | string | null = resultMessage.content;
            let lineRange: ILineRange = resultMessage.metadata["line_range"];
            // console.log('CodeEditorRedux addResult: ', resultMessage);    
            /* only create result when content has something */
            if (lineRange != null && content != null && content !== "") {
                /** TODO: double check this. for now only associate fromLine to result */
                let lineNumber = lineRange.fromLine;
                let codeLine: ICodeLine =
                    state.codeLines[inViewID][lineNumber];
                /** text result will be appended within each execution. The output will be cleared at the
                 * beginning of each execution */                
                if (resultMessage.type === ContentType.STRING) {
                    /** Remove backspace out of the text. TODO: move this to a function */
                    const backspaceReg = RegExp('[\b]+', 'g');
                    let matchBackspace;
                    if (codeLine.textOutput != null) {
                        let curContent = codeLine.textOutput.content as string;
                        if ((matchBackspace = backspaceReg.exec(content)) !== null){
                            codeLine.textOutput.content = [
                                curContent.substr(0, curContent.length - matchBackspace[0].length),
                                content.substr(backspaceReg.lastIndex)
                            ].join("");
                        } else {
                            codeLine.textOutput.content = [
                                codeLine.textOutput.content,
                                content,
                            ].join("");
                        }
                        // console.log("CodeEditorRedux ", codeLine.textOutput.content);
                    } else {
                        codeLine.textOutput = {
                            type: resultMessage.type,
                            subType: resultMessage.subType,
                            content: content,
                            // msg_id: resultMessage.metadata.msg_id,
                        };
                    }
                    state.maxTextOutputOrder += 1;
                    codeLine.textOutput.order = state.maxTextOutputOrder;
                    state.textOutputUpdateCount += 1;
                } else if (resultMessage.type === ContentType.RICH_OUTPUT) {
                    let content = resultMessage.content;
                    if (
                        resultMessage?.subType ===
                        SubContentType.APPLICATION_JSON
                    ) {
                        try {
                            content = JSON.parse(content);
                        } catch (error) {
                            console.log(
                                "CodeEditorRedux: result is not a json string ",
                                content
                            );
                        }
                    }
                    codeLine.result = {
                        type: resultMessage.type,
                        subType: resultMessage.subType,
                        content: content,
                        msg_id: resultMessage.metadata.msg_id,
                    };
                    state.resultUpdateCount += 1;
                }
            }
        },

        clearRunQueueTextOutput: (state, action) => {
            let inViewID = action.payload;
            let codeLines = state.codeLines[inViewID];
            if (
                state.runQueue.fromLine != null &&
                state.runQueue.toLine != null
            ) {
                for (
                    let l = state.runQueue.fromLine;
                    l < state.runQueue.toLine;
                    l++
                ) {
                    codeLines[l].textOutput = undefined;
                    state.textOutputUpdateCount += 1;
                }
            }
        },

        setActiveLine: (state, action) => {
            let activeLine: ICodeActiveLine = action.payload;
            let lineNumber = activeLine.lineNumber;
            let codeLines: ICodeLine[] = state.codeLines[activeLine.inViewID];
            state.activeLine = codeLines[lineNumber].lineID;
        },

        setFileSaved: (state, action) => {
            state.fileSaved = true;
        },

        /**
         * Set run queue with a new queue. If the queue is in running state, the new queue will be rejected
         * @param state
         * @param action action.playload contains the lines that will be executed
         * i.e. lines from fromLine to toLine excluding toLine
         * @returns `true` if the run queue is not running, `false` otherwise.
         */
        setRunQueue: (state, action) => {
            console.log(
                "CodeEditorRedux setRunQueue current status: ",
                state.runQueue.status
            );
            if (state.runQueue.status === RunQueueStatus.STOP) {
                let range: ILineRange = action.payload;
                state.runQueue = {
                    status: RunQueueStatus.RUNNING,
                    fromLine: range.fromLine,
                    toLine: range.toLine,
                    runningLine: range.fromLine,
                    // runAllAtOnce: data.runAllAtOnce,
                };
                // return true;
            }
            // return false;
        },

        /** Inform the run queue that the current line execution has been completed */
        compeleteRunLine: (state, action) => {
            if (state.runQueue.status === RunQueueStatus.RUNNING) {
                let runQueue: IRunQueue = state.runQueue;
                if (
                    runQueue.runningLine &&
                    runQueue.toLine &&
                    runQueue.runningLine < runQueue.toLine - 1
                ) {
                    /** do not run line at toLine */
                    runQueue.runningLine += 1;
                } else {
                    runQueue.status = RunQueueStatus.STOP;
                }
            }
        },

        compeleteRunQueue: (state, action) => {
            if (state.runQueue.status === RunQueueStatus.RUNNING) {
                let runQueue: IRunQueue = state.runQueue;
                runQueue.status = RunQueueStatus.STOP;
            }
        },

        updateCAssistInfo: (state, action) => {
            const cAssistInfoRedux: ICAssistInfoRedux = action.payload;
            const inViewID = cAssistInfoRedux.inViewID;
            const lineNumber = cAssistInfoRedux.cAssistLineNumber;
            state.codeLines[inViewID][lineNumber].cAssistInfo =
                cAssistInfoRedux.cAssistInfo;
            state.cAssistInfo = cAssistInfoRedux.cAssistInfo;
        },

        setCodeToInsert: (state, action) => {
            state.codeToInsert = action.payload;
        },

        clearTextOutputs: (state, action) => {
            const inViewID = action.payload;
            state.maxTextOutputOrder = 0;

            // remove all result & textOutput in state code lines
            for (let codeLine of state.codeLines[inViewID]) {
                codeLine.result = undefined;
                codeLine.textOutput = undefined;
                state.textOutputUpdateCount = 0;
                state.resultUpdateCount = 0;
            }
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    initCodeText,
    updateLines,
    addResult,
    setLineStatus,
    setLineGroupStatus,
    setActiveLine,
    setFileSaved,
    setRunQueue,
    compeleteRunLine,
    updateCAssistInfo,
    compeleteRunQueue,
    setCodeToInsert,
    clearRunQueueTextOutput,
    clearTextOutputs,
} = CodeEditorRedux.actions;

export default CodeEditorRedux.reducer;