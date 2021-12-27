import shortid from "shortid";
import { createSlice } from '@reduxjs/toolkit'
import { ICodeResult, ICodeResultMessage, ICodeLine, ILineUpdate, IPlotResult, LineStatus, ICodeLineStatus, ICodeLineGroupStatus, SetLineGroupCommand, IRunQueue, RunQueueStatus, ICodeActiveLine, ICodeText } from '../../lib/interfaces/ICodeEditor';
import { ifElseDict } from "../../lib/components/libs";
import { ContentType } from "../../lib/interfaces/IApp";

type CodeEditorState = { 
    codeText: {[id: string]: string[]},
    codeLines: {[id: string]: ICodeLine[]},
    /** file timestamp will be used to check whether the code need to be reloaded
     * A better design might be to move all codeText, codeLines and fileTimestamp under
     * a same dictionary */
    timestamp: {[id: string]: number},
    fileSaved: boolean,
    runQueue: IRunQueue, 
    /** plotResultUpdate indicates whether a plot is added or removed. This is to optimize for the performance of 
     * PlotView, which would only be rerendered when this variable is updated */ 
    plotResultUpdate: number,
    activeLine: string|null,
}

const initialState: CodeEditorState = {
    codeText: {},
    codeLines: {},
    timestamp: {},
    fileSaved: true,
    runQueue: {status: RunQueueStatus.STOP},
    plotResultUpdate: 0,
    activeLine: null,
}

