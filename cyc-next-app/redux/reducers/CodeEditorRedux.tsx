import shortid from "shortid";
import { createSlice, current } from '@reduxjs/toolkit'
import { ICodeResult, ICodeResultMessage, ICodeLine, ILineUpdate, IPlotResult, LineStatus, IStatePlotResults, ICodeLineStatus, ICodeLineGroupStatus, SetLineGroupCommand, IRunQueue, RunQueueStatus } from '../../lib/interfaces/ICodeEditor';
import { ifElseDict } from "../../lib/components/libs";
import { ContentType } from "../../lib/interfaces/IApp";

export const CodeEditorRedux = createSlice({
    name: 'codeEditor',
    initialState: {
        text: [],
        codeLines: [],
        fileSaved: true,
        runQueue: {status: RunQueueStatus.STOP},
        /** plotResultUpdate indicates whether a plot is added or removed. This is to optimize for the performance of 
         * PlotView, which would only be rerendered when this variable is updated */ 
        plotResultUpdate: 0,
        activeLine: -1,
    },

    reducers: {
        initCodeDoc: (state, action) => {  
            state.text = action.payload.text;
            let codeLines: ICodeLine[] = [];
            for(let i=0; i<state.text.length; i++){
                let codeLine: ICodeLine = {lineID: shortid(), status: LineStatus.EDITED, result: null, generated: false};
                codeLines.push(codeLine);                    
            }
            state.codeLines = codeLines;
        },

        updateLines: (state, action) => {
            let lineUpdate: ILineUpdate = action.payload;
            let updatedStartLineNumber = lineUpdate.updatedStartLineNumber;
            let codeLines: ICodeLine[] = state.codeLines;

            state.text = lineUpdate.text;
            state.fileSaved = false;

            console.log('Line update info: ', lineUpdate);
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
            state.codeLines = codeLines;
        },

        setLineStatus: (state, action) => {
            let lineStatus: ICodeLineStatus = action.payload;
            let codeLines: ICodeLine[] = state.codeLines;            
            if(lineStatus.status !== undefined){
                if(lineStatus.status === LineStatus.EDITED && lineStatus.text !== undefined){
                    // console.log('CodeEditorRedux: ', lineStatus.status);
                    state.text = lineStatus.text;
                } 
                codeLines[lineStatus.lineNumber].status = lineStatus.status;
            } 
            if(lineStatus.generated !== undefined){
                codeLines[lineStatus.lineNumber].generated = lineStatus.generated;
            }            
        },

        setLineGroupStatus: (state, action) => {
            let lineGroupStatus: ICodeLineGroupStatus = action.payload;
            let codeLines: ICodeLine[] = state.codeLines; 
            let groupID;           
            
            if (lineGroupStatus.setGroup === SetLineGroupCommand.NEW){
                groupID = shortid();
            }

            for(let i=lineGroupStatus.fromLine; i<lineGroupStatus.toLine; i++){
                if(lineGroupStatus.status !== undefined){
                    if(lineGroupStatus.status === LineStatus.EDITED && lineGroupStatus.text !== undefined){
                        // console.log('CodeEditorRedux: ', lineStatus.status);
                        state.text = lineGroupStatus.text;
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
            let plotResult: IPlotResult = {plot: JSON.parse(ifElseDict(resultMessage.content, 'plot'))};   
            let lineNumber = ifElseDict(resultMessage.metadata, 'line_number');
            let result: ICodeResult = {type: resultMessage.type, content: plotResult};            
            if(lineNumber){
                let codeLine: ICodeLine = state.codeLines[lineNumber];
                codeLine.result = result;

                // let statePlotResults: IStatePlotResults = state.plotResults;
                // statePlotResults[codeLine.lineID] = plotResult;
                state.plotResultUpdate += 1;
            }               
        },

        setActiveLine: (state, action) => {
            let lineNumber = action.payload;
            let codeLines: ICodeLine[] = state.codeLines;
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
                if (runQueue.runningLine<runQueue.toLine-1){ /** do not run line at toLine */
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
    initCodeDoc, updateLines, addPlotResult, setLineStatus, setLineGroupStatus, setActiveLine, setFileSaved,
    setRunQueue, compeleteRunLine } = CodeEditorRedux.actions

export default CodeEditorRedux.reducer