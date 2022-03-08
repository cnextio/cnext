const timeout = 10000;
const changesDelay = 3000;
const CompletionItemKindMap = Object.fromEntries(
    Object.entries(CompletionItemKind).map(([key, value]) => [value, key])
);

import { setParamOptions } from './autocomplete';
import { setDiagnostics } from '@codemirror/lint';
import socket from '../../components/Socket';
import { WebAppEndpoint } from '../../interfaces/IApp';
import {
    CompletionItemKind,
    DiagnosticSeverity,
    SignatureHelpTriggerKind,
} from 'vscode-languageserver-protocol';

import store from '/redux/store';
import { python } from '../grammar/lang-cnext-python';
import { rootUri, documentUri, languageId } from './source';

class LanguageServerPlugin {
    constructor(view, dfFilter = false) {
        this.view = view;
        this.dfFilter = dfFilter;
        this.signatureData = null;
        if (!dfFilter) {
            this.rootUri = this.view.state.facet(rootUri);
            this.documentUri = this.view.state.facet(documentUri);
            this.languageId = this.view.state.facet(languageId);
            this.documentVersion = 0;
            this.changesTimeout = 0;
            this.setupLSConnection();
        } else {
            this.languageId = this.view.state.facet(languageId);
            this.documentVersion = 0;
            this.changesTimeout = 0;
        }
    }

    async setupLSConnection() {
        console.log('setupLSConnection');
        this.ready = false;
        socket.emit('ping', WebAppEndpoint.LanguageServer);
        socket.on('pong', (message) => {
            console.log('Get pong from server when init LSP');
        });

        // listener notify from server
        socket.on(WebAppEndpoint.LanguageServerNotifier, (result) => {
            try {
                const notification = JSON.parse(result);
                console.log(
                    `received notify from LSP server at ${new Date().toLocaleString()} `,
                    notification
                );
                switch (notification.method) {
                    case 'textDocument/publishDiagnostics':
                        this.processDiagnostics(notification.params);
                }
            } catch (error) {
                console.error(error);
            }
        });

        socket.on('connect', () => {
            this.initializeLS({ documentText: this.view.state.doc.toString() });
        });

        // send initinalize
        this.initializeLS({ documentText: this.view.state.doc.toString() });
    }

    async requestLS(channel, method, params, time) {
        if (!time) time = timeout;
        const rpcMessage = { jsonrpc: '2.0', id: 0, method: method, params: params };

        return new Promise((resolve, reject) => {
            console.log(
                `send LSP request on ${channel}  to Server at ${new Date().toLocaleString()} `,
                rpcMessage
            );
            socket.emit(channel, JSON.stringify(rpcMessage));

            setTimeout(() => {
                resolve(null);
            }, time);

            if (channel) {
                socket.once(channel, (result) => {
                    const response = JSON.parse(result.toString());
                    console.log(
                        `received from LSP on ${channel} server at ${new Date().toLocaleString()} `,
                        response
                    );
                    resolve(response);
                });
            }
        });
    }

    update({ docChanged }) {
        if (!docChanged) return;
        if (!this.ready && !this.dfFilter)
            this.initializeLS({ documentText: this.view.state.doc.toString() });

        if (this.changesTimeout) clearTimeout(this.changesTimeout);
        this.changesTimeout = self.setTimeout(() => {
            this.sendChange({
                documentText: this.view.state.doc.toString(),
            });
        }, changesDelay);
    }

    destroy() {
        console.log('LanguageServerPlugin destroy');
    }

