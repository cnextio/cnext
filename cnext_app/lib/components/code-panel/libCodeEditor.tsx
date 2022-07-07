import { gutter, GutterMarker, gutterLineClass } from "@codemirror/gutter";
import { EditorState, StateEffect, StateField, Transaction, TransactionSpec } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import {
    setActiveLine as setActiveLineRedux,
    setLineGroupStatus,
    addToRunQueue as addToRunQueueRedux,
} from "../../../redux/reducers/CodeEditorRedux";
import { setScrollPos } from "../../../redux/reducers/ProjectManagerRedux";
import {
    ICodeActiveLine,
    ICodeLine,
    ICodeLineGroupStatus,
    ICodeLineStatus,
    ILineRange,
    IRunningCommandContent,
    IRunQueue,
    IRunQueueItem,
    LineStatus,
    RunQueueStatus,
    SetLineGroupCommand,
} from "../../interfaces/ICodeEditor";
import { CASSIST_STARTER, ICAssistInfo, IInsertLinesInfo } from "../../interfaces/ICAssist";
import { ifElse } from "../libs";
import { python } from "../../codemirror/grammar/lang-cnext-python";
import store from "../../../redux/store";
import { RootState } from "../../../redux/store";
import socket from "../Socket";

const markerDiv = () => {
    let statusDiv = document.createElement("div");
    statusDiv.style.width = "2px";
    statusDiv.style.height = "100%";
    return statusDiv;
};

const executedOkColor = "#42a5f5";
const executedFailedColor = "#f30c0c";
const executingColor = "#F59242";
const editedMarker = new (class extends GutterMarker {
    toDOM() {
        return markerDiv();
    }
})();

const inqueueMarker = new (class extends GutterMarker {
    toDOM() {
        let statusDiv = markerDiv();
        statusDiv.style.backgroundColor = executingColor;
        return statusDiv;
    }
})();

const executingMarker = new (class extends GutterMarker {
    toDOM() {
        let statusDiv = markerDiv();
        statusDiv.animate(
            [{ backgroundColor: "" }, { backgroundColor: executingColor, offset: 0.5 }],
            { duration: 2000, iterations: Infinity }
        );
        return statusDiv;
    }
})();

const executedOkMarker = new (class extends GutterMarker {
    toDOM() {
        let statusDiv = markerDiv();
        statusDiv.style.backgroundColor = executedOkColor;
        return statusDiv;
    }
})();

const executedFailedMarker = new (class extends GutterMarker {
    toDOM() {
        let statusDiv = markerDiv();
        statusDiv.style.backgroundColor = executedFailedColor;
        return statusDiv;
    }
})();

const setAnchor = (view: EditorView, pos: number) => {
    if (view) {
        view.dispatch({
            selection: { anchor: pos, head: pos },
        });
    }
};

import { setLineStatus as setLineStatusRedux } from "../../../redux/reducers/CodeEditorRedux";
import { RangeSet } from "@codemirror/rangeset";
import { CommandName, ContentType, IMessage, WebAppEndpoint } from "../../interfaces/IApp";
import { Socket } from "socket.io-client";

const setLineStatus = (inViewID: string, lineRange: ILineRange, status: LineStatus) => {
    let lineStatus: ICodeLineStatus = {
        inViewID: inViewID,
        lineRange: lineRange,
        status: status,
    };
    store.dispatch(setLineStatusRedux(lineStatus));
};

const scrollToPos = (view: EditorView, lineNumber: number) => {
    let pos = view.state.doc.line(lineNumber + 1).from; // convert to 1-based
    view.dispatch({
        selection: { anchor: pos, head: pos },
        scrollIntoView: true,
    });
}

/** lineNum is 0 based */
const setAnchorToLine = (
    inViewID: string,
    view: EditorView,
    lineNumber: number,
    scrollIntoView: boolean
) => {
    if (view != null && inViewID != null) {
        scrollToPos(view, lineNumber);
        let activeLine: ICodeActiveLine = {
            inViewID: inViewID,
            lineNumber: lineNumber,
        };
        store.dispatch(setActiveLineRedux(activeLine));
    }
};

