"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getListItemTextUtilityClass = getListItemTextUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getListItemTextUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiListItemText', slot);
}

const listItemTextClasses = (0, _core.generateUtilityClasses)('MuiListItemText', ['root', 'multiline', 'dense', 'inset', 'primary', 'secondary']);
var _default = listItemTextClasses;
exports.default = _default;