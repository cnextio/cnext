import { CNextDataFrameExpresion, CNextPlotXDimExpression, CNextPlotYDimExpression, CNextXDimColumnNameExpression, CNextYDimColumnNameExpression } from "../../codemirror/grammar/cnext-python.terms";
import {ViewUpdate, ViewPlugin, DecorationSet} from "@codemirror/view"
import {WidgetType} from "@codemirror/view"
import {EditorView, Decoration} from "@codemirror/view"
import { CAssistOptType, CAssistPlotData, CASSIST_STARTER, ICAssistExtraOpt, ICAssistInfo } from "../../interfaces/ICAssist";
import store from '../../../redux/store';
import { ICodeLine } from "../../interfaces/ICodeEditor";

// enum CAssistWidgetType {
//     DROPDOWN, OPTION,
// };

// interface CAssistWidget {
//     widgetType: CAssistWidgetType;
//     choices: string|string[];
// };

// interface CAssistLineInfo {
//     lineNumber: number;
//     widgets: CAssistWidget[];
// };
// const CAssistLineStateEffect = StateEffect.define<CAssistLineInfo[]>()
// const cassistLineDeco = (reduxState, view: EditorView) => StateField.define<DecorationSet>({
//     create() {
//         return Decoration.none;
//     },
//     update(lineWidgets, tr) {
//         if (view){                               
//             lineWidgets = lineWidgets.map(tr.changes)
//             for (let effect of tr.effects) {
//                 if (effect.is(CAssistLineStateEffect)) {
//                     // console.log('Magic generatedCodeDeco update ', effect.value.type);     
//                     let inViewID = reduxState.projectManager.inViewID;                    
//                     if (inViewID) {
//                         let cassistInfoList = effect.value;
                        
//                         let lines: ICodeLine[]|null = getCodeLine(reduxState);
//                         if (lines) { 
//                             for (let cassistInfo of cassistInfoList){
//                                 let line = lines[cassistInfo.lineNumber];
//                                 for (let widget of cassistInfo.widgets) {
//                                     lineWidgets = lineWidgets.update({
//                                         add: [groupedLinesCSS.range(line.from)]
//                                     })                                    
//                                 }
//                             }
//                         }
//                     }    
//                 }
//             }           
//             return lineWidgets
//         }
//     },
//     provide: f => EditorView.decorations.from(f)
// });

// class CheckboxWidget extends WidgetType {
//   constructor(readonly checked: boolean) { super() }

//   eq(other: CheckboxWidget) { return other.checked == this.checked }

//   toDOM() {
//     let wrap = document.createElement("span")
//     wrap.setAttribute("aria-hidden", "true")
//     wrap.className = "cm-boolean-toggle"
//     let box = wrap.appendChild(document.createElement("input"))
//     box.type = "checkbox"
//     box.checked = this.checked
//     return wrap
//   }

//   ignoreEvent() { return false }
// }

// function checkboxes(view: EditorView) {
//     let widgets = []
//     let doc = view.state.doc;
//     if (doc) {
//         //TODO: implement it in the visibleRange
//         for (let ln=0; ln < doc.lines; ln++){
//             let line = view.state.doc.line(ln+1);
//             if(line.text.startsWith(CASSIST_STARTER)){
//                 let deco = Decoration.widget({widget: new CheckboxWidget(true), side: 1});
//                 widgets.push(deco.range(line.to));    
//             }            
//         }
//     }
//     return Decoration.set(widgets)
// }

// function toggleBoolean(view: EditorView, pos: number) {
//     let before = view.state.doc.sliceString(Math.max(0, pos - 5), pos)
//     let change
//     if (before == "false")
//         change = {from: pos - 5, to: pos, insert: "true"}
//     else if (before.endsWith("true"))
//         change = {from: pos - 4, to: pos, insert: "false"}
//     else
//         return false
//     view.dispatch({changes: change})
//     return true
// }

// const checkboxPlugin = ViewPlugin.fromClass(
//     class {
//         decorations: DecorationSet

//         constructor(view: EditorView) {
//             this.decorations = checkboxes(view)
//         }

//         update(update: ViewUpdate) {
//             if (update.docChanged || update.viewportChanged)
//                 this.decorations = checkboxes(update.view)
//         }
//     }, {
//         decorations: v => v.decorations,

//         eventHandlers: {
//             mousedown: (e, view) => {
//             let target = e.target as HTMLElement
//             if (target.nodeName == "INPUT" &&
//                 target.parentElement!.classList.contains("cm-boolean-toggle"))
//                 return toggleBoolean(view, view.posAtDOM(target))
//             }
//         }
//     }
// )

class SelectWidget extends WidgetType {
    constructor(readonly opt: ICAssistExtraOpt) { super() }
  
    eq(other: SelectWidget) { return false }
  
