"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getListUtilityClass = getListUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getListUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiList', slot);
}

const listClasses = (0, _core.generateUtilityClasses)('MuiList', ['root', 'padding', 'dense', 'subheader']);
var _default = listClasses;
exports.default = _default;