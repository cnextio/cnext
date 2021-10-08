"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTabUtilityClass = getTabUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getTabUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiTab', slot);
}

const tabClasses = (0, _core.generateUtilityClasses)('MuiTab', ['root', 'labelIcon', 'textColorInherit', 'textColorPrimary', 'textColorSecondary', 'selected', 'disabled', 'fullWidth', 'wrapped']);
var _default = tabClasses;
exports.default = _default;