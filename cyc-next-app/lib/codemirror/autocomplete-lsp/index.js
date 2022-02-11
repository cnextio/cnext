//using a customized version of autocomplete instead of @codemirror/autocomplete
import { autocompletion } from './autocomplete';
import { setDiagnostics } from '@codemirror/lint';
import { Facet } from '@codemirror/state';
import { hoverTooltip } from '@codemirror/tooltip';
import { EditorView, ViewPlugin } from '@codemirror/view';
import {
  WebSocketTransport,
  RequestManager,
  Client,
} from '@open-rpc/client-js';
import {
  CompletionItemKind,
  CompletionTriggerKind,
  DiagnosticSeverity,
  SignatureHelpTriggerKind,
} from 'vscode-languageserver-protocol';
import store from '/redux/store';
import { python } from '../grammar/lang-cnext-python';
const timeout = 10000;
const changesDelay = 500;
const CompletionItemKindMap = Object.fromEntries(
  Object.entries(CompletionItemKind).map(([key, value]) => [value, key])
);
const useLast = (values) => values.reduce((_, v) => v, '');
const serverUri = Facet.define({ combine: useLast });
const rootUri = Facet.define({ combine: useLast });
const documentUri = Facet.define({ combine: useLast });
const languageId = Facet.define({ combine: useLast });
let lsWSClient;
/**
 * `dfFilter` option is added to support dfFilter component.
 * if `dfFilter=true`, no connection to server is needed.
 */
class LanguageServerPlugin {
  constructor(view, dfFilter = false) {
    this.view = view;
    if (!dfFilter) {
      this.rootUri = this.view.state.facet(rootUri);
      this.documentUri = this.view.state.facet(documentUri);
      this.languageId = this.view.state.facet(languageId);
      this.documentVersion = 0;
      this.changesTimeout = 0;
      this.setup_connection();
    } else {
      this.languageId = this.view.state.facet(languageId);
      this.documentVersion = 0;
      this.changesTimeout = 0;
    }
  }

  setup_connection() {
    this.ready = false;
    this.transport = new WebSocketTransport(this.view.state.facet(serverUri));
    this.requestManager = new RequestManager([this.transport]);
    this.client = new Client(this.requestManager);
    console.log('LanguageServerPlugin setup_connection');
    this.client.onNotification((data) => {
      this.processNotificationFromServer(data);
    });
    this.client.onError((data) => {
      console.log(data);
    });
    this.initialize({
      documentText: this.view.state.doc.toString(),
    });
  }

  update({ docChanged }) {
    if (!docChanged) return;
    if (this.changesTimeout) clearTimeout(this.changesTimeout);
    // console.log('update');
    this.changesTimeout = self.setTimeout(() => {
      // console.log('update sendChange');
      this.sendChange({
        documentText: this.view.state.doc.toString(),
      });
    }, changesDelay);
  }

  destroy() {
    console.log('LanguageServerPlugin destroy');
    this.client.close();
  }

  requestServer(method, params, timeout) {
    return this.client.request({ method, params }, timeout);
  }

  notifyServer(method, params) {
    return this.client.notify({ method, params });
  }

  async initialize({ documentText }) {
    try {
      const { capabilities } = await this.requestServer(
          'initialize',
          {
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
                              activeParameterSupport:true,
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
          },
          timeout / 5
      );
      this.capabilities = capabilities;
      this.notifyServer('initialized', {});
      this.notifyServer('textDocument/didOpen', {
        textDocument: {
          uri: this.documentUri,
          languageId: this.languageId,
          text: documentText,
          version: this.documentVersion,
        },
      });
      this.ready = true;
    } catch (error) {
      console.log('LanguageServerPlugin initialize timeout', this);
    }
  }

  async sendChange({ documentText }) {
    if (!this.ready) return;
    try {
      if (this.transport.connection.readyState == WebSocket.CLOSED) {
        console.log('requestCompletion WebSocket.CLOSED');
        this.setup_connection();
        // throw('Websocket disconnected.');
      }
      // console.log('textDocument/didChange');
      await this.notifyServer('textDocument/didChange', {
        textDocument: {
          uri: this.documentUri,
          version: this.documentVersion++,
        },
        contentChanges: [{ text: documentText }],
      });
    } catch (e) {
      console.error(e);
      // console.trace();
      // this.reconnect();
    }
  }

