import { Monaco } from "@monaco-editor/react";
import {
    setActiveLine as setActiveLineRedux,
    setMouseOverGroup,
    setMouseOverLine,
} from "../../../../redux/reducers/CodeEditorRedux";
import store, { RootState } from "../../../../redux/store";
import {
    ICodeActiveLine,
    ICodeLine,
    ICodeLineStatus,
    ILineRange,
    IRunningCommandContent,
    IRunQueueItem,
    LineStatus,
} from "../../../interfaces/ICodeEditor";
import { ifElse } from "../../libs";
import { setLineStatus as setLineStatusRedux } from "../../../../redux/reducers/CodeEditorRedux";
import socket from "../../Socket";
import { CommandName, ContentType, IMessage, WebAppEndpoint } from "../../../interfaces/IApp";
import { Socket } from "socket.io-client";

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
                store.dispatch(setMouseOverLine(ln0based));
            }
        }

        // console.log('CodeEditor onMouseDown', view, event, dispatch);
    } catch (error) {
        console.error(error);
    }
}

function onMouseLeave(event) {
    try {
        if (event != null) {
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
    editor.onMouseLeave((event) => onMouseLeave(event));
    editor.onMouseDown((event) => onMouseDown(event));
    editor.onKeyUp((event) => onKeyUp(editor, event));
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
