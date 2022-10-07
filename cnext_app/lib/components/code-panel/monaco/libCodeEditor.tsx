import { Monaco } from "@monaco-editor/react";
import {
    setActiveLine as setActiveLineRedux,
    setLineGroupStatus,
    setMouseOverGroup,
    setMouseOverLine,
    setViewStateEditor,
    updateLines,
} from "../../../../redux/reducers/CodeEditorRedux";
import store, { RootState } from "../../../../redux/store";
import {
    ICodeActiveLine,
    ICodeLine,
    ICodeLineGroupStatus,
    ICodeLineStatus,
    ILineRange,
    IRunningCommandContent,
    IRunQueueItem,
    LineStatus,
    SetLineGroupCommand,
} from "../../../interfaces/ICodeEditor";
import { ifElse } from "../../libs";
import { setLineStatus as setLineStatusRedux } from "../../../../redux/reducers/CodeEditorRedux";
import socket from "../../Socket";
import { CommandName, ContentType, IMessage, WebAppEndpoint } from "../../../interfaces/IApp";
import { Socket } from "socket.io-client";
import { addGroupToRunQueue } from "./libRunQueue";

export const getCodeLine = (state: RootState): ICodeLine[] | null => {
    let inViewID = state.projectManager.inViewID;
    if (inViewID) {
        return ifElse(state.codeEditor.codeLines, inViewID, null);
    }
    return null;
};

export const getCodeText = (state: RootState) => {
    let inViewID = state.projectManager.inViewID;
    if (inViewID) {
        let codeText = ifElse(state.codeEditor.codeText, inViewID, null);
        if (codeText) return codeText.join("\n");
    }
    return null;
};

