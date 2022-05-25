const timeout = 10000;
const changesDelay = 3000;

import { setParamOptions } from './autocomplete';
import { setDiagnostics } from '@codemirror/lint';
import socket from '../../components/Socket';
import { WebAppEndpoint } from '../../interfaces/IApp';
import { DiagnosticSeverity, SignatureHelpTriggerKind } from 'vscode-languageserver-protocol';

import { rootUri, documentUri, languageId } from './source';
import { formatContents, sortResults } from './helper';
import DFFilterPlugin from './df-plugin';

/**
 * `dfFilter` option is added to support dfFilter component.
 * if `dfFilter=true`, no connection to server is needed.
 */
class LanguageServerPlugin {
    constructor(view, config) {
        this.view = view;
        this.signatureData = null;
        this.rootUri = this.view.state.facet(rootUri);
        this.documentUri = this.view.state.facet(documentUri);
        this.languageId = this.view.state.facet(languageId);
        this.documentVersion = 0;
        this.changesTimeout = 0;
        // this.lint = lint;
        this.config = config;

        this.setupLSConnection();

        this.dfPlugin = new DFFilterPlugin();
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
                // console.log(
                //     `received notify from LSP server at ${new Date().toLocaleString()} `,
                //     notification
                // );
                switch (notification.method) {
                    case 'textDocument/publishDiagnostics':
                        if (this.config().lint) {
                            this.processDiagnostics(notification.params);
                        }
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
            // console.log(
            //     `send LSP request on ${channel}  to Server at ${new Date().toLocaleString()} `,
            //     rpcMessage
            // );
            socket.emit(channel, JSON.stringify(rpcMessage));

            setTimeout(() => {
                resolve(null);
            }, time);

            if (channel) {
                socket.once(channel, (result) => {
                    const response = JSON.parse(result.toString());
                    // console.log(
                    //     `received from LSP on ${channel} server at ${new Date().toLocaleString()} `,
                    //     response
                    // );
                    resolve(response);
                });
            }
        });
    }

    update({ docChanged }) {
        if (!docChanged) return;
        if (!this.ready) this.initializeLS({ documentText: this.view.state.doc.toString() });

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
        if (this.ready) {
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

    async requestCompletion_CodeEditor(
        context,
        { line, character },
        { triggerKind, triggerCharacter }
    ) {
        try {
            // get Dataframe's columns completion.
            let dfCompletionItems;
            if (context.matchBefore(/['"]+$/) || context.matchBefore(/[\w]+$/)) {
                dfCompletionItems = this.dfPlugin.getDFCompletion_CodeEditor(
                    context,
                    line,
                    character
                );
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

            const items = 'items' in result ? result.items : result;
            return sortResults(context, items);
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

export default LanguageServerPlugin;
