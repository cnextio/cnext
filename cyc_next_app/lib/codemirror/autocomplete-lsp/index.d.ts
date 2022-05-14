import { IEditorConfigs } from '../../interfaces/IApp';

interface LanguageServerOptions {
    serverUri: `ws://${string}` | `wss://${string}`;
    rootUri: string;
    documentUri: string;
    languageId: string;
    editorConfig: IEditorConfigs;
}

declare function languageServer(
    options: LanguageServerOptions
): import('@codemirror/state').Extension[];

declare function dfFilterLanguageServer(): import('@codemirror/state').Extension[];
export { languageServer, dfFilterLanguageServer };
