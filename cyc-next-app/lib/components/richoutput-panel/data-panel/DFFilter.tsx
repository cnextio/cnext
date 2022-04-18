import { cnextQuery } from "../../../codemirror/grammar/lang-cnext-query";
import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import { DFFilterForm, DFFilterInput, StyledFilterCodeMirror } from "../../StyledComponents";
import { bracketMatching } from "@codemirror/matchbrackets";
import { closeBrackets } from "@codemirror/closebrackets";
import { defaultHighlightStyle } from "@codemirror/highlight";
import { dfFilterLanguageServer } from "../../../codemirror/autocomplete-lsp/index.js";
import { setDFFilter } from "../../../../redux/reducers/DataFramesRedux";
import store from "../../../../redux/store";
import { ViewUpdate } from "@codemirror/view";

const ls = dfFilterLanguageServer();

const DFExplorer = React.memo(() => {
    // const dfList = useSelector((state) => _checkDFList(state));
    const dispatch = useDispatch();
    const filterCM = useRef();

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
        let queryStr;
        //[1:2, ['a']]['a'>2]
        //[1:2, ['a']][('a'>2) & ('b'<4) | ('c'>5)]
        if (tree) {
            console.log(tree.toString());
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
        dispatch(setDFFilter({ df_id: activeDF, query: queryStr }));
    };

    const extensions = [
        // basicSetup,
        bracketMatching(),
        closeBrackets(),
        defaultHighlightStyle.fallback,
        cnextQuery(),
        // python(),
        ls,
    ];

    return (
        <DFFilterForm>
            {/* <InputLabel sx={{fontSize: '13px', p: '0px'}}>Data Frame</InputLabel> */}
            <DFFilterInput
                // sx={{ borderBottom: 1 }}
                // onChange = {onFilterChange}
                // inputProps = {{style: {padding: '0px 10px', height: '32px'}}}
                placeholder='Filter...'
                // value = {filterText}
                inputComponent={() => {
                    return (
                        <StyledFilterCodeMirror
                            ref={filterCM}
                            extensions={extensions}
                            basicSetup={false}
                            onChange={(text, viewUpdate) => onCMChange(text, viewUpdate)}
                            // placeholder = 'Filter'
                        />
                    );
                }}
            ></DFFilterInput>
            {/* <StyledFilterCodeMirror
                            height = "30px"
                            extensions = {extensions}   
                            basicSetup = {false}                         
                        /> */}
        </DFFilterForm>
    );
});

export default DFExplorer;

function bracketClosing() {
    throw new Error("Function not implemented.");
}
