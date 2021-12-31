import { lineNumbers, gutter, GutterMarker } from "@codemirror/gutter";
import { EditorState, StateEffect, StateField, Transaction, TransactionSpec } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { setActiveLine } from "../../../redux/reducers/CodeEditorRedux";
import { setScrollPos } from "../../../redux/reducers/ProjectManagerRedux";
import { ICodeLine, ILineRange, LineStatus } from "../../interfaces/ICodeEditor";
import { IInsertLinesInfo } from "../../interfaces/IMagic";
import { ifElse } from "../libs";

const markerDiv = () => {
    let statusDiv = document.createElement('div');
    statusDiv.style.width = '2px';
    statusDiv.style.height = '100%';        
    return statusDiv;
}

const executedColor = '#42a5f5';
const editedMarker = new class extends GutterMarker {
    toDOM() { 
        return markerDiv();
    }
}

const executingMarker = new class extends GutterMarker {
    toDOM() { 
        let statusDiv = markerDiv();
        statusDiv.animate([
            {backgroundColor: ''},
            {backgroundColor: executedColor, offset: 0.5}], 
            {duration: 2000, iterations: Infinity});
        return statusDiv;
    }
}

const executedMarker = new class extends GutterMarker {
    toDOM() { 
        let statusDiv = markerDiv();
        statusDiv.style.backgroundColor = executedColor;
        return statusDiv;
    }
}

const getCodeLine = (state): (ICodeLine[]|null) => {
    let inViewID = state.projectManager.inViewID;
    if (inViewID) {
        return ifElse(state.codeEditor.codeLines, inViewID, null);
    }
    return null;
}

/** 
 * This function should only be called after `codeLines` has been updated. However because this is controlled by CodeMirror 
 * intenal, we can't dictate when it will be called. To cope with this, we have to check the object existence carefully 
 * and rely on useEffect to force this to be called again when `codeLines` updated 
*/ 
const editStatusGutter = (inViewID: string|null, lines: ICodeLine[]|null) => gutter({
    lineMarker(view, line) {
        // let inViewID = store.getState().projectManager.inViewID;
        if (inViewID) {
            // let lines = getCodeLine(store.getState());
            // line.number in state.doc is 1 based, so convert to 0 base
            let lineNumber = view.state.doc.lineAt(line.from).number-1;
            // console.log(lines.length);
            if(lines && lineNumber<lines.length){                                
                switch(lines[lineNumber].status){
                    case LineStatus.EDITED: return editedMarker;
                    case LineStatus.EXECUTING: return executingMarker;
                    case LineStatus.EXECUTED: return executedMarker;
                }
            }
        }
        return null;
    },
    initialSpacer: () => executedMarker
})

const getCodeText = (state) => {
    // let state = store.getState();
    let inViewID = state.projectManager.inViewID;
    // console.log('CodeEditor getCodeText ', inViewID, editorRef.current);
    let codeText;
    if (inViewID) {            
        codeText = ifElse(state.codeEditor.codeText, inViewID, null);            
    }
    return codeText;
}

const getJoinedCodeText = (state) => {
    let codeText = getCodeText(state);
    if (codeText)
        codeText = codeText.join('\n');
    return codeText;
}

const scrollToPrevPos = (state) => {
    let scrollEl = document.querySelector('div.cm-scroller') as HTMLElement;
    let inViewID = state.projectManager.inViewID;
    if(inViewID){
        let openFile = state.projectManager.openFiles[inViewID];
        if (openFile && openFile.scroll_pos){
            scrollEl.scrollTop = openFile.scroll_pos;
        }
    }
    
}

const setViewCodeText = (state, view) => {
    console.log('CodeEditor loadCodeText');
    let codeText = getJoinedCodeText(state);
    if (view) {
        let transactionSpec: TransactionSpec = {
            changes: {
                from: 0, 
                to: 0, 
                insert: codeText
            }
        };                
        let transaction: Transaction = view.state.update(transactionSpec);
        view.dispatch(transaction);                         
    }
}

const resetEditorState = (view, extensions) => {
    if(view)
        view.setState(EditorState.create({doc: '', extensions: extensions}));
}

enum GenCodeEffectType {
    FLASHING,
    SOLID
};

const genCodeFlashCSS = Decoration.line({attributes: {class: "cm-genline-flash"}});

const genCodeSolidCSS = Decoration.line({attributes: {class: "cm-genline-solid"}});

/** Implement the decoration for magic generated code lines */
/** 
 * Implement the flashing effect after line is inserted.
 * This function also reset magicInfo after the animation completes. 
 * */
