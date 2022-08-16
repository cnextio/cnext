import { cnextQuery } from "../../../codemirror/grammar/lang-cnext-query";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
    DFFilterForm,
    DFFilterInput,
    QuerySample,
    StyledFilterCodeMirror,
} from "../../StyledComponents";
import { dfFilterLanguageServer } from "../../../codemirror/autocomplete-lsp/index.js";
import { setDFFilter } from "../../../../redux/reducers/DataFramesRedux";
import store from "../../../../redux/store";
import { ViewUpdate } from "@codemirror/view";
import { bracketMatching, defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { closeBrackets } from "@codemirror/autocomplete";
// import { EditorState, TransactionSpec } from "@codemirror/state";
import { EditorState, TransactionSpec } from "@codemirror/state";
import { basicSetup } from "../../../codemirror/basic-setup";
// import { history } from "@codemirror/history";
import { setRichOutputFocused } from "../../../../redux/reducers/RichOutputRedux";

const ls = dfFilterLanguageServer();

interface DFQuery {
    df_id: string;
    query: string | null;
    /** String that is entered into the query box. */
    raw_query: string;
}

const DFExplorer = () => {
    const [query, setQuery] = useState<DFQuery | null>(null);
    const dispatch = useDispatch();
    const filterCM = useRef();

    const keyHandler = useCallback(
        (event: React.KeyboardEvent) => {
            // console.log("DFExplorer event: ", event);
            try {
                if (event.key === "Enter" && query != null) {
                    let codeEditorText = filterCM?.current
                        ?.getElementsByClassName("cm-line")[0]
                        .innerText.trim();

                    console.log("DFExplorer dispatch query and codeEditorText: ", {
                        query: query,
                        codeEditorText: codeEditorText,
                    });
                    /** use this trick to avoid the enter keyboard event that is triggered by autocompletion  */
                    if (query.raw_query === codeEditorText) {
                        dispatch(setDFFilter(query));
                    }
                }
            } catch {}
        },
        [query]
    );

    useEffect(() => {
        let element = filterCM.current;
        if (element != null) {
            element.addEventListener("keydown", keyHandler);
            return () => {
                element.removeEventListener("keydown", keyHandler);
            };
        }
    }, [keyHandler]);

    /**
     * All query string will be converted to loc/iloc pandas query
     */
    const onCMChange = (text: string, viewUpdate: ViewUpdate) => {
        const state = store.getState();
        const activeDF = state.dataFrames.activeDataFrame;

        let tree;
        //this is a hacky way to get parser out of state
        for (var v of viewUpdate.state.values) {
            if (v && v.context && v.context.tree) {
                tree = v.context.tree;
            }
        }
        let queryStr = null;
        //[1:2, ['a']]['a'>2]
        //[1:2, ['a']][('a'>2) & ('b'<4) | ('c'>5)]
        if (tree) {
            let cursor = tree.cursor(0, 0);
            let curComponent;
            if (cursor.name == "Script" && cursor.firstChild() && cursor.name == "QueryStatement") {
                cursor.next();
                // queryStr = activeDF;
                queryStr = "";
                while (true) {
                    // console.log(cursor.name);
                    if (cursor.name == "SimpleQueryExpression") {
                        let indexStr = "";
                        let columnStr = "";
                        let indexEnd;
                        let columnEnd;
                        while (cursor.next()) {
                            if (cursor.name == "IndexExpression") {
                                curComponent = "index";
                                indexEnd = cursor.to;
                            } else if (cursor.name == "ColumnFilterExpression") {
                                curComponent = "column";
                                columnEnd = cursor.to;
                            } else if (cursor.name == "SimpleQueryExpression") {
                                break;
                            } else {
                                if (curComponent == "index" && cursor.from >= indexEnd) {
                                    curComponent = "other";
                                }
                                if (curComponent == "column" && cursor.from >= columnEnd) {
                                    curComponent = "other";
                                }
                            }
                            while (cursor.firstChild());
                            if (curComponent == "index") {
                                if (cursor.name == "ColumnNameExpression") {
                                    indexStr = indexStr.concat(
                                        activeDF,
                                        "[",
                                        text.substring(cursor.from, cursor.to),
                                        "]"
                                    );
                                } else if (cursor.name == "isna" || cursor.name == "notna") {
                                    indexStr = indexStr.concat(`.${cursor.name}()`);
                                } else if (cursor.name == "isin") {
                                    cursor.nextSibling();
                                    indexStr = indexStr.concat(
                                        `.isin(${text.substring(cursor.from, cursor.to)})`
                                    );
                                    // cursor is here now: IndexSelectorExpression("[",(Number),"]"))
                                    // need to move cursor to the node ending at cursor.to, so the next step
                                    // can skip through IndexSelectorExpression's children
                                    cursor.moveTo(cursor.to, -1);
                                } else {
                                    indexStr = indexStr.concat(
                                        text.substring(cursor.from, cursor.to)
                                    );
                                }
                            } else if (curComponent == "column") {
                                columnStr = columnStr.concat(
                                    text.substring(cursor.from, cursor.to)
                                );
                            }
                        }
                        if (indexStr == "" && columnStr != "") {
                            queryStr = queryStr.concat(".loc[", ":, ", columnStr, "]");
                        }
                        if (indexStr != "") {
                            if (columnStr != "") {
                                queryStr = queryStr.concat(".loc[", indexStr, ",", columnStr, "]");
                            } else {
                                queryStr = queryStr.concat(".loc[", indexStr, "]");
                            }
                        }
                        // console.log(
                        //     "DFFilter index and column",
                        //     indexStr,
                        //     columnStr
                        // );
                        // console.log("DFFilter query", queryStr);
                    } else {
                        break;
                    }
                }
            }
        }
        if (activeDF != null) {
            let query = { df_id: activeDF, query: queryStr, raw_query: text };
            console.log("DFExplorer query: ", query);
            setQuery(query);
        }
    };

    const oneLineExtension = () => {
        return EditorState.transactionFilter.of((transaction) => {
            let newLineDetected = false;
            transaction.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
                newLineDetected ||= inserted.lines > 1;
            });
            if (newLineDetected) {
                return null;
            }
            return transaction;
        });
    };

    const extensions = [
        // basicSetup,
        bracketMatching(),
        closeBrackets(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        cnextQuery(),
        // python(),
        ls,
        EditorState.transactionFilter.of((transaction) => {
            let newLineDetected = false;
            transaction.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
                newLineDetected ||= inserted.lines > 1;
            });
            if (newLineDetected) {
                return null;
            }
            return transaction;
        }),
        oneLineExtension(),
        // keymap.of([{ key: "Enter", run: () => enterKeyHandler() }]),
    ];

    return (
        <DFFilterForm>
            <DFFilterInput
                ref={filterCM}
                inputComponent={useCallback(() => {
                    return (
                        <StyledFilterCodeMirror
                            extensions={extensions}
                            basicSetup={false}
                            onChange={(text, viewUpdate) => onCMChange(text, viewUpdate)}
                            onFocus={() => {
                                dispatch(setRichOutputFocused(true));
                            }}
                            onBlur={() => {
                                dispatch(setRichOutputFocused(false));
                            }}
                        />
                    );
                }, [])}
            ></DFFilterInput>
            {query && query.query && <QuerySample>{query.df_id + query.query}</QuerySample>}
        </DFFilterForm>
    );
};

export default DFExplorer;
