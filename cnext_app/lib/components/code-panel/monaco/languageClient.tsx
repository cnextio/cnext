import { WebAppEndpoint } from "../../../interfaces/IApp";
import store, { RootState } from "../../../../redux/store";
import { getCodeText, getMainEditorModel } from "./libCodeEditor";
import { CompletionTriggerKind, SignatureHelpTriggerKind } from "vscode-languageserver-protocol";
import { Socket } from "socket.io-client";

class PythonLanguageClient {
    config: any;
    monaco: any;
    socket: Socket
    timeout = 10000;
    documentVersion = 0;
    changesTimeout = 0;
    changesDelay = 3000;
    settings = () => store.getState().projectManager.settings.code_editor;

    constructor(config: any, monaco: any, socket: Socket) {
        this.config = config;
        this.monaco = monaco;
        this.socket = socket;
    }

    doValidate() {
        if (this.changesTimeout) clearTimeout(this.changesTimeout);
        this.changesTimeout = self.setTimeout(() => {
            this.sendChange();
        }, this.changesDelay);
    }

    registerSignatureHelp() {
        this.monaco.languages.registerSignatureHelpProvider("python", {
            signatureHelpTriggerCharacters: ["(", ","],
            provideSignatureHelp: async (model: any, position: any) => {
                var documentUri = this.config.documentUri;
                var line = position.lineNumber - 1;
                var character = position.column - 1;

                let signatureResult;
                if (this.settings().autocompletion) {
                    this.sendChange();
                    signatureResult = await this.requestLS(
                        WebAppEndpoint.LanguageServerSignature,
                        "textDocument/signatureHelp",
                        {
                            textDocument: { uri: documentUri },
                            position: { line, character },
                            context: {
                                triggerKind: SignatureHelpTriggerKind.Invoked,
                                triggerCharacter: character,
                            },
                        },
                        this.timeout
                    );
                }
                return {
                    dispose: () => {},
                    value: signatureResult,
                };
            },
        });
    }

    registerHover() {
        this.monaco.languages.registerHoverProvider("python", {
            provideHover: async (model: any, position: any) => {
                var documentUri = this.config.documentUri;
                var line = position.lineNumber - 1;
                var character = position.column - 1;

                let hoverResult;
                if (this.settings().autocompletion) {
                    this.sendChange();
                    hoverResult = await this.requestLS(
                        WebAppEndpoint.LanguageServerHover,
                        "textDocument/hover",
                        {
                            textDocument: { uri: documentUri },
                            position: { line, character },
                        },
                        this.timeout
                    );
                }

                if (!hoverResult) return null;

                let { contents } = hoverResult;
                return {
                    range: new this.monaco.Range(
                        position.lineNumber,
                        position.column,
                        position.lineNumber,
                        position.column
                    ),
                    contents: [{ value: contents[0]?.value }, { value: contents[1] }],
                };
            },
        });
    }

