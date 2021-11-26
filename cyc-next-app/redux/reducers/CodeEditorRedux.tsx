import shortid from "shortid";
import { createSlice, current } from '@reduxjs/toolkit'
import { ICodeResult, ICodeResultMessage, ICodeLine, IInsertLineInfo, IPlotResult, LineStatus, IStatePlotResults, ICodeLineStatus } from '../../lib/interfaces/ICodeEditor';
import { ifElseDict } from "../../lib/components/libs";

export const CodeEditorRedux = createSlice({
    name: 'codeEditor',
    initialState: {
        text: '',
        codeLines: [],
        // we also use plotResults to store plot out indexed by lineID. This is to optimize for the performance of PlotView, which would only be rerendered
        // when this variable is updated
        plotResults: {},
    },

    reducers: {
        initCodeDoc: (state, action) => {  
            state.text = action.payload.text;
            let codeLines: ICodeLine[] = state.codeLines;
            for(let i=0; i<state.text.length; i++){
                let codeLine: ICodeLine = {lineID: shortid(), status: LineStatus.EDITED, result: null};
                codeLines.push(codeLine);                    
            }
        },

        insertLines: (state, action) => {
            let insertedLineInfo: IInsertLineInfo = action.payload;
            state.text = insertedLineInfo.text;
            console.log('Insert line info: ', insertedLineInfo);
            let addedLines: ICodeLine[] = [];
            for(let i=0; i<insertedLineInfo.insertedLineCount; i++){
                let codeLine: ICodeLine = {lineID: shortid(), status: LineStatus.EDITED, result: null};
                addedLines.push(codeLine);                    
            }
                 
            let insertedLineNumber = insertedLineInfo.anchorLineNumber-insertedLineInfo.insertedLineCount;
            let codeLines: ICodeLine[] = state.codeLines;
            // Insert the insersted lines into the array
            codeLines = [...codeLines.slice(0, insertedLineNumber+1), ...addedLines, 
                ...codeLines.slice(insertedLineNumber+1)];           
            
            // mark the line where the first line `edited`, this is correct in most case except for case
            // where the anchor is right after the new line character. In this case, the anchor will be
            // right at the beginning of an existing line, so technically this line is not edited.
            // for simplicity, we ignore this case for now
            codeLines[insertedLineNumber].status = LineStatus.EXECUTED;
            state.text = insertedLineInfo.text;
        },

        setLineStatus: (state, action) => {
            let lineStatus: ICodeLineStatus = action.payload;
            let codeLines: ICodeLine[] = state.codeLines;
            codeLines[lineStatus.lineNumber].status = lineStatus.status;
        },

        /**
         * 
         * @param state 
         * @param action 
         * 
         * We store the result both in `codeLines` and `plotResults` (see note above). 
         * Since they share the same memory it wont affect performance.
         */
        addPlotResult: (state, action) => {
            let resultMessage: ICodeResultMessage = action.payload;            
            let plotResult: IPlotResult = {plot: JSON.parse(ifElseDict(resultMessage.content, 'plot'))};   
            let lineNumber = ifElseDict(resultMessage.metadata, 'line_number');
            let result: ICodeResult = {type: resultMessage.type, content: plotResult};            
            if(lineNumber){
                let codeLine: ICodeLine = state.codeLines[lineNumber];
                codeLine.result = result;

                let statePlotResults: IStatePlotResults = state.plotResults;
                statePlotResults[codeLine.lineID] = plotResult;
            }               
        }
    },
})

// Action creators are generated for each case reducer function
export const { initCodeDoc, insertLines, addPlotResult, setLineStatus } = CodeEditorRedux.actions

export default CodeEditorRedux.reducer