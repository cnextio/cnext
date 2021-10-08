"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDialogContentUtilityClass = getDialogContentUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getDialogContentUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiDialogContent', slot);
}

const dialogContentClasses = (0, _core.generateUtilityClasses)('MuiDialogContent', ['root', 'dividers']);
var _default = dialogContentClasses;
exports.default = _default;