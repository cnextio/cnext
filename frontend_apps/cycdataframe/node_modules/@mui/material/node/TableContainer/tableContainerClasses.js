"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTableContainerUtilityClass = getTableContainerUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getTableContainerUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiTableContainer', slot);
}

const tableContainerClasses = (0, _core.generateUtilityClasses)('MuiTableContainer', ['root']);
var _default = tableContainerClasses;
exports.default = _default;