"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getScopedCssBaselineUtilityClass = getScopedCssBaselineUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getScopedCssBaselineUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiScopedCssBaseline', slot);
}

const scopedCssBaselineClasses = (0, _core.generateUtilityClasses)('MuiScopedCssBaseline', ['root']);
var _default = scopedCssBaselineClasses;
exports.default = _default;