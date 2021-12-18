// import { defaultHighlightStyle } from "@codemirror/highlight";
// import { bracketMatching } from "@codemirror/matchbrackets";
// import { EditorView, keymap } from "@codemirror/view";
// import { lineNumbers } from "@codemirror/gutter";
// import { basicSetup } from "@codemirror/basic-setup";
// import { oneDark } from "@codemirror/theme-one-dark";
// import { standardKeymap, defaultTabBinding } from "./codemirrorcommands";
// import { languageServer } from 'codemirror-languageserver';
// import { python } from "./lang-python";
// import { indentUnit } from '@codemirror/language';

// const ls = languageServer({
// 	serverUri: "ws://localhost:3001/python",
// 	rootUri: 'file:///',
// 	documentUri: `file:///test`,
// 	languageId: 'python' // As defined at https://microsoft.github.io/language-server-protocol/specification#textDocumentItem.
// });


// export const extensions = [
//   basicSetup,
//   oneDark,
//   EditorView.lineWrapping,
//   lineNumbers(),
//   bracketMatching(),
//   defaultHighlightStyle.fallback,
//   python(),
//   ls,
//   keymap.of([standardKeymap,defaultTabBinding]),
//   indentUnit.of('    '),
// ];