const setFlashingEffect = (reduxState, view: EditorView, magicInfo) => {
    console.log('Magic _setFlashingEffect', magicInfo, view);    
    if(magicInfo && view){
        view.dispatch({effects: [StateEffect.appendConfig.of([genLineDeco(reduxState, view)])]});
        view.dispatch({effects: [genLineStateEffect.of({
            lineInfo: magicInfo.lineInfo, 
            type: GenCodeEffectType.FLASHING})]});             
    }        
}

/** note that this lineNumber is 1-based */
const genLineStateEffect = StateEffect.define<{lineInfo?: IInsertLinesInfo, type: GenCodeEffectType}>()
const genLineDeco = (reduxState, view: EditorView) => StateField.define<DecorationSet>({
    create() {
        return Decoration.none;
    },
    update(marks, tr) {
        if (view){                               
            marks = marks.map(tr.changes)
            for (let effect of tr.effects) {
                if (effect.is(genLineStateEffect)) {
                    // console.log('Magic generatedCodeDeco update ', effect.value.type);     
                    if (effect.value.type === GenCodeEffectType.FLASHING) {
                        if (effect.value.lineInfo !== undefined){
                            let lineInfo = effect.value.lineInfo;
                            for (let i=lineInfo.fromLine; i<lineInfo.toLine; i++){
                                /** convert line number to 1-based */
                                let line = view.state.doc.line(i+1);
                                // console.log('Magics line from: ', line, line.from);
                                marks = marks.update({
                                    add: [genCodeFlashCSS.range(line.from)]
                                })
                                // console.log('Magic _setFlashingEffect generatedCodeDeco update ', line.from);                         
                            }                            
                        }                        
                    } else { /** effect.value.type is SOLID */
                        let inViewID = reduxState.projectManager.inViewID;
                        if (inViewID) {
                            let lines: ICodeLine[]|null = getCodeLine(reduxState);
                            if (lines) {
                                for (let l=0; l < lines.length; l++){
                                    if (lines[l].generated === true){
                                        console.log('CodeEditor Magic generatedCodeDeco ', effect.value.type);     
                                        let line = view.state.doc.line(l+1);
                                        marks = marks.update({
                                            add: [genCodeSolidCSS.range(line.from)]
                                        })
                                    }                            
                                }
                            }
                        }    
                    }
                }
            }           
            return marks
        }
    },
    provide: f => EditorView.decorations.from(f)
});
const setGenLineDeco = (reduxState, view: EditorView|undefined) => {
    if (view) {
        // console.log('CodeEditor set gencode solid')
        view.dispatch({effects: [StateEffect.appendConfig.of([genLineDeco(reduxState, view)])]});
        view.dispatch({effects: [genLineStateEffect.of({type: GenCodeEffectType.SOLID})]});             
    }
}

const groupedLinesCSS = Decoration.line({attributes: {class: "cm-groupedline"}});
const groupedLineStateEffect = StateEffect.define<{}>()
const groupedLineDeco = (reduxState, view: EditorView) => StateField.define<DecorationSet>({
    create() {
        return Decoration.none;
    },
    update(marks, tr) {
        if (view){                               
            marks = marks.map(tr.changes)
            for (let effect of tr.effects) {
                if (effect.is(groupedLineStateEffect)) {
                    // console.log('Magic generatedCodeDeco update ', effect.value.type);     
                    let inViewID = reduxState.projectManager.inViewID;
                    if (inViewID) {
                        let lines: ICodeLine[]|null = getCodeLine(reduxState);
                        if (lines) {
                            for (let ln=0; ln < lines.length; ln++){
                                if (lines[ln].groupID && !lines[ln].generated){
                                    // console.log('CodeEditor grouped line deco');
                                    /** convert to 1-based */     
                                    let line = view.state.doc.line(ln+1);
                                    marks = marks.update({
                                        add: [groupedLinesCSS.range(line.from)]
                                    })
                                }                            
                            }
                        }
                    }    
                }
            }           
            return marks
        }
    },
    provide: f => EditorView.decorations.from(f)
});
const setGroupedLineDeco = (reduxState, view: EditorView|undefined) => {
    if (view) {
        // console.log('CodeEditor set gencode solid')
        view.dispatch({effects: [StateEffect.appendConfig.of([groupedLineDeco(reduxState, view)])]});
        view.dispatch({effects: [groupedLineStateEffect.of({})]});             
    }
}

