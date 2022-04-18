import { sortResults } from './helper';
import { python } from '../grammar/lang-cnext-python';
import store from '/redux/store';

class DFFilterPlugin {
    /**
     * This function is used for autocompletion in CodeEditor.
     * Match column patterns to suggest column names autocompletion.
     * Currently only implemented for names. Will expand to values later.
     * @param {*} context
     * @param {*} line
     * @param {*} character
     * @returns
     */
    getDFCompletion_CodeEditor = (context, line, character) => {
        let state = context.state;
        let text = state.doc.toString();
        let tree = state.tree;
        let curPos = state.selection.ranges[0].anchor;
        let result = this.matchColNameExpression_CodeEditor(
            text,
            tree,
            curPos,
            this.colNamePattern_CodeEditor
        );
        let items = null;
        if (result.matched) {
            items = this.createColNameAutocompleItems(result.df_name, result.str_content);
        }
        console.log('Items: ', items);
        return items;
    };

    /**
     * These functions are for supporting DFFilter component
     */
    async requestCompletion_DFFilter(context, { line, character }) {
        try {
            let result = this.getDFCompletion_DFFilter(context, line, character);
            if (!result) return null;
            const items = 'items' in result ? result.items : result;
            return sortResults(context, items);
        } catch (e) {
            console.error('requestCompletion: ', e);
        }
    }

    getDFCompletion_DFFilter(context, line, character) {
        let state = context.state;
        let text = state.doc.toString();

        let parser = python().language.parser;
        console.log(
            'getDFCompletion current line parser ',
            parser.parse(state.doc.text[line]).toString()
        );
        let tree = state.tree;
        let curPos = state.selection.ranges[0].anchor;
        let result = this.matchColNameExpression_DFFilter(text, tree, curPos);
        let items = null;
        if (result.matched) {
            items = this.createColNameAutocompleItems(result.df_name, result.str_content);
        } else {
            result = this.matchColValueExpression_DFFilter(
                text,
                tree,
                curPos,
                this.colNamePattern_DFFilter
            );
            if (result.matched) {
                console.log(result);
                items = this.createColValueAutocompleItems(result.df_name, result.col_name);
            }
        }
        console.log('Items: ', items);
        return items;
    }

    matchColNameExpression_DFFilter(text, tree, pos) {
        let matched = false;
        let dfName;
        let cursor = tree.cursor(pos, 1);
        let strContent = text.substring(cursor.from, cursor.to);
        const reduxState = store.getState();
        if (cursor.name == 'ColumnNameExpression') {
            // now search for the column name
            console.log('_matchColNameExpression_DFFilter: got a match');
            matched = true;
            dfName = reduxState.dataFrames.activeDataFrame;
        }
        if (matched) console.log('Match column name: ', dfName, strContent);
        return { matched: matched, df_name: dfName, str_content: strContent };
    }

