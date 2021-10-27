"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDialogContentTextUtilityClass = getDialogContentTextUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getDialogContentTextUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiDialogContentText', slot);
}

const dialogContentTextClasses = (0, _core.generateUtilityClasses)('MuiDialogContentText', ['root']);
var _default = dialogContentTextClasses;
exports.default = _default;