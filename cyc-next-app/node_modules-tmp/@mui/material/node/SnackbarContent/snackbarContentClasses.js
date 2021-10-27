"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSnackbarContentUtilityClass = getSnackbarContentUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getSnackbarContentUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiSnackbarContent', slot);
}

const snackbarContentClasses = (0, _core.generateUtilityClasses)('MuiSnackbarContent', ['root', 'message', 'action']);
var _default = snackbarContentClasses;
exports.default = _default;