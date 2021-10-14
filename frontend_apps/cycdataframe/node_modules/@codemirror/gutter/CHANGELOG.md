## 0.19.2 (2021-09-13)

### Bug fixes

Fix the `domEventHandlers` option to `lineNumbers`, which was entirely ignored before.

## 0.19.1 (2021-08-16)

### Bug fixes

Fix a bug where range sets with gutter markers didn't map correctly in response to changes at the start of the gutter's line.

## 0.19.0 (2021-08-11)

### Breaking changes

Update dependencies to 0.19.0

## 0.18.4 (2021-06-03)

### Bug fixes

Make sure gutters are updated when the `gutterLineClass` facet changes, to fix a bug where the active line gutter marking didn't update properly.

## 0.18.3 (2021-05-15)

### Breaking changes

`GutterMarker.at` is now deprecated (use \`GutterMarker.range\`).

### New features

The new `gutterLineClass` facet can now be used to style all gutter elements for a given line.

The package now exports a `highlightActiveLineGutter` extension that can be used to add a style to the gutter for the active line.

## 0.18.2 (2021-04-22)

### Bug fixes

Fix a bug where dynamically enabling a single gutter would not draw the gutter's content.

## 0.18.1 (2021-04-15)

### Bug fixes

Make sure the gutter covers the cursor when it is behind it.

## 0.18.0 (2021-03-03)

### Breaking changes

Extra CSS classes for gutters must now be specified with the `class` option. The `style` option no longer exists.

## 0.17.2 (2021-01-27)

### New features

Pass the editor state to the `formatNumber` option to `lineNumbers` and make sure widgets get updated when their string changes.

## 0.17.1 (2021-01-06)

### New features

The package now also exports a CommonJS module.

## 0.17.0 (2020-12-29)

### Breaking changes

First numbered release.