    async initializeLS({ documentText }) {
        console.log('initializeLS');
        const result = await this.requestLS(WebAppEndpoint.LanguageServer, 'initialize', {
            capabilities: {
                textDocument: {
                    hover: {
                        dynamicRegistration: true,
                        contentFormat: ['plaintext', 'markdown'],
                    },
                    moniker: {},
                    synchronization: {
                        dynamicRegistration: true,
                        willSave: false,
                        didSave: false,
                        willSaveWaitUntil: false,
                    },
                    completion: {
                        dynamicRegistration: true,
                        completionItem: {
                            snippetSupport: false,
                            commitCharactersSupport: true,
                            documentationFormat: ['plaintext', 'markdown'],
                            deprecatedSupport: false,
                            preselectSupport: false,
                        },
                        contextSupport: false,
                    },
                    signatureHelp: {
                        dynamicRegistration: true,
                        signatureInformation: {
                            documentationFormat: ['plaintext', 'markdown'],
                            parameterInformation: {
                                labelOffsetSupport: true,
                            },
                            activeParameterSupport: true,
                        },
                        contextSupport: true,
                    },
                    declaration: {
                        dynamicRegistration: true,
                        linkSupport: true,
                    },
                    definition: {
                        dynamicRegistration: true,
                        linkSupport: true,
                    },
                    typeDefinition: {
                        dynamicRegistration: true,
                        linkSupport: true,
                    },
                    implementation: {
                        dynamicRegistration: true,
                        linkSupport: true,
                    },
                },
                workspace: {
                    didChangeConfiguration: {
                        dynamicRegistration: true,
                    },
                },
            },
            initializationOptions: null,
            processId: null,
            rootUri: this.rootUri,
            workspaceFolders: [
                {
                    name: 'root',
                    uri: this.rootUri,
                },
            ],
        });

        if (result && result.capabilities) {
            this.capabilities = result.capabilities;
            this.requestLS(WebAppEndpoint.LanguageServer, 'initialized', {});
            this.requestLS(WebAppEndpoint.LanguageServer, 'textDocument/didOpen', {
                textDocument: {
                    uri: this.documentUri,
                    languageId: this.languageId,
                    text: documentText,
                    version: this.documentVersion,
                },
            });

            this.ready = true;
        }
    }

    async sendChange({ documentText }) {
        if (this.ready && !this.dfFilter) {
            this.requestLS(WebAppEndpoint.LanguageServer, 'textDocument/didChange', {
                textDocument: {
                    uri: this.documentUri,
                    version: this.documentVersion++,
                },
                contentChanges: [{ text: documentText }],
            });
        }
    }

    async requestSignatureTooltip({ line, character }) {
        try {
            this.sendChange({
                documentText: this.view.state.doc.toString(),
            });

            let signatureResult = await this.requestLS(
                WebAppEndpoint.LanguageServerSignature,
                'textDocument/signatureHelp',
                {
                    textDocument: { uri: this.documentUri },
                    position: { line, character },
                    context: {
                        triggerKind: SignatureHelpTriggerKind.Invoked,
                        triggerCharacter: character,
                    },
                }
            );
            if ('signatures' in signatureResult && signatureResult.signatures.length !== 0) {
                this.signatureData = signatureResult;
                return {
                    textContent: formatContents(
                        signatureResult.signatures.map((item) => item.label).find((v) => true)
                    ),
                    documentText: formatContents(
                        signatureResult.signatures
                            .map((item) => item.documentation)
                            .find((v) => true)
                    ),
                    activeParameter: signatureResult.activeParameter,
                };
            } else return null;
        } catch (error) {
            console.error('requestSignatureTooltip: ', error);
        }
    }

    async requestHoverTooltip(view, { line, character }) {
        try {
            this.sendChange({
                documentText: this.view.state.doc.toString(),
            });

            let result = await this.requestLS(
                WebAppEndpoint.LanguageServerHover,
                'textDocument/hover',
                {
                    textDocument: { uri: this.documentUri },
                    position: { line, character },
                }
            );

            if (!result) return null;

            let { contents, range } = result;
            let pos = posToOffset(view.state.doc, { line, character });
            let end;
            if (range) {
                pos = posToOffset(view.state.doc, range.start);
                end = posToOffset(view.state.doc, range.end);
            }

            const dom = document.createElement('div');
            dom.classList.add('documentation');

            if (!contents) {
                // request more infomation for params
                let signatureResult = await this.requestLS(
                    WebAppEndpoint.LanguageServerSignature,
                    'textDocument/signatureHelp',
                    {
                        textDocument: { uri: this.documentUri },
                        position: { line, character },
                        context: {
                            triggerKind: SignatureHelpTriggerKind.Invoked,
                            triggerCharacter: character,
                        },
                    }
                );
                if (!signatureResult) return null;

                if ('signatures' in signatureResult && signatureResult.signatures.length !== 0) {
                    dom.textContent = formatContents(
                        signatureResult.signatures.map((item) => item.label).find((v) => true)
                    );
                    return { pos, end, create: (view) => ({ dom }), above: true };
                } else return null;
            }

            dom.textContent = formatContents(contents);

            return { pos, end, create: (view) => ({ dom }), above: true };
        } catch (error) {
            console.error('requestHoverTooltip: ', error);
        }
    }