/** curLineNumber is 0-based */
const setAnchorToNextGroup = (
    inViewID: string,
    codeLines: ICodeLine[],
    view: EditorView,
    anchorLineNumber: number
) => {
    let originGroupID = codeLines[anchorLineNumber].groupID;
    // console.log("CodeEditor setAnchorToNextGroup: ", anchorLineNumber, originGroupID);
    if (originGroupID != null) {
        let curlineNumber = anchorLineNumber;
        let curGroupID: string | undefined = originGroupID;
        while (
            curlineNumber < codeLines.length - 1 &&
            (curGroupID == null || curGroupID === originGroupID)
        ) {
            curlineNumber += 1;
            curGroupID = codeLines[curlineNumber]?.groupID;
        }
        console.log(
            "CodeEditor setAnchorToNextGroup: ",
            anchorLineNumber,
            originGroupID,
            curlineNumber,
            curGroupID
        );
        if (view && curGroupID !== originGroupID) {
            setAnchorToLine(inViewID, view, curlineNumber, true);
        }
    }
};

const getCodeLine = (state: RootState): ICodeLine[] | null => {
    let inViewID = state.projectManager.inViewID;
    if (inViewID) {
        return ifElse(state.codeEditor.codeLines, inViewID, null);
    }
    return null;
};

/**
 * This function should only be called after `codeLines` has been updated. However because this is controlled by CodeMirror
 * intenal, we can't dictate when it will be called. To cope with this, we have to check the object existence carefully
 * and rely on useEffect to force this to be called again when `codeLines` updated
 */
const editStatusGutter = (inViewID: string | null, lines: ICodeLine[] | null) =>
    gutter({
        lineMarker(view, line) {
            // let inViewID = store.getState().projectManager.inViewID;
            if (inViewID) {
                // let lines = getCodeLine(store.getState());
                // line.number in state.doc is 1 based, so convert to 0 base
                let lineNumber = view.state.doc.lineAt(line.from).number - 1;
                // console.log(lines.length);
                if (lines && lineNumber < lines.length) {
                    // console.log("editStatusGutter: ", lineNumber, lines[lineNumber].status);
                    switch (lines[lineNumber].status) {
                        case LineStatus.EDITED:
                            return editedMarker;
                        case LineStatus.EXECUTING:
                            return executingMarker;
                        case LineStatus.EXECUTED_SUCCESS:
                            return executedOkMarker;
                        case LineStatus.EXECUTED_FAILED:
                            return executedFailedMarker;
                        case LineStatus.INQUEUE:
                            return inqueueMarker;
                    }
                }
            }
            return null;
        },
        initialSpacer: () => executedOkMarker,
    });

const getCodeText = (state: RootState) => {
    // let state = store.getState();
    let inViewID = state.projectManager.inViewID;
    if (inViewID != null) {
        return ifElse(state.codeEditor.codeText, inViewID, null);
    }
    return null;
};

const getJoinedCodeText = (state: RootState) => {
    let codeText = getCodeText(state);
    if (codeText) codeText = codeText.join("\n");
    return codeText;
};

const scrollToPrevPos = (state: RootState) => {
    let scrollEl = document.querySelector("div.cm-scroller") as HTMLElement;
    let inViewID = state.projectManager.inViewID;
    if (inViewID) {
        let openFile = state.projectManager.openFiles[inViewID];
        if (openFile && openFile.scroll_pos) {
            scrollEl.scrollTop = openFile.scroll_pos;
        }
    }
};

const setViewCodeText = (state: RootState, view: EditorView) => {
    console.log("CodeEditor setViewCodeText");
    let codeText = getJoinedCodeText(state);
    if (view) {
        // let transactionSpec: TransactionSpec = {
        //     changes: {
        //         from: 0,
        //         to: 0,
        //         insert: codeText,
        //     },
        // };
        // let transaction: Transaction = view.state.update(transactionSpec);        
        // view.dispatch(transaction);
        view.setState(EditorState.create({ doc: codeText }));
    }
};

enum GenLineEffectType {
    FLASHING,
    SOLID,
}

const genLineFlashCSS = Decoration.line({ attributes: { class: "cm-genline-flash" } });

const genLineSolidCSS = Decoration.line({ attributes: { class: "cm-genline-solid" } });

/** Implement the decoration for magic generated code lines */
/**
 * Implement the flashing effect after line is inserted.
 * This function also reset magicInfo after the animation completes.
 * */
