import { autocompletion } from '@codemirror/autocomplete';
import { setDiagnostics } from '@codemirror/lint';
import { Facet } from '@codemirror/state';
import { hoverTooltip } from '@codemirror/tooltip';
import { ViewPlugin, EditorView } from '@codemirror/view';
import { WebSocketTransport, RequestManager, Client } from '@open-rpc/client-js';
import { CompletionItemKind, CompletionTriggerKind, DiagnosticSeverity } from 'vscode-languageserver-protocol';

const timeout = 10000;
const changesDelay = 500;
const CompletionItemKindMap = Object.fromEntries(Object.entries(CompletionItemKind).map(([key, value]) => [value, key]));
const useLast = (values) => values.reduce((_, v) => v, '');
const serverUri = Facet.define({ combine: useLast });
const rootUri = Facet.define({ combine: useLast });
const documentUri = Facet.define({ combine: useLast });
const languageId = Facet.define({ combine: useLast });
class LanguageServerPlugin {
    constructor(view) {
        this.view = view;
        this.rootUri = this.view.state.facet(rootUri);
        this.documentUri = this.view.state.facet(documentUri);
        this.languageId = this.view.state.facet(languageId);
        this.documentVersion = 0;
        this.changesTimeout = 0;
        this.transport = new WebSocketTransport(this.view.state.facet(serverUri));
        this.requestManager = new RequestManager([this.transport]);
        this.client = new Client(this.requestManager);
        this.client.onNotification((data) => {
            this.processNotification(data);
        });
        this.initialize({
            documentText: this.view.state.doc.toString(),
        });
    }
    update({ docChanged }) {
        if (!docChanged)
            return;
        if (this.changesTimeout)
            clearTimeout(this.changesTimeout);
        /* eslint-disable-next-line no-restricted-globals */
        this.changesTimeout = self.setTimeout(() => {
            this.sendChange({
                documentText: this.view.state.doc.toString(),
            });
        }, changesDelay);
    }
    destroy() {
        this.client.close();
    }
    request(timeout, method, params) {
        return this.client.request({ method, params }, timeout);
    }
    notify(method, params) {
        return this.client.notify({ method, params });
    }
    async initialize({ documentText }) {
        const { capabilities } = await this.request(timeout * 3, 'initialize', {
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
                        dynamicRegistration: false,
                        signatureInformation: {
                            documentationFormat: ['plaintext', 'markdown'],
                        },
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
        this.capabilities = capabilities;
        this.notify('initialized', {});
        this.notify('textDocument/didOpen', {
            textDocument: {
                uri: this.documentUri,
                languageId: this.languageId,
                text: documentText,
                version: this.documentVersion,
            },
        });
        this.ready = true;
    }
    async sendChange({ documentText }) {
        if (!this.ready)
            return;
        try {
            await this.notify('textDocument/didChange', {
                textDocument: {
                    uri: this.documentUri,
                    version: this.documentVersion++,
                },
                contentChanges: [{ text: documentText }],
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    requestDiagnostics(view) {
        this.sendChange({ documentText: view.state.doc.toString() });
    }
    async requestHoverTooltip(view, { line, character }) {
        if (!this.ready || !this.capabilities.hoverProvider)
            return null;
        this.sendChange({ documentText: view.state.doc.toString() });
        const result = await this.request(timeout, 'textDocument/hover', {
            textDocument: { uri: this.documentUri },
            position: { line, character },
        });
        if (!result)
            return null;
        const { contents, range } = result;
        let pos = posToOffset(view.state.doc, { line, character });
        let end;
        if (range) {
            pos = posToOffset(view.state.doc, range.start);
            end = posToOffset(view.state.doc, range.end);
        }
        if (pos === null)
            return null;
        const dom = document.createElement('div');
        dom.classList.add('documentation');
        dom.textContent = formatContents(contents);
        return { pos, end, create: (view) => ({ dom }), above: true };
    }
    async requestCompletion(context, { line, character }, { triggerKind, triggerCharacter, }) {
        if (!this.ready || !this.capabilities.completionProvider)
            return null;
        this.sendChange({
            documentText: context.state.doc.toString(),
        });
        const result = await this.request(timeout, 'textDocument/completion', {
            textDocument: { uri: this.documentUri },
            position: { line, character },
            context: {
                triggerKind,
                triggerCharacter,
            },
        });
        if (!result)
            return null;
        const items = 'items' in result ? result.items : result;
        let options = items.map(({ detail, label, kind, textEdit, documentation, sortText, filterText, }) => {
            var _a;
            const completion = {
                label,
                detail,
                apply: (_a = textEdit === null || textEdit === void 0 ? void 0 : textEdit.newText) !== null && _a !== void 0 ? _a : label,
                type: kind && CompletionItemKindMap[kind].toLowerCase(),
                sortText: sortText !== null && sortText !== void 0 ? sortText : label,
                filterText: filterText !== null && filterText !== void 0 ? filterText : label,
            };
            if (documentation) {
                completion.info = formatContents(documentation);
            }
            return completion;
        });
        const [span, match] = prefixMatch(options);
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
                        case a.startsWith(token.text) &&
                            !b.startsWith(token.text):
                            return -1;
                        case !a.startsWith(token.text) &&
                            b.startsWith(token.text):
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
    processNotification(notification) {
        try {
            switch (notification.method) {
                case 'textDocument/publishDiagnostics':
                    this.processDiagnostics(notification.params);
            }
        }
        catch (error) {
            console.error(error);
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
            .filter(({ from, to }) => from !== null && to !== null && from !== undefined && to !== undefined)
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
            return (_a = plugin === null || plugin === void 0 ? void 0 : plugin.requestHoverTooltip(view, offsetToPos(view.state.doc, pos))) !== null && _a !== void 0 ? _a : null;
        }),
        autocompletion({
            override: [
                async (context) => {
                    var _a, _b, _c;
                    if (plugin == null)
                        return null;
                    const { state, pos, explicit } = context;
                    const line = state.doc.lineAt(pos);
                    let trigKind = CompletionTriggerKind.Invoked;
                    let trigChar;
                    if (!explicit &&
                        ((_c = (_b = (_a = plugin.capabilities) === null || _a === void 0 ? void 0 : _a.completionProvider) === null || _b === void 0 ? void 0 : _b.triggerCharacters) === null || _c === void 0 ? void 0 : _c.includes(line.text[pos - line.from - 1]))) {
                        trigKind = CompletionTriggerKind.TriggerCharacter;
                        trigChar = line.text[pos - line.from - 1];
                    }
                    if (trigKind === CompletionTriggerKind.Invoked &&
                        !context.matchBefore(/\w+$/)) {
                        return null;
                    }
                    return await plugin.requestCompletion(context, offsetToPos(state.doc, pos), {
                        triggerKind: trigKind,
                        triggerCharacter: trigChar,
                    });
                },
            ],
        }),
        baseTheme,
    ];
}
function posToOffset(doc, pos) {
    if (pos.line >= doc.lines)
        return;
    const offset = doc.line(pos.line + 1).from + pos.character;
    if (offset > doc.length)
        return;
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
        return contents.map((c) => formatContents(c) + '\n\n').join('');
    }
    else if (typeof contents === 'string') {
        return contents;
    }
    else {
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
        marginLeft: '100p',
        padding: '10px 10px 10px 10px',
        borderLeft: '5px solid #999',
        whiteSpace: 'pre',
    },
    '.cm-tooltip.lint': {
        whiteSpace: 'pre',
    },
});

export { languageServer };