    /**
     * This part is added to support DataFrame-related autocomplete
     *
     */
    _createColNameAutocompleItems(df_id, strContent) {
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

    _createColValueAutocompleItems(df_id, col_name) {
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

    _matchColNameExpression_CodeEditor(text, tree, pos, syntaxPattern) {
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

    /**
     * This function is used for autocompletion in CodeEditor.
     * Match column patterns to suggest column names autocompletion.
     * Currently only implemented for names. Will expand to values later.
     * @param {*} context
     * @param {*} line
     * @param {*} character
     * @returns
     */
    _getDFCompletion_CodeEditor(context, line, character) {
        let state = context.state;
        let text = state.doc.toString();
        let tree = state.tree;
        let curPos = state.selection.ranges[0].anchor;
        let result = this._matchColNameExpression_CodeEditor(
            text,
            tree,
            curPos,
            this.colNamePattern_CodeEditor
        );
        let items = null;
        if (result.matched) {
            items = this._createColNameAutocompleItems(result.df_name, result.str_content);
        }
        console.log('Items: ', items);
        return items;
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
    _matchColValueExpression_DFFilter(text, tree, pos, matchPattern) {
        let matched = false;
        let dfName;
        let colName;
        let cursor = tree.cursor(pos, -1);
        let strContent = text.substring(cursor.from, cursor.to);
        const reduxState = store.getState();
        let matchStep = 0;
        console.log(`_matchColumnValueExpression_DFFilter: start matching ${cursor.name}`);
        /**
         * TODO: find a way to support number suggestion
         * Need a special handling of Number case here
         */
        if (cursor.name == 'ColumnValueExpression') {
            // now search for the column name
            console.log(
                '_matchColumnValueExpression_DFFilter: match ColumnValueExpression, now search for column name'
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
                        `_matchColumnValueExpression_DFFilter got a match with colName=${colName}`
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

    _matchColNameExpression_DFFilter(text, tree, pos) {
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

    _getDFCompletion_DFFilter(context, line, character) {
        let state = context.state;
        let text = state.doc.toString();

        let parser = python().language.parser;
        console.log(
            '_getDFCompletion current line parser ',
            parser.parse(state.doc.text[line]).toString()
        );
        let tree = state.tree;
        let curPos = state.selection.ranges[0].anchor;
        let result = this._matchColNameExpression_DFFilter(text, tree, curPos);
        let items = null;
        if (result.matched) {
            items = this._createColNameAutocompleItems(result.df_name, result.str_content);
        } else {
            result = this._matchColValueExpression_DFFilter(
                text,
                tree,
                curPos,
                this.colNamePattern_DFFilter
            );
            if (result.matched) {
                console.log(result);
                items = this._createColValueAutocompleItems(result.df_name, result.col_name);
            }
        }
        console.log('Items: ', items);
        return items;
    }
    /**
     * End support DataFrame-related autocomplete
     */

    sortResults(context, items) {
        let options = items?.map(
            ({
                detail,
                label,
                kind,
                textEdit,
                documentation,
                sortText,
                filterText,
                insertText,
                apply,
            }) => {
                var _a;
                const completion = {
                    label,
                    detail,
                    apply:
                        apply ||
                        ((_a =
                            textEdit === null || textEdit === void 0
                                ? void 0
                                : textEdit.newText) !== null &&
                            _a !== void 0)
                            ? _a
                            : insertText,
                    type: kind && CompletionItemKindMap[kind].toLowerCase(),
                    sortText: sortText !== null && sortText !== void 0 ? sortText : label,
                    filterText: filterText !== null && filterText !== void 0 ? filterText : label,
                };
                if (documentation) {
                    completion.info = formatContents(documentation);
                }
                return completion;
            }
        );
        const [span, match] = prefixMatch(options); //find the regrex string
        const token = context.matchBefore(match);
        let { pos } = context;
        if (token) {
            pos = token.from;
            const word = token.text.toLowerCase();
            if (/^\w+$/.test(word)) {
                options = options
                    .filter(({ filterText }) => filterText.toLowerCase().startsWith(word))
                    .sort(({ apply: a }, { apply: b }) => {
                        switch (true) {
                            case a.startsWith(token.text) && !b.startsWith(token.text):
                                return -1;
                            case !a.startsWith(token.text) && b.startsWith(token.text):
                                return 1;
                        }
                        return 0;
                    });
            }
        }

        return {
            from: pos,
            options,
        };
    }

    async requestCompletion_CodeEditor(
        context,
        { line, character },
        { triggerKind, triggerCharacter }
    ) {
        try {
            // get Dataframe's columns completion.
            let dfCompletionItems;
            if (context.matchBefore(/['"]+$/)) {
                dfCompletionItems = this._getDFCompletion_CodeEditor(context, line, character);
            }

            let result;
            // handler case for ()
            let paramsItem;
            if (context.matchBefore(/[\(=,]+$/) && context.explicit) {
                // invoke by command -> need to build mix data for suggestion
                if (
                    'signatures' in this.signatureData &&
                    this.signatureData.signatures.length !== 0
                ) {
                    this.sendChange({
                        documentText: this.view.state.doc.toString(),
                    });

                    result = await this.requestLS(
                        WebAppEndpoint.LanguageServerCompletion,
                        'textDocument/completion',
                        {
                            textDocument: { uri: this.documentUri },
                            position: { line, character },
                            context: {
                                triggerKind,
                                triggerCharacter,
                            },
                        }
                    );

                    const parameters = this.signatureData.signatures[0].parameters;
                    paramsItem = parameters.map(({ label, documentation }) => {
                        return {
                            label: label + '=',
                            apply: label + '=',
                            info: documentation ? formatContents(documentation) : null,
                            type: 'variable',
                            filterText: label,
                            sortText: label,
                            detail: documentation ? formatContents(documentation) : null,
                        };
                    });
                }
            }

            // add option for suggest params
            if (paramsItem) {
                setParamOptions(paramsItem);
            } else {
                setParamOptions([]);
            }

            // get completion for code.
            if (context.matchBefore(/[\w]+$/)) {
                this.sendChange({
                    documentText: this.view.state.doc.toString(),
                });

                result = await this.requestLS(
                    WebAppEndpoint.LanguageServerCompletion,
                    'textDocument/completion',
                    {
                        textDocument: { uri: this.documentUri },
                        position: { line, character },
                        context: {
                            triggerKind,
                            triggerCharacter,
                        },
                    }
                );
            }

            // merge the result with df-related completion items
            if (result) {
                if (dfCompletionItems) {
                    if (result.items) {
                        result.items = result.items.concat(dfCompletionItems);
                    } else {
                        result = result.concat(dfCompletionItems);
                    }
                }
            } else {
                result = dfCompletionItems;
            }
            if (!result) return null;

            if ('items' in result) {
                const items = result.items;
                return this.sortResults(context, items);
            }
        } catch (e) {
            console.error('requestCompletion: ', e);
        }
    }

    /**
     * These functions are for supporting DFFilter component
     */
    async requestCompletion_DFFilter(
        context,
        { line, character },
        { triggerKind, triggerCharacter }
    ) {
        try {
            let result = this._getDFCompletion_DFFilter(context, line, character);
            if (!result) return null;
            const items = 'items' in result ? result.items : result;
            return this.sortResults(context, items);
        } catch (e) {
            console.error('requestCompletion: ', e);
        }
    }

    processDiagnostics(params) {
        const diagnostics = params.diagnostics
            .map(({ range, message, severity }) => ({
                from: posToOffset(this.view.state.doc, range.start),
                to: posToOffset(this.view.state.doc, range.end),
                severity: {
                    [DiagnosticSeverity.Error]: 'error',
                    [DiagnosticSeverity.Warning]: 'warning',
                    [DiagnosticSeverity.Information]: 'info',
                    [DiagnosticSeverity.Hint]: 'info',
                }[severity],
                message,
            }))
            .filter(
                ({ from, to }) =>
                    from !== null && to !== null && from !== undefined && to !== undefined
            )
            .sort((a, b) => {
                switch (true) {
                    case a.from < b.from:
                        return -1;
                    case a.from > b.from:
                        return 1;
                }
                return 0;
            });
        this.view.dispatch(setDiagnostics(this.view.state, diagnostics));
    }
}

function posToOffset(doc, pos) {
    if (pos.line >= doc.lines) return;
    const offset = doc.line(pos.line + 1).from + pos.character;
    if (offset > doc.length) return;
    return offset;
}

function formatContents(contents) {
    if (Array.isArray(contents)) {
        return contents.map((c) => formatContents(c) + '\n\n').join('');
    } else if (typeof contents === 'string') {
        return contents;
    } else {
        return contents.value;
    }
}

function prefixMatch(options) {
    const first = new Set();
    const rest = new Set();
    for (const { apply } of options) {
        const [initial, ...restStr] = apply;
        first.add(initial);
        for (const char of restStr) {
            rest.add(char);
        }
    }
    const source = toSet(first) + toSet(rest) + '*$';
    return [new RegExp('^' + source), new RegExp(source)];
}

function toSet(chars) {
    let preamble = '';
    let flat = Array.from(chars).join('');
    const words = /\w/.test(flat);
    if (words) {
        preamble += '\\w';
        flat = flat.replace(/\w/g, '');
    }
    return `[${preamble}${flat.replace(/[^\w\s]/g, '\\$&')}]`;
}

export default LanguageServerPlugin;
