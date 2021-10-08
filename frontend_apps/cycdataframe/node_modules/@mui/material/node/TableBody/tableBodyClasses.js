"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTableBodyUtilityClass = getTableBodyUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getTableBodyUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiTableBody', slot);
}

const tableBodyClasses = (0, _core.generateUtilityClasses)('MuiTableBody', ['root']);
var _default = tableBodyClasses;
exports.default = _default;