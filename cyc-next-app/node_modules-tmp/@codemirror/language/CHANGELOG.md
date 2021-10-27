## 0.19.3 (2021-09-13)

### Bug fixes

Fix an issue where a parse that skipped content with `skipUntilInView` would in some cases not be restarted when the range came into view.

## 0.19.2 (2021-08-11)

### Bug fixes

Fix a bug that caused `indentOnInput` to fire for the wrong kinds of transactions.

Fix a bug that could cause `indentOnInput` to apply its changes incorrectly.

## 0.19.1 (2021-08-11)

### Bug fixes

Fix incorrect versions for @lezer dependencies.

## 0.19.0 (2021-08-11)

### Breaking changes

CodeMirror now uses lezer 0.15, which means different package names (scoped with @lezer) and some breaking changes in the library.

`EditorParseContext` is now called `ParseContext`. It is no longer passed to parsers, but must be retrieved with `ParseContext.get`.

`IndentContext.lineIndent` now takes a position, not a `Line` object, as argument.

`LezerLanguage` was renamed to `LRLanguage` (because all languages must emit Lezer-style trees, the name was misleading).

`Language.parseString` no longer exists. You can just call `.parser.parse(...)` instead.

### New features

New `IndentContext.lineAt` method to access lines in a way that is aware of simulated line breaks.

`IndentContext` now provides a `simulatedBreak` property through which client code can query whether the context has a simulated line break.

## 0.18.2 (2021-06-01)

### Bug fixes

Fix an issue where asynchronous re-parsing (with dynamically loaded languages) sometimes failed to fully happen.

## 0.18.1 (2021-03-31)

### Breaking changes

`EditorParseContext.getSkippingParser` now replaces `EditorParseContext.skippingParser` and allows you to provide a promise that'll cause parsing to start again. (The old property remains available until the next major release.)

### Bug fixes

Fix an issue where nested parsers could see past the end of the nested region.

## 0.18.0 (2021-03-03)

### Breaking changes

Update dependencies to 0.18.

### Breaking changes

The `Language` constructor takes an additional argument that provides the top node type.

### New features

`Language` instances now have a `topNode` property giving their top node type.

`TreeIndentContext` now has a `continue` method that allows an indenter to defer to the indentation of the parent nodes.

## 0.17.5 (2021-02-19)

### New features

This package now exports a `foldInside` helper function, a fold function that should work for most delimited node types.

## 0.17.4 (2021-01-15)

## 0.17.3 (2021-01-15)

### Bug fixes

Parse scheduling has been improved to reduce the likelyhood of the user looking at unparsed code in big documents.

Prevent parser from running too far past the current viewport in huge documents.

## 0.17.2 (2021-01-06)

### New features

The package now also exports a CommonJS module.

## 0.17.1 (2020-12-30)

### Bug fixes

Fix a bug where changing the editor configuration wouldn't update the language parser used.

## 0.17.0 (2020-12-29)

### Breaking changes

First numbered release.

