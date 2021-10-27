"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTextFieldUtilityClass = getTextFieldUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getTextFieldUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiTextField', slot);
}

const textFieldClasses = (0, _core.generateUtilityClasses)('MuiTextField', ['root']);
var _default = textFieldClasses;
exports.default = _default;