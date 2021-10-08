"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFormLabelUtilityClasses = getFormLabelUtilityClasses;
exports.default = void 0;

var _core = require("@mui/core");

function getFormLabelUtilityClasses(slot) {
  return (0, _core.generateUtilityClass)('MuiFormLabel', slot);
}

const formLabelClasses = (0, _core.generateUtilityClasses)('MuiFormLabel', ['root', 'colorSecondary', 'focused', 'disabled', 'error', 'filled', 'required', 'asterisk']);
var _default = formLabelClasses;
exports.default = _default;