    /**
     * This part is added to support DataFrame-related autocomplete
     *
     */
    createColNameAutocompleItems(df_id, strContent) {
        /**
         * Example of an item
         * {
         *      detail: "pandas.core.frame.DataFrame"
         *      documentation: "fillna(value=..., method: FillnaOptions | None=..., axis: Axis | None=..., inplace: Literal[False]=..., limit=..., downcast=...) -> DataFrame\nfillna(value, method: FillnaOptions | None, axis: Axis | None, inplace: Literal[True], limit=..., downcast=...) -> None\nfillna(*, inplace: Literal[True], limit=..., downcast=...) -> None\nfillna(value, *, inplace: Literal[True], limit=..., downcast=...) -> None\nfillna(*, method: FillnaOptions | None, inplace: Literal[True], limit=..., downcast=...) -> None\nfillna(*, axis: Axis | None, inplace: Literal[True], limit=..., downcast=...) -> None\nfillna(*, method: FillnaOptions | None, axis: Axis | None, inplace: Literal[True], limit=..., downcast=...) -> None\nfillna(value, *, axis: Axis | None, inplace: Literal[True], limit=..., downcast=...) -> None\nfillna(value, method: FillnaOptions | None, *, inplace: Literal[True], limit=..., downcast=...) -> None\nfillna(value=..., method: FillnaOptions | None=..., axis: Axis | None=..., inplace: bool=..., limit=..., downcast=...) -> DataFrame | None"
         *      insertText: "fillna"
         *      kind: 3 //see https://microsoft.github.io/language-server-protocol/specifications/specification-3-17/#completionItemKind
         *      label: "fillna(value, method, axis, inplace, limit, downcast)"
         *      sortText: "afillna"
         * }
         */
        //get column names list
        const state = store.getState();
        const colNames = state.dataFrames.metadata[df_id]
            ? Object.keys(state.dataFrames.metadata[df_id].columns)
            : null;

        let items;
        if (colNames) {
            if (colNames) {
                items = colNames.map((item) => {
                    return {
                        detail: 'Column_name',
                        documentation: 'TODO: add column details',
                        insertText: item,
                        kind: 5,
                        label: item,
                        sortText: item,
                    };
                });
            }
        }
        return items;
    }

    createColValueAutocompleItems(df_id, col_name) {
        //get column names list
        const reduxState = store.getState();
        const values = reduxState.dataFrames.metadata[df_id].columns[col_name].unique;
        console.log(df_id, col_name, values);
        let items;
        if (values) {
            items = values.map((item) => {
                return {
                    detail: 'Column_value',
                    documentation: 'TODO: add column details',
                    //FIXME: find a better way to handle null here
                    insertText: item === null ? 'null value, use "isna" instead!' : item,
                    kind: 5,
                    label: item === null ? 'null value, use "isna" instead!' : item,
                    sortText: item === null ? 'null value, use "isna" instead!' : item,
                };
            });
            console.log(items);
        }
        return items;
    }

    colNamePattern_CodeEditor = [
        //CallExpression(MemberExpression(VariableName,".",PropertyName),ArgList("(",String,")"))
        //make a shortcut in this case, did not go up to CallExpression. Might need to test more
        [
            { name: 'String', nextMatch: 'parent' },
            { name: 'ArgList', nextMatch: 'prevSibling' },
            { name: 'MemberExpression', nextMatch: 'firstChild' },
            { name: 'VariableName', nextMatch: null },
        ],
        //MemberExpression(VariableName,"[",String,"]")
        [
            { name: 'String', nextMatch: 'parent' },
            { name: 'MemberExpression', nextMatch: 'firstChild' },
            { name: 'VariableName', nextMatch: null },
        ],
        //MemberExpression(VariableName,"[",ArrayExpression("[",String,"]"),"]")
        [
            { name: 'String', nextMatch: 'parent' },
            { name: 'ArrayExpression', nextMatch: 'parent' },
            { name: 'MemberExpression', nextMatch: 'firstChild' },
            { name: 'VariableName', nextMatch: null },
        ],
        //CNextStatement(CNextStarter,CNextPlotExpression(CNextPlotKeyword,DataFrameExpresion,CNextPlotYDimExpression(ColumnNameExpression,",",ColumnNameExpression),CNextPlotAddDimKeyword(over),CNextPlotXDimExpression(ColumnNameExpression))))
        // this match is used for CNextStatement. It is very simple because we can define the language
        [{ name: 'CNextXDimColumnNameExpression', nextMatch: null }],
        [{ name: 'CNextYDimColumnNameExpression', nextMatch: null }],
    ];

