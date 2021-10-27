"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getButtonBaseUtilityClass = getButtonBaseUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getButtonBaseUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiButtonBase', slot);
}

const buttonBaseClasses = (0, _core.generateUtilityClasses)('MuiButtonBase', ['root', 'disabled', 'focusVisible']);
var _default = buttonBaseClasses;
exports.default = _default;