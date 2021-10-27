## 0.19.1 (2021-08-20)

### Bug fixes

Fix a bug in range set iteration that would sometimes cause ranges to report their position as NaN, breaking downstream code.

## 0.19.0 (2021-08-11)

### Breaking changes

Update dependencies to 0.19.0

## 0.18.5 (2021-08-03)

### Bug fixes

Fix a problem in rangeset comparison that caused changes in the covering of point decorations by other decorations to be missed.

## 0.18.4 (2021-06-29)

### Bug fixes

Fix an issue that caused `RangeSet.between` to incorrectly ignore ranges entirely at the start of the iterated region.

## 0.18.3 (2021-06-03)

### New features

The new static `RangeSet.eq` method can be used to efficiently check whether two groups of change sets differ in a given range.

## 0.18.2 (2021-05-27)

### Bug fixes

Adjust the logic for tracking open ranges to agree with the change in how precedence is handled in the view package.

## 0.18.1 (2021-04-30)

### Bug fixes

When iterating spans and points, don't emit point ranges when they are entirely covered by a previous point.

## 0.18.0 (2021-03-03)

### Breaking changes

Update dependencies to 0.18.

## 0.17.1 (2021-01-06)

### New features

The package now also exports a CommonJS module.

## 0.17.0 (2020-12-29)

### Breaking changes

First numbered release.

