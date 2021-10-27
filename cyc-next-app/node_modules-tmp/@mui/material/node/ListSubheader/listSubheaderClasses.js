"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getListSubheaderUtilityClass = getListSubheaderUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getListSubheaderUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiListSubheader', slot);
}

const listSubheaderClasses = (0, _core.generateUtilityClasses)('MuiListSubheader', ['root', 'colorPrimary', 'colorInherit', 'gutters', 'inset', 'sticky']);
var _default = listSubheaderClasses;
exports.default = _default;