export const CodeEditorRedux = createSlice({
    name: 'codeEditor',
    initialState: initialState,

    reducers: {
        initCodeText: (state, action) => {
            let codeTextData: ICodeText = action.payload
            let reduxFileID = codeTextData.reduxFileID;
            state.codeText[reduxFileID] = codeTextData.codeText;
            let codeLines: ICodeLine[] = [];
            for(let i=0; i<state.codeText[reduxFileID].length; i++){
                let codeLine: ICodeLine = {lineID: shortid(), status: LineStatus.EDITED, result: null, generated: false};
                codeLines.push(codeLine);                    
            }
            state.codeLines[reduxFileID] = codeLines;
            // state.timestamp[reduxFileID] = codeTextData.timestamp;
        },

        updateLines: (state, action) => {
            let lineUpdate: ILineUpdate = action.payload;
            let inViewID = lineUpdate.inViewID;
            let updatedStartLineNumber = lineUpdate.updatedStartLineNumber;
            let codeLines: ICodeLine[] = state.codeLines[inViewID];

            state.codeText[inViewID] = lineUpdate.text;
            state.fileSaved = false;

            console.log('CodeEditorRedux line update info: ', lineUpdate, state.fileSaved);
            // console.log('added line index started at: ', updatedStartLineNumber+1);
            if (lineUpdate.updatedLineCount>0){
                let addedLines: ICodeLine[] = [];
                for(let i=0; i<lineUpdate.updatedLineCount; i++){
                    let codeLine: ICodeLine = {lineID: shortid(), status: LineStatus.EDITED, result: null, generated: false};
                    addedLines.push(codeLine);                    
                }
                /** Insert the insersted lines into the array. Keep the ID of lines between 0 and updatedStartLineNumber 
                 * the same. That means line updatedStartLineNumber will be considered as `edited` but not a new line.
                 * See more note below. */                 
                codeLines = [...codeLines.slice(0, updatedStartLineNumber+1), ...addedLines, 
                    ...codeLines.slice(updatedStartLineNumber+1)];           
            } else if (lineUpdate.updatedLineCount<0){
                let deletedLineCount = -lineUpdate.updatedLineCount;
                /** Some lines have been deleted */
                for(let i=0; i<deletedLineCount; i++){
                    //TODO: make this thing like plugin and hook so we can handle different kind of output
                    if(codeLines[updatedStartLineNumber+1+i].result && 
                        codeLines[updatedStartLineNumber+1+i].result.type == ContentType.PLOTLY_FIG){
                        state.plotResultUpdate -= 1;
                    }                 
                }
                /** Remove lines from updatedStartLineNumber+1. Keep the ID of lines between 0 and updatedStartLineNumber 
                 * the same. That means line updatedStartLineNumber will be considered as `edited` but not a new line.
                 * See more note below. */                 
                codeLines = [...codeLines.slice(0, updatedStartLineNumber+1), 
                    ...codeLines.slice(updatedStartLineNumber+1+deletedLineCount)];                           
            }
                 
            /** mark the first line where the insert is `edited`, this is correct in most case except for case
            * where the anchor is right after the new line character. In this case, the anchor will be
            * right at the beginning of an existing line, so technically this line is not edited.
            * for simplicity, we ignore this case for now */
            codeLines[updatedStartLineNumber].status = LineStatus.EDITED;
            state.codeLines[inViewID] = codeLines;
        },

        setLineStatus: (state, action) => {
            let lineStatus: ICodeLineStatus = action.payload;
            let inViewID = lineStatus.inViewID;
            let codeLines: ICodeLine[] = state.codeLines[inViewID];            
            if(lineStatus.status !== undefined){
                if(lineStatus.status === LineStatus.EDITED && lineStatus.text !== undefined){
                    // console.log('CodeEditorRedux: ', lineStatus.status);
                    state.codeText[inViewID] = lineStatus.text;
                    state.fileSaved = false;
                } 
                codeLines[lineStatus.lineNumber].status = lineStatus.status;
            } 
            if(lineStatus.generated !== undefined){
                codeLines[lineStatus.lineNumber].generated = lineStatus.generated;
            }            
        },

        setLineGroupStatus: (state, action) => {
            let lineGroupStatus: ICodeLineGroupStatus = action.payload;
            let inViewID = lineGroupStatus.inViewID;
            let codeLines: ICodeLine[] = state.codeLines[inViewID]; 
            let groupID;           
            
            if (lineGroupStatus.setGroup === SetLineGroupCommand.NEW){
                groupID = shortid();
            }

            for(let i=lineGroupStatus.fromLine; i<lineGroupStatus.toLine; i++){
                if(lineGroupStatus.status !== undefined){
                    if(lineGroupStatus.status === LineStatus.EDITED && lineGroupStatus.text !== undefined){
                        // console.log('CodeEditorRedux: ', lineStatus.status);
                        state.codeText[inViewID] = lineGroupStatus.text;
                    } 
                    codeLines[i].status = lineGroupStatus.status;
                } 
                if(lineGroupStatus.generated !== undefined){
                    codeLines[i].generated = lineGroupStatus.generated;
                }
                codeLines[i].groupID = groupID;
            }                        
        },

        /**
         * 
         * @param state 
         * @param action 
         * 
         * TODO: implement an optimized version to store result. currently the consumer of the resul will
         * be invoked anytime `codeLines` updated
         */
        addPlotResult: (state, action) => {
            let resultMessage: ICodeResultMessage = action.payload;  
            let inViewID = resultMessage.inViewID;          
            let plotResult: IPlotResult = {plot: JSON.parse(ifElseDict(resultMessage.content, 'plot'))};   
            let lineNumber = ifElseDict(resultMessage.metadata, 'line_number');
            let result: ICodeResult = {type: resultMessage.type, content: plotResult};            
            if(lineNumber){
                let codeLine: ICodeLine = state.codeLines[inViewID][lineNumber];
                codeLine.result = result;

                // let statePlotResults: IStatePlotResults = state.plotResults;
                // statePlotResults[codeLine.lineID] = plotResult;
                state.plotResultUpdate += 1;
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
            console.log('CodeEditorRedux setRunQueue status: ', state.runQueue.status);
            if(state.runQueue.status === RunQueueStatus.STOP) {
                let data = action.payload;            
                state.runQueue = {
                    status: RunQueueStatus.RUNNING,
                    fromLine: data.fromLine,
                    toLine: data.toLine,
                    runningLine: data.fromLine,
                }
                // return true;
            }
            // return false;
        },

        /** Inform the run queue that the current line execution has been completed */
        compeleteRunLine: (state, action) => {
            if(state.runQueue.status === RunQueueStatus.RUNNING){
                let runQueue: IRunQueue = state.runQueue;
                if (runQueue.runningLine && runQueue.toLine && runQueue.runningLine<runQueue.toLine-1){ 
                    /** do not run line at toLine */
                    runQueue.runningLine += 1;
                } else {
                    runQueue.status = RunQueueStatus.STOP;
                }                
            }
        }
    },
})

// Action creators are generated for each case reducer function
export const { 
    initCodeText, 
    updateLines, 
    addPlotResult, 
    setLineStatus, 
    setLineGroupStatus, 
    setActiveLine, 
    setFileSaved,
    setRunQueue, 
    compeleteRunLine } = CodeEditorRedux.actions

export default CodeEditorRedux.reducer