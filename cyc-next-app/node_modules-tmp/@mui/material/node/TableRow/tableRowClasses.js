"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTableRowUtilityClass = getTableRowUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getTableRowUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiTableRow', slot);
}

const tableRowClasses = (0, _core.generateUtilityClasses)('MuiTableRow', ['root', 'selected', 'hover', 'head', 'footer']);
var _default = tableRowClasses;
exports.default = _default;