    registerAutocompletion() {
        this.monaco.languages.registerCompletionItemProvider("python", {
            provideCompletionItems: async (model: any, position: any) => {
                var word = model.getWordUntilPosition(position);

                var line = position.lineNumber - 1;
                var character = position.column - 1;
                var trigKind = CompletionTriggerKind.Invoked;
                var documentUri = this.config.documentUri;

                var range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                };
                let completionResult;
                if (this.settings().autocompletion) {
                    this.sendChange();
                    completionResult = await this.requestLS(
                        WebAppEndpoint.LanguageServerCompletion,
                        "textDocument/completion",
                        {
                            textDocument: { uri: documentUri },
                            position: { line, character },
                            context: {
                                trigKind,
                                // triggerCharacter,
                            },
                        },
                        this.timeout
                    );
                }

                if (completionResult) {
                    return {
                        suggestions: completionResult.items.map((item: any) => ({
                            label: item.label,
                            kind: item.kind,
                            documentation: item.documentation,
                            insertText: item.insertText,
                            range: range,
                        })),
                    };
                } else {
                    return { suggestions: [] };
                }
            },
        });
    }

    setupLSConnection() {
        this.socket.emit("ping", WebAppEndpoint.LanguageServer);
        this.socket.on("pong", (message) => {
            // console.log("Get pong from server when init LSP");
        });

        // register listener notify from server
        this.socket.on(WebAppEndpoint.LanguageServerNotifier, (result) => {
            try {
                const notification = JSON.parse(result);
                // console.log(
                //     `received notify from LSP server at ${new Date().toLocaleString()} `,
                //     notification
                // );
                switch (notification.method) {
                    case "textDocument/publishDiagnostics":
                        if (this.settings().lint) {
                            let diagnostics = notification.params.diagnostics;
                            this.processDiagnostics(diagnostics);
                        }
                }
            } catch (error) {
                console.error(error);
            }
        });

        // send initinalize
        this.initializeLS();
    }

    processDiagnostics(diagnostics: any) {
        let model = getMainEditorModel(this.monaco);
        this.monaco.editor.setModelMarkers(
            model,
            "lint",
            diagnostics.map((diagnostic: any) => ({
                startLineNumber: diagnostic.range.start.line + 1,
                startColumn: diagnostic.range.start.character + 1,
                endLineNumber: diagnostic.range.end.line + 1,
                endColumn: diagnostic.range.end.character + 1,
                severity: diagnostic.severity,
                source: diagnostic.source,
                message: diagnostic.message,
                code: diagnostic.code,
            }))
        );
    }

    async requestLS(channel: string, method: string, params: object, timeout: number) {
        const rpcMessage = { jsonrpc: "2.0", id: 0, method: method, params: params };

        return new Promise((resolve, reject) => {
            // console.log(
            //     `send LSP request on ${channel}  to Server at ${new Date().toLocaleString()} `,
            //     rpcMessage
            // );
            this.socket.emit(channel, JSON.stringify(rpcMessage));

            setTimeout(() => {
                resolve(null);
            }, timeout);

            if (channel) {
                this.socket.once(channel, (result: any) => {
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

    async initializeLS() {
        const result = await this.requestLS(
            WebAppEndpoint.LanguageServer,
            "initialize",
            {
                capabilities: {
                    textDocument: {
                        hover: {
                            dynamicRegistration: true,
                            contentFormat: ["plaintext", "markdown"],
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
                                documentationFormat: ["plaintext", "markdown"],
                                deprecatedSupport: false,
                                preselectSupport: false,
                            },
                            contextSupport: false,
                        },
                        signatureHelp: {
                            dynamicRegistration: true,
                            signatureInformation: {
                                documentationFormat: ["plaintext", "markdown"],
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
                        diagnostic: {
                            dynamicRegistration: true,
                            relatedDocumentSupport: true,
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
                rootUri: this.config.rootUri,
                workspaceFolders: [
                    {
                        name: "root",
                        uri: this.config.rootUri,
                    },
                ],
            },
            this.timeout
        );

        let documentText = getCodeText(store.getState());
        if (result && result.capabilities) {
            this.requestLS(WebAppEndpoint.LanguageServer, "initialized", {}, this.timeout);
            this.requestLS(
                WebAppEndpoint.LanguageServer,
                "textDocument/didOpen",
                {
                    textDocument: {
                        uri: this.config.documentUri,
                        languageId: this.config.languageId,
                        text: documentText,
                        version: this.documentVersion,
                    },
                },
                this.timeout
            );
        }
    }

    async sendChange() {
        let documentText = getCodeText(store.getState());
        this.requestLS(
            WebAppEndpoint.LanguageServer,
            "textDocument/didChange",
            {
                textDocument: {
                    uri: this.config.documentUri,
                    version: this.documentVersion++,
                },
                contentChanges: [{ text: documentText }],
            },
            this.timeout
        );
    }
}

type LanguageObjectType = {
    [key: string]: string;
};
const LanguageProvider: LanguageObjectType = {
    py: "python",
    json: "json",
    sql: "sql",
};

export { PythonLanguageClient, LanguageProvider };
