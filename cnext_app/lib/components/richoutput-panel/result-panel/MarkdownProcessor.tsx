import React, { useEffect, useState } from "react";
import { useDispatch, useSelector, dispatch } from "react-redux";
import { addResult } from "../../../../redux/reducers/CodeEditorRedux";
import store, { RootState } from "../../../../redux/store";
import { ContentType, SubContentType } from "../../../interfaces/IApp";
import { ICodeResult, ICodeResultMessage } from "../../../interfaces/ICodeEditor";
import { getCodeText } from "../../code-panel/libCodeEditor";

export const MarkdownProcessor = () => {
    const codeText = useSelector((state: RootState) => getCodeText(state));
    const dispatch = useDispatch();

    const MARDOWN_PREFIX_REG = /^# /g;
    const MARKDOWN_PREFIX_LENGTH = 2;
    const isMarkdownLine = (line: string) => {
        return line.match(MARDOWN_PREFIX_REG) != null;
    };

    useEffect(() => {
        let inViewID = store.getState().projectManager.inViewID;
        if (inViewID != null) {
            let codeLines = store.getState().codeEditor.codeLines[inViewID];
            let lineUpdate = store.getState().codeEditor.lastLineUpdate[inViewID];

            if (lineUpdate != null && codeLines != null) {
                let lineNumber = lineUpdate.updatedStartLineNumber;
                let markdownText: string[] = [];
                const groupID = codeLines[lineNumber].groupID;
                let lineText = lineUpdate.text[lineNumber];
                console.log(
                    "CodeEditorRedux markdownText: ",
                    lineNumber,
                    groupID,
                    lineText,
                    lineUpdate
                );
                if (groupID != null) {
                    /** go to the begin of the group */
                    while (lineNumber > 0 && codeLines[lineNumber].groupID === groupID) {
                        lineNumber--;
                    }

                    if (codeLines[lineNumber].groupID !== groupID) {
                        lineNumber++;
                    }
                    let startLineOfGroup = lineNumber;

                    lineText = lineUpdate.text[lineNumber];
                    /** now go get the markdown text */
                    while (lineNumber < lineUpdate.text.length && isMarkdownLine(lineText)) {
                        markdownText.push(lineText.slice(MARKDOWN_PREFIX_LENGTH));
                        lineNumber++;
                        lineText = lineUpdate.text[lineNumber];
                    }
                    let markdownResult: ICodeResultMessage = {
                        inViewID: inViewID,
                        type: ContentType.RICH_OUTPUT,
                        subType: SubContentType.MARKDOWN,
                        content: {
                            "text/markdown":
                                markdownText.length > 0 ? markdownText.join("\n") : null,
                        },
                        metadata: {
                            line_range: {
                                fromLine: startLineOfGroup,
                                toLine: startLineOfGroup,
                            },
                        },
                    };
                    dispatch(addResult(markdownResult));
                    console.log("CodeEditorRedux markdownText: ", markdownText, lineNumber);
                }
            }
        }
    }, [codeText]);

    return null;
};