  async requestDiagnostics(view) {
    try {
      if (this.transport.connection.readyState == WebSocket.CLOSED) {
        console.log('requestCompletion WebSocket.CLOSED');
        this.setup_connection();
      }
      // console.log('requestDiagnostics');
      this.sendChange({ documentText: view.state.doc.toString() });
    } catch (e) {
      console.error('requestDiagnostics: ', e);
    }
  }

  async requestHoverTooltip(view, { line, character }) {
    try {
      if (this.transport.connection.readyState == WebSocket.CLOSED) {
        console.log('requestCompletion WebSocket.CLOSED');
        this.setup_connection();
      }
      if (!this.ready || !this.capabilities.hoverProvider) return null;
      this.sendChange({ documentText: view.state.doc.toString() });
      const result = await this.requestServer(
        'textDocument/hover',
        {
          textDocument: { uri: this.documentUri },
          position: { line, character },
        },
        timeout
      );
      if (!result) return null;
      const { contents, range } = result;
      let pos = posToOffset(view.state.doc, { line, character });
      let end;
      if (range) {
        pos = posToOffset(view.state.doc, range.start);
        end = posToOffset(view.state.doc, range.end);
      }

      if (pos === null || !contents) return null;

      const dom = document.createElement('div');
      dom.classList.add('documentation');
      dom.textContent = formatContents(contents);

      return { pos, end, create: (view) => ({ dom }), above: true };
    } catch (e) {
      console.error('requestHoverTooltip: ', e);
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
    const colNames = Object.keys(state.dataFrames.metadata[df_id].columns);

    let items;
    if (colNames) {
      // console.log(tableData);
      // const colNames = col_names.column_names;
      // console.log(colNames);
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
    const values =
      reduxState.dataFrames.metadata[df_id].columns[col_name].unique;
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
    // console.log('Autocomplete: ', text, tree);
    for (const matchStates of syntaxPattern) {
      let cursor = tree.cursor(pos, 1);
      let matchStep = 0;
      while (true) {
        // console.log(cursor.name);
        if (matchStep >= matchStates.length) break;
        let name = matchStates[matchStep].name;
        let nextMatch = matchStates[matchStep].nextMatch;
        // console.log(matchStates, name, nextMatch, cursor.name);
        if (name == cursor.name) {
          if (matchStep == 0) {
            // console.log(text);
            strContent = text.substring(cursor.from, cursor.to);
          }
          // console.log(cursor.name, strContent);
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
    if (matched)
      console.log('Autocomplete: match column names: ', dfName, strContent);
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
    // let editor = context.view;
    let state = context.state;
    let text = state.doc.toString();
    // let parser = state.values[5].context.parser;
    let tree = state.tree;
    let curPos = state.selection.ranges[0].anchor;
    // let cursor = tree.cursor(curPos, 1);
    // console.log(tree.toString());
    // console.log(tree.cursor(curPos, -1).toString());
    // console.log(tree.cursor(curPos, 0).toString());
    // console.log(tree.cursor(curPos, 1).toString());
    let result = this._matchColNameExpression_CodeEditor(
      text,
      tree,
      curPos,
      this.colNamePattern_CodeEditor
    );
    let items = null;
    if (result.matched) {
      items = this._createColNameAutocompleItems(
        result.df_name,
        result.str_content
      );
    }
    console.log('Items: ', items);
    return items;
  }

  // colNameSyntaxPattern_DFFilter = [
  //     //CallExpression(MemberExpression(VariableName,".",PropertyName),ArgList("(",String,")"))
  //     //make a shortcut in this case, did not go up to CallExpression. Might need to test more
  //     [{name: 'ColumnNameExpression', nextMatch: null}]
  // ];
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
    console.log(
      `_matchColumnValueExpression_DFFilter: start matching ${cursor.name}`
    );
    /**
     * TODO: find a way to support number suggestion
     * Need a special handling of Number case here
     */
    // if(cursor.name=='Number'){
    //     cursor.parent();
    // }
    if (cursor.name == 'ColumnValueExpression') {
      // now search for the column name
      console.log(
        '_matchColumnValueExpression_DFFilter: match ColumnValueExpression, now search for column name'
      );
      while (true) {
        console.log(cursor.name);
        let name = matchPattern[matchStep].name;
        let nextMatch = matchPattern[matchStep].nextMatch;
        // console.log(matchStates, name, nextMatch, cursor.name);
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
    // let editor = context.view;
    let state = context.state;
    let text = state.doc.toString();

    let parser = python().language.parser;
    console.log(
      '_getDFCompletion current line parser ',
      parser.parse(state.doc.text[line]).toString()
    );
    let tree = state.tree;
    let curPos = state.selection.ranges[0].anchor;
    // let cursor = tree.cursor(curPos, 1);
    // console.log(cursor.toString());
    let result = this._matchColNameExpression_DFFilter(text, tree, curPos);
    let items = null;
    if (result.matched) {
      items = this._createColNameAutocompleItems(
        result.df_name,
        result.str_content
      );
    } else {
      result = this._matchColValueExpression_DFFilter(
        text,
        tree,
        curPos,
        this.colNamePattern_DFFilter
      );
      if (result.matched) {
        console.log(result);
        items = this._createColValueAutocompleItems(
          result.df_name,
          result.col_name
        );
      }
    }
    console.log('Items: ', items);
    return items;
  }
  /**
   * End support DataFrame-related autocomplete
   */

  async requestSignatureHelp( context,
    { line, character },
    { triggerKind, triggerCharacter }){
        try{
            if (!this.ready || !this.capabilities.signatureHelpProvider) return null;

            if (this.transport.connection.readyState == WebSocket.CLOSED) {
                console.log('requestCompletion WebSocket.CLOSED');
                this.setup_connection();
            }

            let result;
             if (this.transport.connection.readyState != WebSocket.CLOSED) {
                    this.sendChange({
                        documentText: context.state.doc.toString(),
                    });

                    console.log('requestSignatureHelp');
                    result = await this.requestServer(
                        'textDocument/signatureHelp',
                        {
                            textDocument: { uri: this.documentUri },
                            position: { line, character },
                            context: {
                                triggerKind,
                                triggerCharacter,
                            },
                        },
                        timeout
                    );
                   
                    if (!result?.signatures[0]?.parameters) return null;

                    const parameters = result.signatures[0].parameters;
                    let options = parameters.map(({label,documentation})=>{
                        return {
                            label: label + '=',
                            apply: label + '=',
                            info: documentation ? formatContents(documentation) : null,
                            type: 'variable',
                        };
                    })

                    const { pos } = context;
                    return {
                        from: pos,
                        options,
                    };

             }

        }catch(e){
            console.error('requestSignatureHelp: ', e);
        }
    }

  async requestCompletion_CodeEditor(
    context,
    { line, character },
    { triggerKind, triggerCharacter }
  ) {

    try {
      if (!this.ready || !this.capabilities.completionProvider) return null;

      // get Dataframe-based completion first. This does not require accessing to the lsp
      let dfCompletionItems = this._getDFCompletion_CodeEditor(
        context,
        line,
        character
      );

      // then get other completion from server
      if (this.transport.connection.readyState == WebSocket.CLOSED) {
        console.log('requestCompletion WebSocket.CLOSED');
        this.setup_connection();
      }
      let result;
      if (this.transport.connection.readyState != WebSocket.CLOSED) {
        // in the original version requestCompletion will only be triggered when matchBefore is
        // some \w, but in order to allow suggesting column, we will trigger this ' and " match
        // too. Therefore we have to check if it is \w only before sending to the server
        if (context.matchBefore(/[\w]+$/)) {
          this.sendChange({
            documentText: context.state.doc.toString(),
          });
          result = await this.requestServer(
            'textDocument/completion',
            {
              textDocument: { uri: this.documentUri },
              position: { line, character },
              context: {
                triggerKind,
                triggerCharacter,
              },
            },
            timeout
          );
        }
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
      // console.log("requestCompletion result: ", result);
      if (!result) return null;
      const items = 'items' in result ? result.items : result;
      let options = items.map(
        ({
          detail,
          label,
          kind,
          textEdit,
          documentation,
          sortText,
          filterText,
          insertText,
        }) => {
          var _a;
          const completion = {
            label,
            detail,
            apply:
              (_a =
                textEdit === null || textEdit === void 0
                  ? void 0
                  : textEdit.newText) !== null && _a !== void 0
                ? _a
                : insertText,
            type: kind && CompletionItemKindMap[kind].toLowerCase(),
            sortText:
              sortText !== null && sortText !== void 0 ? sortText : label,
            filterText:
              filterText !== null && filterText !== void 0 ? filterText : label,
          };
          if (documentation) {
            completion.info = formatContents(documentation);
          }
          return completion;
        }
      );
      const [span, match] = prefixMatch(options); //find the regrex string
      const token = context.matchBefore(match);
      // console.log(match, options, token);
      let { pos } = context;
      if (token) {
        pos = token.from;
        const word = token.text.toLowerCase();
        if (/^\w+$/.test(word)) {
          options = options
            .filter(({ filterText }) =>
              filterText.toLowerCase().startsWith(word)
            )
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
        // console.log(options);
      }
      return {
        from: pos,
        options,
      };
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
      // console.log("dfFilterRequestCompletion result: ", result);
      if (!result) return null;
      const items = 'items' in result ? result.items : result;
      let options = items.map(
        ({
          detail,
          label,
          kind,
          textEdit,
          documentation,
          sortText,
          filterText,
        }) => {
          var _a;
          const completion = {
            label,
            detail,
            apply:
              (_a =
                textEdit === null || textEdit === void 0
                  ? void 0
                  : textEdit.newText) !== null && _a !== void 0
                ? _a
                : label,
            type: kind && CompletionItemKindMap[kind].toLowerCase(),
            sortText:
              sortText !== null && sortText !== void 0 ? sortText : label,
            filterText:
              filterText !== null && filterText !== void 0 ? filterText : label,
          };
          if (documentation) {
            completion.info = formatContents(documentation);
          }
          return completion;
        }
      );
      const [span, match] = prefixMatch(options); //find the regrex string
      const token = context.matchBefore(match);
      // console.log(match, options, token);
      let { pos } = context;
      if (token) {
        pos = token.from;
        const word = token.text.toLowerCase();
        if (/^\w+$/.test(word)) {
          options = options
            .filter(({ filterText }) =>
              filterText.toLowerCase().startsWith(word)
            )
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
        // console.log(options);
      }
      return {
        from: pos,
        options,
      };
    } catch (e) {
      console.error('requestCompletion: ', e);
    }
  }

  processNotificationFromServer(notification) {
    try {
      switch (notification.method) {
        case 'textDocument/publishDiagnostics':
          this.processDiagnostics(notification.params);
      }
    } catch (error) {
      console.error(error);
    }
  }

  processDiagnostics(params) {
    // console.log("processDiagnostics");
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

function languageServer(options) {
    let plugin = null;
    return [
        serverUri.of(options.serverUri),
        rootUri.of(options.rootUri),
        documentUri.of(options.documentUri),
        languageId.of(options.languageId),
        ViewPlugin.define((view) => (plugin = new LanguageServerPlugin(view))),
        hoverTooltip((view, pos) => {
            var _a;
            return (_a =
                plugin === null || plugin === void 0
                    ? void 0
                    : plugin.requestHoverTooltip(view, offsetToPos(view.state.doc, pos))) !==
                null && _a !== void 0
                ? _a
                : null;
        }),
        autocompletion({
            override: [
                async (context) => {
                    var _a, _b, _c;
                    if (plugin == null) return null;

                    const { state, pos, explicit } = context;
                    const line = state.doc.lineAt(pos);
                    let trigKind = CompletionTriggerKind.Invoked;
                    let trigChar;
                    if (
                        !explicit &&
                        ((_c =
                            (_b =
                                (_a = plugin.capabilities) === null || _a === void 0
                                    ? void 0
                                    : _a.completionProvider) === null || _b === void 0
                                ? void 0
                                : _b.triggerCharacters) === null || _c === void 0
                            ? void 0
                            : _c.includes(line.text[pos - line.from - 1]))
                    ) {
                        trigKind = CompletionTriggerKind.TriggerCharacter;
                        trigChar = line.text[pos - line.from - 1];
                    }

                    if (
                        trigKind === CompletionTriggerKind.Invoked &&
                        !context.matchBefore(/[\w'"]+$/)
                    ) {
                        //added match for ' and "
                        if (context.matchBefore(/[\(,=]+$/)) {
                            // go to Signature Help suggestion
                            trigChar = line.text[pos - line.from - 1];
                            return await plugin.requestSignatureHelp(
                                context,
                                offsetToPos(state.doc, pos),
                                {
                                    triggerKind: SignatureHelpTriggerKind.Invoked,
                                    triggerCharacter: trigChar,
                                }
                            );
                        }
                        return null;
                    }

                    return await plugin.requestCompletion_CodeEditor(
                        context,
                        offsetToPos(state.doc, pos),
                        {
                            triggerKind: trigKind,
                            triggerCharacter: trigChar,
                        }
                    );
                },
            ],
        }),
        baseTheme,
    ];
}

/**
 * This is special language server for the DFFilter component.
 * Use this to take advantage of the autocompletion feature in CodeMirror.
 * This won't connect to the real language server, only autocomplete column
 * name when relevant
 */
function dfFilterLanguageServer(options) {
  let plugin = null;
  return [
    languageId.of(options.languageId),
    ViewPlugin.define(
      (view) => (plugin = new LanguageServerPlugin(view, true))
    ),
    autocompletion({
      override: [
        async (context) => {
          var _a, _b, _c;
          if (plugin == null) return null;
          const { state, pos, explicit } = context;
          const line = state.doc.lineAt(pos);
          let trigKind = CompletionTriggerKind.Invoked;
          let trigChar;
          if (
            !explicit &&
            ((_c =
              (_b =
                (_a = plugin.capabilities) === null || _a === void 0
                  ? void 0
                  : _a.completionProvider) === null || _b === void 0
                ? void 0
                : _b.triggerCharacters) === null || _c === void 0
              ? void 0
              : _c.includes(line.text[pos - line.from - 1]))
          ) {
            trigKind = CompletionTriggerKind.TriggerCharacter;
            trigChar = line.text[pos - line.from - 1];
          }
          if (
            trigKind === CompletionTriggerKind.Invoked &&
            !context.matchBefore(/[\w'"]+$/)
          ) {
            //added match for ' and "
            return null;
          }
          return await plugin.requestCompletion_DFFilter(
            context,
            offsetToPos(state.doc, pos),
            {
              triggerKind: trigKind,
              triggerCharacter: trigChar,
            }
          );
        },
      ],
    }),
    baseTheme,
  ];
}

function posToOffset(doc, pos) {
  if (pos.line >= doc.lines) return;
  const offset = doc.line(pos.line + 1).from + pos.character;
  if (offset > doc.length) return;
  return offset;
}

function offsetToPos(doc, offset) {
  const line = doc.lineAt(offset);
  return {
    line: line.number - 1,
    character: offset - line.from,
  };
}

function formatContents(contents) {
  if (Array.isArray(contents)) {
    return contents.map((c) => formatContents(c) + '\n').join('');
  } else if (typeof contents === 'string') {
    return contents;
  } else {
    return contents.value;
  }
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

const baseTheme = EditorView.baseTheme({
  '.cm-tooltip.documentation': {
    display: 'block',
    marginLeft: '0',
    padding: '3px 6px 3px 8px',
    borderLeft: '5px solid #999',
    whiteSpace: 'pre',
  },
  '.cm-tooltip.lint': {
    whiteSpace: 'pre',
  },
});

export { languageServer, dfFilterLanguageServer };