/**
     * Get the line range of the group that contains lineNumber
     * @param lineNumber 
     * @returns line range which is from fromLine to toLine excluding toLine
     */
 const getLineRangeOfGroup = (codeLines: ICodeLine[], lineNumber: number): ILineRange => {
    let groupID = codeLines[lineNumber].groupID;
    let fromLine = lineNumber;
    let toLine = lineNumber;
    if (groupID === undefined){
        toLine = fromLine+1;
    } else {
        while(fromLine>0 && codeLines[fromLine-1].groupID && codeLines[fromLine-1].groupID === groupID){
            fromLine -= 1;
        }
        while(toLine<codeLines.length && codeLines[toLine].groupID && codeLines[toLine].groupID === groupID){
            toLine += 1;
        }
    }        
    return {fromLine: fromLine, toLine: toLine};
}    
/** */

const scrollTimer = (dispatch, scrollEl: HTMLElement) => {
    scrollEl.onscroll = null;
    setTimeout(() => {
        scrollEl.onscroll = ((event) => scrollTimer(dispatch, scrollEl));
        dispatch(setScrollPos(scrollEl.scrollTop));
    }, 100);
}

function onMouseDown(event, view: EditorView, dispatch){
    try {
        if(view){
            //Note: can't use editorRef.current.state.doc, this one is useless, did not update with the doc.
            let doc = view.state.doc;
            let pos = view.posAtDOM(event.target);                
            //convert to 0-based
            let lineNumber = doc.lineAt(pos).number-1;        
            dispatch(setActiveLine(lineNumber));
            // console.log('CodeEditor onMouseDown', doc, pos, lineNumber);
        }                    
    } catch(error) {
        console.log(error);
        console.trace();
    }
}

const setHTMLEventHandler = (container, view: EditorView, dispatch) => {
    if (container){                
        container.onmousedown = (event) => onMouseDown(event, view, dispatch);  
        let scrollEl = document.querySelector('div.cm-scroller') as HTMLElement;
        scrollEl.onscroll = ((event) => scrollTimer(dispatch, scrollEl));
    }
}

const isPromise = (object) => {
    if (Promise && Promise.resolve) {
        return Promise.resolve(object) == object;
    } else {
        throw "Promise not supported in your environment"; // Most modern browsers support Promises
    }
}

/** Functions that support runQueue */
const getLineContent = (view, lineNumber: number): string|undefined => {
    let text: string|undefined;
    if (view){ 
        const doc = view.state.doc;
        /** convert lineNumber to 1-based */
        // console.log('CodeEditor', cm, doc, doc.line(10));
        let line = doc.line(lineNumber+1);
        text = line.text;         
        console.log('CodeEditor _getLineContent2 code line to run: ', lineNumber+1, text);
        // convert the line number to 0-based index, which is what we use internally
    }
    return text;
}

/**
 * This will return undefined if a code line in the range is generated or already in another group
 * @param view 
 * @param fromPos 
 * @param toPos 
 * @returns 
 */
const getNonGeneratedLinesInRange = (codeLines: ICodeLine[]|null, view: EditorView, fromPos: number, toPos: number): ILineRange|undefined => {
    if (codeLines && view){ 
        const doc = view.state.doc;
        let pos = fromPos;
        /** minus 1 to convert to 0-based */
        let fromLine;            
        let toLine;
        while(pos<=toPos){
            console.log("Group ", fromPos, toPos, doc.lineAt(pos));
            let line = doc.lineAt(pos);
            /** minus 1 to convert to 0-based */
            if(codeLines[line.number-1].groupID===undefined && !codeLines[line.number-1].generated && line){
                if (fromLine === undefined){
                    /** minus 1 to convert to 0-based */
                    fromLine = line.number-1;
                }
                /** minus 1 to convert to 0-based */
                toLine = line.number-1;
                /** add 1 for line break */
                pos = line.to+1;
            } else {
                fromLine = toLine = undefined;
                break;
            }
                
        }
        if(fromLine!==undefined && toLine!==undefined){
            /** the operating range will exclude toLine => add 1 to the value here*/
            return {fromLine: fromLine, toLine: toLine+1};
        }
        else{
            return undefined;            
        }
    }
}

export {
    editedMarker, 
    executedMarker, 
    executingMarker, 
    editStatusGutter, 
    getCodeLine, 
    getCodeText, 
    getJoinedCodeText,
    scrollToPrevPos,
    setViewCodeText,
    resetEditorState,
    genLineStateEffect,
    GenCodeEffectType,
    genCodeFlashCSS,
    genCodeSolidCSS,
    genLineDeco,
    setGenLineDeco,
    setGroupedLineDeco,
    setFlashingEffect,
    getLineRangeOfGroup,
    setHTMLEventHandler,
    isPromise,
    getLineContent,
    getNonGeneratedLinesInRange
}