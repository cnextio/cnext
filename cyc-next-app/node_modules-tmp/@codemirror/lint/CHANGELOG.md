## 0.19.2 (2021-09-29)

### Bug fixes

Fix a bug where reconfiguring the lint source didn't restart linting.

## 0.19.1 (2021-09-17)

### Bug fixes

Prevent decorations that cover just a line break from being invisible by showing a widget instead of range for them.

### New features

The `diagnosticCount` method can now be used to determine whether there are active diagnostics.

## 0.19.0 (2021-08-11)

### Breaking changes

Update dependencies to 0.19.0

## 0.18.6 (2021-08-08)

### Bug fixes

Fix a crash in the key handler of the lint panel when no diagnostics are available.

## 0.18.5 (2021-08-07)

### Bug fixes

Fix an issue that caused `openLintPanel` to not actually open the panel when ran before the editor had any lint state loaded.

### New features

The package now exports a `forceLinting` function that forces pending lint queries to run immediately.

## 0.18.4 (2021-06-07)

### Bug fixes

Multiple `linter` extensions can now be added to an editor without disrupting each other.

Fix poor layout on lint tooltips due to changes in @codemirror/tooltip.

## 0.18.3 (2021-05-10)

### Bug fixes

Fix a regression where using `setDiagnostics` when linting hadn't been abled yet ignored the first set of diagnostics.

## 0.18.2 (2021-04-16)

### Bug fixes

Newlines in line messages are now shown as line breaks to the user.

### New features

You can now pass a delay option to `linter` to configure how long it waits before calling the linter.

## 0.18.1 (2021-03-15)

### Bug fixes

Adjust to current @codemirror/panel and @codemirror/tooltip interfaces.

## 0.18.0 (2021-03-03)

### Bug fixes

Make sure action access keys are discoverable for screen reader users.

Selection in the lint panel should now be properly visible to screen readers.

## 0.17.1 (2021-01-06)

### New features

The package now also exports a CommonJS module.

## 0.17.0 (2020-12-29)

### Breaking changes

First numbered release.

