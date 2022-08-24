// import {
//     highlightSpecialChars,
//     drawSelection,
//     highlightActiveLine,
//     keymap,
// } from '@codemirror/view';
// export { EditorView } from '@codemirror/view';
// // import { EditorState } from '@codemirror/state';
// // export { EditorState } from '@codemirror/state';
// import { history } from '@codemirror/commands';
// // import { foldGutter, foldKeymap } from '@codemirror/fold';
// import { foldGutter } from '@codemirror/language';
// import { defaultKeymap } from "@codemirror/commands";
// import { indentOnInput } from '@codemirror/language';
// import { lineNumbers, highlightActiveLineGutter } from '@codemirror/view';

// import { bracketMatching } from '@codemirror/view';
// import { closeBrackets } from '@codemirror/view';
// import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
// import { rectangularSelection } from '@codemirror/view'
// import { defaultHighlightStyle } from '@codemirror/view';
// import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
// // import { commentKeymap } from "@codemirror/comment";
// import { lintKeymap } from '@codemirror/lint';

// /**
// This is an extension value that just pulls together a whole lot of
// extensions that you might want in a basic editor. It is meant as a
// convenient helper to quickly set up CodeMirror without installing
// and importing a lot of packages.

// Specifically, it includes...

//  - [the default command bindings](https://codemirror.net/6/docs/ref/#commands.defaultKeymap)
//  - [line numbers](https://codemirror.net/6/docs/ref/#gutter.lineNumbers)
//  - [special character highlighting](https://codemirror.net/6/docs/ref/#view.highlightSpecialChars)
//  - [the undo history](https://codemirror.net/6/docs/ref/#history.history)
//  - [a fold gutter](https://codemirror.net/6/docs/ref/#fold.foldGutter)
//  - [custom selection drawing](https://codemirror.net/6/docs/ref/#view.drawSelection)
//  - [multiple selections](https://codemirror.net/6/docs/ref/#state.EditorState^allowMultipleSelections)
//  - [reindentation on input](https://codemirror.net/6/docs/ref/#language.indentOnInput)
//  - [the default highlight style](https://codemirror.net/6/docs/ref/#highlight.defaultHighlightStyle) (as fallback)
//  - [bracket matching](https://codemirror.net/6/docs/ref/#matchbrackets.bracketMatching)
//  - [bracket closing](https://codemirror.net/6/docs/ref/#closebrackets.closeBrackets)
//  - [autocompletion](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion)
//  - [rectangular selection](https://codemirror.net/6/docs/ref/#rectangular-selection.rectangularSelection)
//  - [active line highlighting](https://codemirror.net/6/docs/ref/#view.highlightActiveLine)
//  - [active line gutter highlighting](https://codemirror.net/6/docs/ref/#gutter.highlightActiveLineGutter)
//  - [selection match highlighting](https://codemirror.net/6/docs/ref/#search.highlightSelectionMatches)
//  - [search](https://codemirror.net/6/docs/ref/#search.searchKeymap)
//  - [commenting](https://codemirror.net/6/docs/ref/#comment.commentKeymap)
//  - [linting](https://codemirror.net/6/docs/ref/#lint.lintKeymap)

// (You'll probably want to add some language package to your setup
// too.)