function setActiveLine(inViewID: string, lineNumber: number) {
    try {
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

function setWidgetOpacity(id: string, opacity: string) {
    let element = document.getElementById(`cellwidget-${id}`) as HTMLElement | null;
    if (element) {
        // element.style.opacity = opacity;
        if (opacity === "1") element.classList.add("show-toolbar");
        else element.classList.remove("show-toolbar");
    }
}

function onKeyUp(editor, event) {
    try {
        // event.stopPropagation();
        // console.log("Monaco onMouseDown", event?.target?.position);
        let ln1based = editor.getPosition().lineNumber;
        let state = store.getState();
        const activeLineNumber = state.codeEditor.activeLineNumber;
        let inViewID = state.projectManager.inViewID;
        if (inViewID && ln1based != null && activeLineNumber !== ln1based - 1) {
            setActiveLine(inViewID, ln1based - 1);
        }
    } catch (error) {
        console.error(error);
    }
}

function onMouseDown(event) {
    try {
        // event.stopPropagation();
        // console.log("Monaco onMouseDown", event?.target?.position);
        let ln1based = event?.target?.position?.lineNumber;
        console.log(`onMouseDown`, onMouseDown);

        let state = store.getState();
        const activeLineNumber = state.codeEditor.activeLineNumber;
        let inViewID = store.getState().projectManager.inViewID;
        if (inViewID && ln1based != null && activeLineNumber !== ln1based - 1) {
            setActiveLine(inViewID, ln1based - 1);
        }
    } catch (error) {
        console.error(error);
    }
}

function onMouseMove(event) {
    try {
        if (event.target && !event.target?.detail?.viewZoneId) {
            let state = store.getState();
            const mouseOverGroupID = state.codeEditor.mouseOverGroupID;
            let lines: ICodeLine[] | null = getCodeLine(state);
            let ln0based = event?.target?.position?.lineNumber - 1; /** 0-based */

            if (lines && ln0based >= 0) {
                let currentGroupID = lines[ln0based]?.groupID;
                // console.log(`CodeEditor onMouseOver`, currentGroupID, doc.line(lineNumber + 1));
                if (currentGroupID && currentGroupID !== mouseOverGroupID) {
                    setWidgetOpacity(currentGroupID, "1");
                    if (mouseOverGroupID) {
                        setWidgetOpacity(mouseOverGroupID, "0");
                    }
                    store.dispatch(setMouseOverGroup(currentGroupID));
                }
                // store.dispatch(setMouseOverLine(ln0based));
            }
        }

        // console.log('CodeEditor onMouseDown', view, event, dispatch);
    } catch (error) {
        console.error(error);
    }
}

function onMouseLeave(event, editor) {
    try {
        if (event != null) {
            const inViewID = store.getState().projectManager.inViewID;
            if (inViewID && editor) {
                const viewState = editor.saveViewState();
                store.dispatch(setViewStateEditor({ inViewID, viewState }));
            }

            let reduxState = store.getState();
            const mouseOverGroupID = reduxState.codeEditor.mouseOverGroupID;
            if (mouseOverGroupID) {
                /* eslint-disable */
                setWidgetOpacity(mouseOverGroupID, "0");
            }
            store.dispatch(setMouseOverGroup(undefined));
            store.dispatch(setMouseOverLine(undefined));
        }
    } catch (error) {
        console.error(error);
    }
}

export const setHTMLEventHandler = (editor, stopMouseEvent: boolean) => {
    editor.onMouseMove((event) => onMouseMove(event));
    editor.onMouseLeave((event) => onMouseLeave(event, editor));
    editor.onMouseDown((event) => onMouseDown(event));
    editor.onKeyUp((event) => onKeyUp(editor, event));
};
export const foldAll = (editor) => {
    editor.trigger("fold", "editor.foldAll");
};
export const unfoldAll = (editor) => {
    editor.trigger("unfold", "editor.unfoldAll");
};
export const getMainEditorModel = (monaco: Monaco) => {
    if (monaco) {
        let models = monaco.editor.getModels();
        if (models.length > 0) return models[0];
    }
    return null;
};

export const setCodeTextAndStates = (state: RootState, monaco: Monaco) => {
    let codeText = getCodeText(state);
    let editorModel = getMainEditorModel(monaco);
    if (codeText) {
        editorModel?.setValue(codeText);
    }
};

export const insertCellBelow = (monaco: Monaco, editor, mode, ln0based: number | null): boolean => {
    let model = getMainEditorModel(monaco);
    let lnToInsertAfter;
    let state = store.getState();
    const inViewID = state.projectManager.inViewID;
    let posToInsertAfter;

    if (ln0based) {
        lnToInsertAfter = ln0based + 1;
    } else {
        lnToInsertAfter = editor.getPosition().lineNumber;
    }

    if (model && inViewID) {
        const codeLines = state.codeEditor.codeLines[inViewID];
        let curGroupID = codeLines[lnToInsertAfter - 1].groupID;
        while (
            curGroupID != null &&
            lnToInsertAfter < codeLines.length + 1 /** note that lnToInsertAfter is 1-based */ &&
            codeLines[lnToInsertAfter - 1].groupID === curGroupID
        ) {
            lnToInsertAfter += 1;
        }
        if (lnToInsertAfter === 1 || curGroupID == null) {
            /** insert from the end of the current line */
            posToInsertAfter = model?.getLineLength(lnToInsertAfter) + 1;
        } else {
            /** insert from the end of the prev line */
            lnToInsertAfter -= 1;
            posToInsertAfter = model?.getLineLength(lnToInsertAfter) + 1;
        }

        let range = new monaco.Range(
            lnToInsertAfter,
            posToInsertAfter,
            lnToInsertAfter,
            posToInsertAfter
        );
        let id = { major: 1, minor: 1 };
        let text = "\n";
        var op = { identifier: id, range: range, text: text, forceMoveMarkers: true };
        editor.executeEdits("insertCellBelow", [op]);
    }
    return true;
};

export const setLineStatus = (inViewID: string, lineRange: ILineRange, status: LineStatus) => {
    let lineStatus: ICodeLineStatus = {
        inViewID: inViewID,
        lineRange: lineRange,
        status: status,
    };
    store.dispatch(setLineStatusRedux(lineStatus));
};

export const execLines = (runQueueItem: IRunQueueItem) => {
    let fileID = runQueueItem.inViewID;
    let lineRange = runQueueItem.lineRange;
    if (fileID && lineRange.toLine != null && lineRange.fromLine != null) {
        let content: IRunningCommandContent | null = getRunningCommandContent(fileID, lineRange);
        if (content != null) {
            console.log("CodeEditor execLines: ", content, lineRange);
            sendMessage(socket, content);
            setLineStatus(fileID, content.lineRange, LineStatus.EXECUTING);
        }
    }
};

export const getRunningCommandContent = (
    fileID: string,
    lineRange: ILineRange
): IRunningCommandContent | null => {
    let content: IRunningCommandContent | null = null;
    let codeText = store.getState().codeEditor.codeText[fileID];

    // const doc = view.state.doc;
    if (
        codeText &&
        lineRange.fromLine != null &&
        lineRange.toLine != null &&
        lineRange.fromLine < lineRange.toLine
    ) {
        /** the text include the content of the toLine */
        let text = codeText.slice(lineRange.fromLine, lineRange.toLine + 1).join("\n");
        content = {
            lineRange: lineRange,
            content: text,
        };
        console.log("CodeEditor getRunningCommandContent code group to run: ", content);
    }

    return content;
};

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

export const sendMessage = (socket: Socket, content: IRunningCommandContent) => {
    const message = createMessage(content);
    console.log(`${message.webapp_endpoint} send message: `, message);
    socket.emit(message.webapp_endpoint, JSON.stringify(message));
};
export const deleteCellHover = (editor: any, monaco: any): boolean => {
    let groupID = store.getState().codeEditor.mouseOverGroupID; /** 1-based */
    let state = store.getState();
    const inViewID = state.projectManager.inViewID;
    if (inViewID) {
        const codeLines = state.codeEditor.codeLines[inViewID];
        let startLineNumber = 0;
        let length = 0;
        codeLines.forEach((item, index) => {
            if (item.groupID && item.groupID === groupID) {
                length = length + 1;
                if (length === 1) {
                    startLineNumber = index + 1;
                }
            }
        });
        // let lineRange = getLineRangeOfGroup(codeLines, lineNumberCurent - 1);
        // console.log("lineRange",lineNumberCurent, lineRange);
        let range = new monaco.Range(startLineNumber, 1, startLineNumber + length, 1);
        let id = { major: 1, minor: 1 };
        let text = "";
        var op = { identifier: id, range: range, text: text, forceMoveMarkers: true };
        editor.executeEdits("deleteCell", [op]);
    }

    return true;
};
export const runCellAboveGroup = (editor: any) => {
    let groupID = store.getState().codeEditor.mouseOverGroupID; /** 1-based */
    let state = store.getState();

    const inViewID = state.projectManager.inViewID;
    if (inViewID && groupID) {
        const codeLines = state.codeEditor.codeLines[inViewID];
        let position = codeLines.findIndex((item) => item.groupID === groupID);
        runQueueForm(null, codeLines, 0, position);
    }
};
export const runCellBelowGroup = () => {
    let groupID = store.getState().codeEditor.mouseOverGroupID; /** 1-based */
    let state = store.getState();

    const inViewID = state.projectManager.inViewID;
    if (inViewID && groupID) {
        const codeLines = state.codeEditor.codeLines[inViewID];
        let position = codeLines.findIndex((item) => item.groupID === groupID);
        runQueueForm(groupID, codeLines, position, codeLines.length);
    }
};
export const runAllCell = () => {
    let state = store.getState();

    const inViewID = state.projectManager.inViewID;
    const codeLines = state.codeEditor.codeLines[inViewID];
    runQueueForm(null, codeLines, 0, codeLines.length);
};

export const runQueueForm = (
    groupID: string | null,
    codeLines: ICodeLine[],
    form: number,
    to: number
) => {
    let runGroups: any = {};

    for (let i = form; i < to; i++) {
        if (codeLines[i].groupID && (codeLines[i].groupID !== groupID || !groupID)) {
            // add groupID into keyObject avoid reorder
            runGroups["groupID=" + codeLines[i].groupID] = codeLines[i].groupID;
        }
    }
    for (const groupID of Object.keys(runGroups)) {
        // remove string groupID=
        let a = groupID.replace("groupID=", "");
        console.log("CodeEditor addGroupToRunQueue=>", a);
        addGroupToRunQueue(groupID.replace("groupID=", ""));
    }
};
export const setGroup = (editor: any) => {
    if (editor) {
        let selection = editor.getSelection();
        let lineRange = {
            fromLine: selection.startLineNumber - 1,
            endLineNumber: selection.endLineNumber,
        };
        let inViewID = store.getState().projectManager.inViewID;
        console.log("CodeEditor setGroup: ", lineRange, lineRange);
        if (inViewID && lineRange && lineRange.endLineNumber > lineRange.fromLine) {
            let lineStatus: ICodeLineGroupStatus = {
                inViewID: inViewID,
                fromLine: lineRange.fromLine,
                toLine: lineRange.endLineNumber,
                status: LineStatus.EDITED,
                setGroup: SetLineGroupCommand.NEW,
            };
            store.dispatch(setLineGroupStatus(lineStatus));
        }
    }
    return true;
};
export const setUnGroup = (editor: any) => {
    let reduxState = store.getState();
    let inViewID = reduxState.projectManager.inViewID;
    let lineNumberCurent = editor.getPosition().lineNumber;
    if (inViewID) {
        let codeLines = reduxState.codeEditor.codeLines[inViewID];
        let lineRange = getLineRangeOfGroup(codeLines, lineNumberCurent - 1);
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
};
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