const setFlashingEffect = (reduxState: RootState, view: EditorView, cAssistInfo: ICAssistInfo) => {
    console.log("CodeEditor cAssist _setFlashingEffect", cAssistInfo, view);
    if (cAssistInfo && view) {
        view.dispatch({ effects: [StateEffect.appendConfig.of([genLineDeco(reduxState, view)])] });
        view.dispatch({
            effects: [
                GenLineStateEffect.of({
                    lineInfo: cAssistInfo.insertedLinesInfo,
                    type: GenLineEffectType.FLASHING,
                }),
            ],
        });
    }
};

/** note that this lineNumber is 1-based */
const GenLineStateEffect = StateEffect.define<{
    lineInfo?: IInsertLinesInfo;
    type: GenLineEffectType;
}>();
const genLineDeco = (reduxState: RootState, view: EditorView) =>
    StateField.define<DecorationSet>({
        create() {
            return Decoration.none;
        },
        update(lineBackgrounds, tr) {
            lineBackgrounds = lineBackgrounds.map(tr.changes);
            if (view) {
                for (let effect of tr.effects) {
                    if (effect.is(GenLineStateEffect)) {
                        // console.log('Magic generatedCodeDeco update ', effect.value.type);
                        if (effect.value.type === GenLineEffectType.FLASHING) {
                            if (effect.value.lineInfo !== undefined) {
                                let lineInfo = effect.value.lineInfo;
                                for (let i = lineInfo.fromLine; i < lineInfo.toLine; i++) {
                                    /** convert line number to 1-based */
                                    let line = view.state.doc.line(i + 1);
                                    // console.log('Magics line from: ', line, line.from);
                                    lineBackgrounds = lineBackgrounds.update({
                                        add: [genLineFlashCSS.range(line.from)],
                                    });
                                    // console.log('Magic _setFlashingEffect generatedCodeDeco update ', line.from);
                                }
                            }
                        } else {
                            /** effect.value.type is SOLID */
                            let inViewID = reduxState.projectManager.inViewID;
                            if (inViewID) {
                                let lines: ICodeLine[] | null = getCodeLine(reduxState);
                                if (lines) {
                                    for (let l = 0; l < lines.length; l++) {
                                        if (lines[l].generated === true) {
                                            console.log(
                                                "CodeEditor Magic generatedCodeDeco ",
                                                effect.value.type
                                            );
                                            let line = view.state.doc.line(l + 1);
                                            lineBackgrounds = lineBackgrounds.update({
                                                add: [genLineSolidCSS.range(line.from)],
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return lineBackgrounds;
        },
        provide: (f) => EditorView.decorations.from(f),
    });
const setGenLineDeco = (reduxState: RootState, view: EditorView | undefined) => {
    if (view) {
        // console.log('CodeEditor set gencode solid')
        view.dispatch({ effects: [StateEffect.appendConfig.of([genLineDeco(reduxState, view)])] });
        view.dispatch({ effects: [GenLineStateEffect.of({ type: GenLineEffectType.SOLID })] });
    }
};

const groupLineCSS = (clazz: string) => Decoration.line({ attributes: { class: clazz } });
const GroupedLineStateEffect = StateEffect.define<{}>();
const groupedLineDeco = (reduxState: RootState, view: EditorView) =>
    StateField.define<DecorationSet>({
        create() {
            return Decoration.none;
        },
        update(lineBackgrounds, tr) {
            const activeGroup = store.getState().codeEditor.activeGroup;
            lineBackgrounds = lineBackgrounds.map(tr.changes);
            if (view) {
                for (let effect of tr.effects) {
                    if (effect.is(GroupedLineStateEffect)) {
                        // console.log('Magic generatedCodeDeco update ', effect.value.type);
                        let inViewID = reduxState.projectManager.inViewID;
                        if (inViewID) {
                            let lines: ICodeLine[] | null = getCodeLine(reduxState);
                            if (lines) {
                                let currentGroupID = null;
                                for (let ln = 0; ln < lines.length; ln++) {
                                    /** convert to 1-based */
                                    let line = view.state.doc.line(ln + 1);
                                    if (!lines[ln].generated && lines[ln].groupID != null) {
                                        const active_clazz =
                                            activeGroup === lines[ln].groupID ? "active" : "";
                                        if (lines[ln].groupID != currentGroupID) {
                                            lineBackgrounds = lineBackgrounds.update({
                                                add: [
                                                    groupLineCSS(
                                                        "cm-groupedfirstline " + active_clazz
                                                    ).range(line.from),
                                                ],
                                            });
                                        } else {
                                            // console.log('CodeEditor grouped line deco');
                                            lineBackgrounds = lineBackgrounds.update({
                                                add: [
                                                    groupLineCSS(
                                                        "cm-groupedline " + active_clazz
                                                    ).range(line.from),
                                                ],
                                            });
                                        }
                                        if (
                                            /** this is the last line */
                                            ln + 1 === lines.length ||
                                            /** next line belongs to a different group */
                                            lines[ln].groupID !== lines[ln + 1].groupID
                                        ) {
                                            lineBackgrounds = lineBackgrounds.update({
                                                add: [
                                                    groupLineCSS(
                                                        "cm-groupedlastline " + active_clazz
                                                    ).range(line.from),
                                                ],
                                            });
                                        }
                                    }
                                    currentGroupID = lines[ln].groupID;
                                }
                            }
                        }
                    }
                }
            }
            return lineBackgrounds;
        },
        provide: (f) => EditorView.decorations.from(f),
    });
const setGroupedLineDeco = (reduxState: RootState, view: EditorView | undefined) => {
    if (view != null) {
        // console.log('CodeEditor set gencode solid')
        view.dispatch({
            effects: [StateEffect.appendConfig.of([groupedLineDeco(reduxState, view)])],
        });
        view.dispatch({ effects: [GroupedLineStateEffect.of({})] });
    }
};

/**
 * Get the line range of the group that contains lineNumber
 * @param lineNumber
 * @returns line range which is from fromLine to toLine excluding toLine
 */
const getLineRangeOfGroup = (codeLines: ICodeLine[], lineNumber: number): ILineRange => {
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
/** */

const scrollTimer = (dispatch, scrollEl: HTMLElement) => {
    scrollEl.onscroll = null;
    setTimeout(() => {
        scrollEl.onscroll = (event) => scrollTimer(dispatch, scrollEl);
        dispatch(setScrollPos(scrollEl.scrollTop));
    }, 100);
};

// const firstLineOfGroupMarker = new (class extends GutterMarker {
//     elementClass = "cm-groupedfirstlinegutter cm-activeLineGutter";
// })();

// const lastLineOfGroupMarker = new (class extends GutterMarker {
//     elementClass = "cm-groupedlastlinegutter cm-activeLineGutter";
// })();

const groupedLineGutterHighlighter = gutterLineClass.compute(["doc"], (state) => {
    let marks = [];
    let reduxState = store.getState();
    let inViewID = reduxState.projectManager.inViewID;
    if (inViewID) {
        let lines: ICodeLine[] | null = getCodeLine(reduxState);
        if (lines && state.doc.lines === lines.length) {
            let currentGroupID = null;
            for (let ln = 0; ln < lines.length; ln++) {
                /** convert to 1-based */
                let line = state.doc.line(ln + 1);
                if (!lines[ln].generated && lines[ln].groupID != null) {
                    // const active_clazz = activeGroup === lines[ln].groupID ? "active" : "";
                    if (lines[ln].groupID != currentGroupID) {
                        // marks.push(firstLineOfGroupMarker.range(line.from));
                    } else {
                    }
                    if (
                        /** this is the last line */
                        ln + 1 === lines.length ||
                        /** next line belongs to a different group */
                        lines[ln].groupID !== lines[ln + 1].groupID
                    ) {
                        // marks.push(lastLineOfGroupMarker.range(line.from));
                    }
                }
                currentGroupID = lines[ln].groupID;
            }
        }
    }
    return RangeSet.of(marks);
});

function groupedLineGutter() {
    return groupedLineGutterHighlighter;
}

/** lineNumber is 0-based */
function setActiveLine(lineNumber: number) {
    try {
        // console.log('CodeEditor onMouseDown', view, event, dispatch);
        //Note: can't use editorRef.current.state.doc, this one is useless, did not update with the doc.
        let inViewID = store.getState().projectManager.inViewID;
        if (inViewID) {
            let activeLine: ICodeActiveLine = {
                inViewID: inViewID,
                lineNumber: lineNumber,
            };
            store.dispatch(setActiveLineRedux(activeLine));
            // console.log('CodeEditor onMouseDown', doc, pos, lineNumber);
        }
    } catch (error) {
        console.error(error);
    }
}

function onMouseDown(event: MouseEvent, view: EditorView) {
    try {
        // console.log('CodeEditor onMouseDown', view, event, dispatch);
        if (view != null) {
            //Note: can't use editorRef.current.state.doc, this one is useless, did not update with the doc.
            let doc = view.state.doc;
            let pos = view.posAtDOM(event.target);
            //convert to 0-based
            let lineNumber = doc.lineAt(pos).number - 1;
            setActiveLine(lineNumber);
        }
    } catch (error) {
        console.error(error);
    }
}

function onKeyDown(event: KeyboardEvent, view: EditorView) {
    try {
        // console.log('CodeEditor onKeyDown', view, event);
        if (view != null) {
            //Note: can't use editorRef.current.state.doc, this one is useless, did not update with the doc.
            let doc = view.state.doc;
            const pos = view.state.selection.ranges[0].anchor;
            //convert to 0-based
            let lineNumber = doc.lineAt(pos).number - 1;
            setActiveLine(lineNumber);
        }
    } catch (error) {
        console.error(error);
    }
}

const setHTMLEventHandler = (container: HTMLDivElement, view: EditorView, dispatch) => {
    if (container) {
        container.onmousedown = (event) => onMouseDown(event, view);
        container.onkeydown = (event) => onKeyDown(event, view);
        let scrollEl = document.querySelector("div.cm-scroller") as HTMLElement;
        if (scrollEl) scrollEl.onscroll = (event) => scrollTimer(dispatch, scrollEl);
    }
};

const isPromise = (object) => {
    if (Promise && Promise.resolve) {
        return Promise.resolve(object) == object;
    } else {
        throw "Promise not supported in your environment"; // Most modern browsers support Promises
    }
};

/** Functions that support runQueue */
// const getRunningCommandContent = (view: EditorView, runqueue: IRunQueue): IRunningCommandContent|undefined => {
//     let content: IRunningCommandContent|undefined;
//     if (view){
//         const doc = view.state.doc;
//         if (!runqueue.runAllAtOnce){
//             const lineNumber = runqueue.runningLine;
//             // console.log('CodeEditor', cm, doc, doc.line(10));
//             if (lineNumber){
//                 /** convert lineNumber to 1-based */
//                 let line = doc.line(lineNumber+1);
//                 let text = line.text;
//                 /** Note that lines that are being run in lineRange must exclude toLine*/
//                 content = {lineRange: {fromLine: lineNumber, toLine: lineNumber+1}, content: text, runAllAtOnce: runqueue.runAllAtOnce};
//                 // convert the line number to 0-based index, which is what we use internally
//                 console.log('CodeEditor getRunningCommandContent code line to run: ', content);
//             }
//         } else {
//             if (runqueue.fromLine && runqueue.toLine){
//                 /** convert line number to 1-based */
//                 let fromPos = doc.line(runqueue.fromLine+1).from;
//                 /** runqueue.toLine won't be executed so getting line at toLine is equivalent getting toLine-1 in 1-based */
//                 let toPos = doc.line(runqueue.toLine).to;
//                 let text = doc.sliceString(fromPos, toPos);
//                 content = {lineRange: {fromLine: runqueue.fromLine, toLine: runqueue.toLine}, content: text, runAllAtOnce: runqueue.runAllAtOnce};
//                 console.log('CodeEditor getRunningCommandContent code group to run: ', content);
//             }
//         }

//     }
//     return content;
// }
const getRunningCommandContent = (
    view: EditorView,
    lineRange: ILineRange
): IRunningCommandContent | null => {
    let content: IRunningCommandContent | null = null;
    if (view) {
        const doc = view.state.doc;
        if (
            lineRange.fromLine != null &&
            lineRange.toLine != null &&
            lineRange.fromLine < lineRange.toLine
        ) {
            /** convert line number to 1-based */
            let fromPos = doc.line(lineRange.fromLine + 1).from;
            /** runqueue.toLine won't be executed so getting line at toLine is equivalent getting toLine-1 in 1-based */
            let toPos = doc.line(lineRange.toLine).to;
            let text = doc.sliceString(fromPos, toPos);
            content = {
                lineRange: lineRange,
                content: text,
            };
            console.log("CodeEditor getRunningCommandContent code group to run: ", content);
        }
    }
    return content;
};

/**
 * This will return undefined if a code line in the range is generated or already in another group
 * @param view
 * @param fromPos
 * @param toPos
 * @returns
 */
const getNonGeneratedLinesInRange = (
    codeLines: ICodeLine[] | null,
    view: EditorView,
    fromPos: number,
    toPos: number
): ILineRange | undefined => {
    if (codeLines && view) {
        const doc = view.state.doc;
        let pos = fromPos;
        /** minus 1 to convert to 0-based */
        let fromLine;
        let toLine;
        while (pos <= toPos) {
            console.log("Group ", fromPos, toPos, doc.lineAt(pos));
            let line = doc.lineAt(pos);
            /** minus 1 to convert to 0-based */
            if (
                codeLines[line.number - 1].groupID === undefined &&
                !codeLines[line.number - 1].generated &&
                line
            ) {
                if (fromLine === undefined) {
                    /** minus 1 to convert to 0-based */
                    fromLine = line.number - 1;
                }
                /** minus 1 to convert to 0-based */
                toLine = line.number - 1;
                /** add 1 for line break */
                pos = line.to + 1;
            } else {
                fromLine = toLine = undefined;
                break;
            }
        }
        if (fromLine !== undefined && toLine !== undefined) {
            /** the operating range will exclude toLine => add 1 to the value here*/
            return { fromLine: fromLine, toLine: toLine + 1 };
        } else {
            return undefined;
        }
    }
};

// export const notStartWithSpace = (text: string): boolean => {
//     return !/^\s/.test(text);
// };

/**
 * check if the text line is an Expression instead of a Statement
 * */
// export const textShouldBeExec = (text: string): boolean => {
//     let parser = python().language.parser;
//     let tree = parser.parse(text);
//     let cursor = tree.cursor(0, 0);
//     let parentName = cursor.name;
//     cursor.firstChild();
//     let childName = cursor.name;
//     /** not start with space */
//     return parentName == "Script" && childName == "ExpressionStatement" && notStartWithSpace(text);
// };

export const isRunQueueBusy = (runQueue: IRunQueue) => {
    return runQueue.queue.length > 0 || runQueue.status === RunQueueStatus.RUNNING;
};

/** Group/Ungroup */
/**
 * Do not allow grouping involed generated lines
 */
function setGroup(view: EditorView | undefined): boolean {
    if (view) {
        let range = view.state.selection.asSingle().ranges[0];
        let lineRange = getNonGeneratedLinesInRange(
            getCodeLine(store.getState()),
            view,
            range.from,
            range.to
        );
        let inViewID = store.getState().projectManager.inViewID;
        console.log("CodeEditor setGroup: ", lineRange, range);
        if (inViewID && lineRange && lineRange.toLine > lineRange.fromLine) {
            let lineStatus: ICodeLineGroupStatus = {
                inViewID: inViewID,
                fromLine: lineRange.fromLine,
                toLine: lineRange.toLine,
                status: LineStatus.EDITED,
                setGroup: SetLineGroupCommand.NEW,
            };
            store.dispatch(setLineGroupStatus(lineStatus));
        }
    }
    return true;
}

function setUnGroup(view: EditorView | undefined): boolean {
    if (view) {
        const doc = view.state.doc;
        const anchor = view.state.selection.asSingle().ranges[0].anchor;
        let lineAtAnchor = doc.lineAt(anchor);
        let reduxState = store.getState();
        let inViewID = reduxState.projectManager.inViewID;
        if (inViewID) {
            let codeLines = reduxState.codeEditor.codeLines[inViewID];
            /** minus 1 to convert to 0-based */
            let lineRange = getLineRangeOfGroup(codeLines, lineAtAnchor.number - 1);
            console.log("CodeEditor setUnGroup: ", lineRange);
            if (inViewID && lineRange && lineRange.toLine > lineRange.fromLine) {
                let lineStatus: ICodeLineGroupStatus = {
                    inViewID: inViewID,
                    fromLine: lineRange.fromLine,
                    toLine: lineRange.toLine,
                    // status: LineStatus.EDITED,
                    setGroup: SetLineGroupCommand.UNDEF,
                };
                store.dispatch(setLineGroupStatus(lineStatus));
            }
        }
    }
    return true;
}

/** Run queue and execution */
function addToRunQueue(view: EditorView | undefined) {
    // if (view && inViewID === executorID) {
    if (view) {
        const doc = view.state.doc;
        const state = view.state;
        const anchor = state.selection.ranges[0].anchor;
        let lineAtAnchor = doc.lineAt(anchor); /** 1-based */
        let text: string = lineAtAnchor.text;
        let lineNumberAtAnchor = lineAtAnchor.number - 1; /** 0-based */
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
                    lineRange = getLineRangeOfGroup(codeLines, lineNumberAtAnchor + 1);
                }
            } else {
                /** Get line range of group starting from the current line */
                /** convert to 0-based */
                lineRange = getLineRangeOfGroup(codeLines, lineNumberAtAnchor);
            }

            if (lineRange) {
                console.log("CodeEditor setRunQueue: ", lineRange);
                store.dispatch(addToRunQueueRedux({ lineRange: lineRange, inViewID: inViewID }));
            }
        }
    } else {
        console.log("CodeEditor can't execute code on none executor file!");
    }
    return true;
}

/** execute lines then move anchor to the next group if exist */
function addToRunQueueThenMoveDown(view: EditorView | undefined) {
    try {
        if (view != null) {
            addToRunQueue(view);
            let inViewID = store.getState().projectManager.inViewID;
            console.log("CodeEditor addToRunQueueThenMoveDown: ", inViewID);
            if (inViewID != null) {
                const state = view.state;
                const doc = view.state.doc;
                const anchor = state.selection.ranges[0].anchor;
                let curLineNumber = doc.lineAt(anchor).number - 1; // 0-based
                let codeLines = store.getState().codeEditor.codeLines[inViewID];
                setAnchorToNextGroup(inViewID, codeLines, view, curLineNumber);
            }
        }
    } catch (error) {
        console.error(error);
    }
    return true;
}
const execLines = (view: EditorView | undefined, runQueueItem: IRunQueueItem) => {
    let inViewID = runQueueItem.inViewID;
    let lineRange = runQueueItem.lineRange;
    if (inViewID && view && lineRange.toLine != null && lineRange.fromLine != null) {
        let content: IRunningCommandContent | null = getRunningCommandContent(view, lineRange);
        if (content != null && inViewID != null) {
            console.log("CodeEditor execLines: ", content, lineRange);
            sendMessage(socket, content);
            setLineStatus(inViewID, content.lineRange, LineStatus.EXECUTING);
        }
    }
};
/** */

/** message */
const createMessage = (content: IRunningCommandContent) => {
    let message: IMessage = {
        webapp_endpoint: WebAppEndpoint.CodeEditor,
        command_name: CommandName.exec_line,
        // seq_number: 1,
        content: content.content,
        type: ContentType.STRING,
        error: false,
        metadata: { line_range: content.lineRange },
    };

    return message;
};

const sendMessage = (socket: Socket, content: IRunningCommandContent) => {
    const message = createMessage(content);
    console.log(`${message.webapp_endpoint} send message: `, message);
    socket.emit(message.webapp_endpoint, JSON.stringify(message));
};
/** */

export {
    editedMarker,
    executedOkMarker,
    executingMarker,
    editStatusGutter,
    setLineStatus,
    getCodeLine,
    getCodeText,
    getJoinedCodeText,
    scrollToPrevPos,
    setViewCodeText,
    // resetEditorState,
    GenLineStateEffect as genLineStateEffect,
    GenLineEffectType as GenCodeEffectType,
    genLineFlashCSS as genCodeFlashCSS,
    genLineSolidCSS as genCodeSolidCSS,
    genLineDeco,
    setGenLineDeco,
    setGroupedLineDeco,
    setFlashingEffect,
    getLineRangeOfGroup,
    setHTMLEventHandler,
    isPromise,
    getRunningCommandContent,
    getNonGeneratedLinesInRange,
    scrollToPos,
    setAnchor,
    setAnchorToNextGroup,
    groupedLineGutter,
    setGroup,
    setUnGroup,
    addToRunQueue,
    addToRunQueueThenMoveDown,
    execLines,
    createMessage,
    sendMessage
};