    toDOM() {
        let wrap = document.createElement("span");
        // wrap.setAttribute("aria-hidden", "true");
        let select = wrap.appendChild(document.createElement("select"));
        select.name = this.opt.name;
        // select.id = this.opt.name;
        select.className = "cm-cassist-selection"
        if (this.opt.opts) {
            for(let v of this.opt.opts){
                let option = select.appendChild(document.createElement("option"));
                option.value = v;
                option.label = v;
            }
        }    
        return wrap;
    }
  
    ignoreEvent() { return true }
}

function cAssistExtraOptsFunc(view: EditorView) {
    let widgets = [];
    let inViewID = store.getState().projectManager.inViewID;
    if (inViewID){
        let codeLines: ICodeLine[] = store.getState().codeEditor.codeLines[inViewID];
        if(codeLines){
            for (let line of codeLines){
                if(line.cAssistInfo!==undefined){
                    let cAssistInfo: ICAssistInfo|undefined = line.cAssistInfo;
                    if (cAssistInfo) {
                        let cAssistExtraOpts: ICAssistExtraOpt[]|undefined = cAssistInfo.cAssistExtraOpts;            
                        let lineEnd = view.state.doc.line(cAssistInfo.cAssistLineNumber+1).to;
                        if(cAssistExtraOpts){
                            for (let opt of cAssistExtraOpts) {
                                /** only support select for now */
                                if(opt && opt.type === CAssistOptType.SELECT){
                                    let deco = Decoration.widget({widget: new SelectWidget(opt), side: 1});
                                    widgets.push(deco.range(lineEnd));   
                                }
                            }
                        } 
                    }
                }    
            }
        }
    }
    return Decoration.set(widgets)
}

export const cAssistExtraOptsPlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet

        constructor(view: EditorView) {
            this.decorations = cAssistExtraOptsFunc(view)
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged)
                this.decorations = cAssistExtraOptsFunc(update.view)
        }
    }, {
        decorations: v => v.decorations,

        eventHandlers: {
            selectionchange: (e, view) => {
                // let target = e.target as HTMLElement
                // if (target.nodeName == "INPUT" &&
                //     target.parentElement!.classList.contains("cm-boolean-toggle"))
                //     return toggleBoolean(view, view.posAtDOM(target))
                console.log('CodeEditor mousedown');
            }
        }
    }
)

/**
     * Parse the magic code lines and generate magic internal data structure
     * 
     * Currently only implement the plot magic. The plot will start first with #! plot.
     * The current grammar will make good detection of CNextStatement except for when 
     * the command line ends with eof. Not sure why the grammar does not work with it.
     * The cnext plot pattern looks like this:
     * CNextPlotExpression(CNextPlotKeyword,
     * DataFrameExpresion,
     * CNextPlotYDimExpression(ColumnNameExpression),
     * CNextPlotAddDimKeyword(vs),
     * CNextPlotXDimExpression(ColumnNameExpression))
     * */
export const parseCAssistText = (cursor, text) => {
    let plotData: CAssistPlotData = {
        magicTextRange: {from: cursor.from, to: cursor.to},
        df: null,
        x: null,
        y: null
    };              
    // let endPlotPos = cursor.to;  
    plotData.magicTextRange = {from: cursor.from, to: cursor.to};                      
    // while(cursor.to <= endPlotPos){
    cursor.next();
    // if(cursor.type.id === CNextPlotKeyword){
    //     cursor.nextSibling(); //skip CNextPlotKeyword
    // }
    // console.log(cursor.name);
    if (cursor.type.id == CNextDataFrameExpresion){
        // console.log('DF: ', text.substring(cursor.from, cursor.to));
        plotData.df = text.substring(cursor.from, cursor.to);
        cursor.nextSibling();
        // console.log(cursor.name);
    } 
    if (cursor.type.id === CNextPlotYDimExpression){
        let endYDim = cursor.to;
        plotData.y = []
        while((cursor.to <= endYDim) && cursor){
            if(cursor.type.id === CNextYDimColumnNameExpression){
                // console.log('Y dim: ', text.substring(cursor.from, cursor.to));
                // remove quotes
                plotData.y.push(text.substring(cursor.from+1, cursor.to-1));
            }       
            cursor.next();     
            // console.log(cursor.name);       
        }         
        cursor.nextSibling(); //skip CNextPlotAddDimKeyword
        // console.log(cursor.name);
        if (cursor.type.id === CNextPlotXDimExpression){
            let endXDim = cursor.to;
            plotData.x = []
            while((cursor.to <= endXDim) && cursor){                                        
                if(cursor.type.id === CNextXDimColumnNameExpression){
                    // console.log('X dim: ', text.substring(cursor.from, cursor.to));
                    // remove quotes
                    plotData.x.push(text.substring(cursor.from+1, cursor.to-1));
                }
                cursor.next();                  
                // console.log(cursor.name);
            }         
        }
    }
    return plotData; 
}