// This package does not allow customization. The idea is that, once
// you decide you want to configure your editor more precisely, you
// take this package's source (which is just a bunch of imports and
// an array literal), copy it into your own code, and adjust it as
// desired.
// */
// const basicSetup = [
//     /*@__PURE__*/ lineNumbers(),
//     /*@__PURE__*/ highlightActiveLineGutter(),
//     /*@__PURE__*/ highlightSpecialChars(),
//     /*@__PURE__*/ history(),
//     /*@__PURE__*/ foldGutter({ openText: "\u25bc", closedText: "\u25b6" }),
//     /*@__PURE__*/ drawSelection(),
//     // /*@__PURE__*/ EditorState.allowMultipleSelections.of(true),
//     /*@__PURE__*/ indentOnInput(),
//     // defaultHighlightStyle.fallback,
//     // /*@__PURE__*/ bracketMatching(),
//     // /*@__PURE__*/ closeBrackets(),
//     // // /*@__PURE__*/ autocompletion(),
//     // /*@__PURE__*/ rectangularSelection(),
//     /*@__PURE__*/ highlightActiveLine(),
//     /*@__PURE__*/ highlightSelectionMatches(),
//     // /*@__PURE__*/ keymap.of([
//     //     ...closeBracketsKeymap,
//     //     ...defaultKeymap,
//     //     ...searchKeymap,
//     //     ...historyKeymap,
//     //     ...foldKeymap,
//     //     ...commentKeymap,
//     //     // ...completionKeymap,
//     //     ...lintKeymap,
//     // ]),
// ];

// export { basicSetup };

import {
    keymap,
    highlightSpecialChars,
    drawSelection,
    highlightActiveLine,
    dropCursor,
    rectangularSelection,
    crosshairCursor,
    lineNumbers,
    highlightActiveLineGutter,
} from "@codemirror/view";
import { Extension, EditorState } from "@codemirror/state";
import {
    defaultHighlightStyle,
    syntaxHighlighting,
    indentOnInput,
    bracketMatching,
    foldGutter,
    foldKeymap,
} from "@codemirror/language";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import {
    autocompletion,
    completionKeymap,
    closeBrackets,
    closeBracketsKeymap,
} from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";

/// This is an extension value that just pulls together a number of
/// extensions that you might want in a basic editor. It is meant as a
/// convenient helper to quickly set up CodeMirror without installing
/// and importing a lot of separate packages.
///
/// Specifically, it includes...
///
///  - [the default command bindings](#commands.defaultKeymap)
///  - [line numbers](#view.lineNumbers)
///  - [special character highlighting](#view.highlightSpecialChars)
///  - [the undo history](#commands.history)
///  - [a fold gutter](#language.foldGutter)
///  - [custom selection drawing](#view.drawSelection)
///  - [drop cursor](#view.dropCursor)
///  - [multiple selections](#state.EditorState^allowMultipleSelections)
///  - [reindentation on input](#language.indentOnInput)
///  - [the default highlight style](#language.defaultHighlightStyle) (as fallback)
///  - [bracket matching](#language.bracketMatching)
///  - [bracket closing](#autocomplete.closeBrackets)
///  - [autocompletion](#autocomplete.autocompletion)
///  - [rectangular selection](#view.rectangularSelection) and [crosshair cursor](#view.crosshairCursor)
///  - [active line highlighting](#view.highlightActiveLine)
///  - [active line gutter highlighting](#view.highlightActiveLineGutter)
///  - [selection match highlighting](#search.highlightSelectionMatches)
///  - [search](#search.searchKeymap)
///  - [linting](#lint.lintKeymap)
///
/// (You'll probably want to add some language package to your setup
/// too.)
///
/// This extension does not allow customization. The idea is that,
/// once you decide you want to configure your editor more precisely,
/// you take this package's source (which is just a bunch of imports
/// and an array literal), copy it into your own code, and adjust it
/// as desired.
export const basicSetup: Extension = [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    // TODO: implement a more surgical foldingChanged
    foldGutter({ openText: "\u25bc", closedText: "\u25b6", foldingChanged: ()=>true }),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    // autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
];

/// A minimal set of extensions to create a functional editor. Only
/// includes [the default keymap](#commands.defaultKeymap), [undo
/// history](#commands.history), [special character
/// highlighting](#view.highlightSpecialChars), [custom selection
/// drawing](#view.drawSelection), and [default highlight
/// style](#language.defaultHighlightStyle).
export const minimalSetup: Extension = [
    highlightSpecialChars(),
    history(),
    drawSelection(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    keymap.of([...defaultKeymap, ...historyKeymap]),
];

export { EditorView } from "@codemirror/view";
