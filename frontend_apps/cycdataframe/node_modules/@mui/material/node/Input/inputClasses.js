"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getInputUtilityClass = getInputUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getInputUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiInput', slot);
}

const inputClasses = (0, _core.generateUtilityClasses)('MuiInput', ['root', 'formControl', 'focused', 'disabled', 'colorSecondary', 'underline', 'error', 'sizeSmall', 'multiline', 'fullWidth', 'input', 'inputSizeSmall', 'inputMultiline', 'inputTypeSearch']);
var _default = inputClasses;
exports.default = _default;