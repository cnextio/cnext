import socket from "../../../components/Socket";
import { WebAppEndpoint } from "../../../interfaces/IApp";
import { getMainEditorModel } from "./libCodeEditor";
import store, { RootState } from "../../../../redux/store";
import { getCodeText } from "../libCodeEditor";

class PythonLanguageClient {
    config: any;
    monaco: any;
    timeout = 10000;
    documentVersion = 0;
    settings = () => store.getState().projectManager.settings.code_editor;

    constructor(config: any, monaco: any) {
        this.config = config;
        this.monaco = monaco;
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
                        console.log("notification.params", notification.params);
                    // if (this.config().lint) {
                    //     // this.processDiagnostics(notification.params);
                    // }
                }
            } catch (error) {
                console.error(error);
            }
        });

        // send initinalize
        this.initializeLS();
    }

    async requestLS(channel: string, method: string, params: object) {
        const rpcMessage = { jsonrpc: "2.0", id: 0, method: method, params: params };

        return new Promise((resolve, reject) => {
            // console.log(
            //     `send LSP request on ${channel}  to Server at ${new Date().toLocaleString()} `,
            //     rpcMessage
            // );
            socket.emit(channel, JSON.stringify(rpcMessage));

            setTimeout(() => {
                resolve(null);
            }, this.timeout);

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
        const result = await this.requestLS(WebAppEndpoint.LanguageServer, "initialize", {
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
        });

        let documentText = getCodeText(store.getState()).join("\n");
        if (result && result.capabilities) {
            this.requestLS(WebAppEndpoint.LanguageServer, "initialized", {});
            this.requestLS(WebAppEndpoint.LanguageServer, "textDocument/didOpen", {
                textDocument: {
                    uri: this.config.documentUri,
                    languageId: this.config.languageId,
                    text: documentText,
                    version: this.documentVersion,
                },
            });
        }
    }
}

export default PythonLanguageClient;