    matchColNameExpression_CodeEditor(text, tree, pos, syntaxPattern) {
        let matched = false;
        let dfName;
        let strContent;
        const state = store.getState();
        const dfList = Object.keys(state.dataFrames.metadata);
        for (const matchStates of syntaxPattern) {
            let cursor = tree.cursor(pos, 1);
            let matchStep = 0;
            while (true) {
                if (matchStep >= matchStates.length) break;
                let name = matchStates[matchStep].name;
                let nextMatch = matchStates[matchStep].nextMatch;
                if (name == cursor.name) {
                    if (matchStep == 0) {
                        strContent = text.substring(cursor.from, cursor.to);
                    }
                    if (nextMatch == null) {
                        console.log('Autocomplete: got a match');
                        matched = true;
                        dfName = text.substring(cursor.from, cursor.to);
                        /**
                         * To support command such as plotly px, we have to check if the VariableName
                         * is indeed an active dataframe, if not then use activeDataFrame instead
                         */
                        if (!dfList.includes(dfName)) {
                            dfName = state.dataFrames.activeDataFrame;
                        }
                        console.log(text.substring(cursor.from, cursor.to));
                        break;
                    } else {
                        cursor[nextMatch]();
                    }
                } else break;
                matchStep += 1;
            }
        }
        if (matched) console.log('Autocomplete: match column names: ', dfName, strContent);
        return { matched: matched, df_name: dfName, str_content: strContent };
    }

    colNamePattern_DFFilter = [
        { name: ['ColumnValueExpression'], nextMatch: 'parent' },
        { name: ['IndexSelectorExpression'], nextMatch: 'prevSibling' },
        { name: ['CompareOp', 'isin'], nextMatch: 'prevSibling' },
        { name: ['ColumnNameExpression'], nextMatch: null },
    ];
    /**
     *
     * @param {*} text
     * @param {*} tree
     * @param {*} pos
     * @param {*} syntaxPattern
     * @returns
     * Check if the node at the pos match ColumnValue. If yes, then search for the column name.
     * With DFFilter, we can define the grammar name specific for our purpose so the search is
     * basically a direct match. The column name is searched with the following patterns
     * (ColumnNameExpression,CompareOp,IndexSelectorExpression(ColumnValueExpression))
     * (ColumnNameExpression,CompareOp,IndexSelectorExpression("[",ColumnValueExpression,"]")
     * (ColumnNameExpression,isin,IndexSelectorExpression("[",ColumnValueExpression,"]")
     * (ColumnNameExpression,CompareOp,IndexSelectorExpression(ColumnValueExpression(Number)))
     */
    matchColValueExpression_DFFilter(text, tree, pos, matchPattern) {
        let matched = false;
        let dfName;
        let colName;
        let cursor = tree.cursor(pos, -1);
        let strContent = text.substring(cursor.from, cursor.to);
        const reduxState = store.getState();
        let matchStep = 0;
        console.log(`matchColumnValueExpression_DFFilter: start matching ${cursor.name}`);
        /**
         * TODO: find a way to support number suggestion
         * Need a special handling of Number case here
         */
        if (cursor.name == 'ColumnValueExpression') {
            // now search for the column name
            console.log(
                'matchColumnValueExpression_DFFilter: match ColumnValueExpression, now search for column name'
            );
            while (true) {
                console.log(cursor.name);
                let name = matchPattern[matchStep].name;
                let nextMatch = matchPattern[matchStep].nextMatch;
                if (!name.includes(cursor.name)) {
                    matched = false;
                    break;
                }
                if (nextMatch == null) {
                    matched = true;
                    /**
                     * Need to do a special handling of a string because ColumnNameExpression will include quotes '' or ""
                     * if the value is a string
                     */
                    colName = text.substring(cursor.from + 1, cursor.to - 1);
                    dfName = reduxState.dataFrames.activeDataFrame;
                    console.log(
                        `matchColumnValueExpression_DFFilter got a match with colName=${colName}`
                    );
                    break;
                } else {
                    cursor[nextMatch]();
                }
                matchStep += 1;
            }
        }
        if (matched) console.log('Match column value: ', colName, strContent);
        return {
            matched: matched,
            df_name: dfName,
            col_name: colName,
            str_content: strContent,
        };
    }
}

export default DFFilterPlugin;
