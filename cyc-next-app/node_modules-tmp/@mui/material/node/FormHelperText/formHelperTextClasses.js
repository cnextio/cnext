"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFormHelperTextUtilityClasses = getFormHelperTextUtilityClasses;
exports.default = void 0;

var _core = require("@mui/core");

function getFormHelperTextUtilityClasses(slot) {
  return (0, _core.generateUtilityClass)('MuiFormHelperText', slot);
}

const formHelperTextClasses = (0, _core.generateUtilityClasses)('MuiFormHelperText', ['root', 'error', 'disabled', 'sizeSmall', 'sizeMedium', 'contained', 'focused', 'filled', 'required']);
var _default = formHelperTextClasses;
exports.default = _default;