import socket from "../../../components/Socket";
import { WebAppEndpoint } from "../../../interfaces/IApp";
import store, { RootState } from "../../../../redux/store";
import { getCodeText } from "../libCodeEditor";
import { CompletionTriggerKind, SignatureHelpTriggerKind } from "vscode-languageserver-protocol";

class PythonLanguageClient {
    config: any;
    monaco: any;
    timeout = 10000;
    documentVersion = 0;
    changesTimeout = 0;
    changesDelay = 3000;
    settings = () => store.getState().projectManager.settings.code_editor;

    constructor(config: any, monaco: any) {
        this.config = config;
        this.monaco = monaco;
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
                    await this.sendChange();
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
                    await this.sendChange();
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

                let { contents, range } = hoverResult;
                return {
                    range: new this.monaco.Range(
                        range?.start?.line + 1,
                        range?.start?.character + 1,
                        range?.end?.line + 1,
                        range?.end?.character + 1
                    ),
                    contents,
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
                    await this.sendChange();
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
        socket.emit("ping", WebAppEndpoint.LanguageServer);
        socket.on("pong", (message) => {
            // console.log("Get pong from server when init LSP");
        });

        // register listener notify from server
        socket.on(WebAppEndpoint.LanguageServerNotifier, (result) => {
            try {
                const notification = JSON.parse(result);
                // console.log(
                //     `received notify from LSP server at ${new Date().toLocaleString()} `,
                //     notification
                // );
                switch (notification.method) {
                    case "textDocument/publishDiagnostics":
                        if (this.settings().lint) {
                            console.log("textDocument/publishDiagnostics", notification.params);
                            // this.processDiagnostics(notification.params);
                        }
                }
            } catch (error) {
                console.error(error);
            }
        });

        // send initinalize
        this.initializeLS();
    }

    async requestLS(channel: string, method: string, params: object, timeout: number) {
        const rpcMessage = { jsonrpc: "2.0", id: 0, method: method, params: params };

        return new Promise((resolve, reject) => {
            // console.log(
            //     `send LSP request on ${channel}  to Server at ${new Date().toLocaleString()} `,
            //     rpcMessage
            // );
            socket.emit(channel, JSON.stringify(rpcMessage));

            setTimeout(() => {
                resolve(null);
            }, timeout);

            if (channel) {
                socket.once(channel, (result: any) => {
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

        let documentText = getCodeText(store.getState()).join("\n");
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

    update() {
        if (this.changesTimeout) clearTimeout(this.changesTimeout);
        this.changesTimeout = self.setTimeout(() => {
            this.sendChange();
        }, this.changesDelay);
    }

    async sendChange() {
        let documentText = getCodeText(store.getState()).join("\n");
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
