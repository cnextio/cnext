"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTableFooterUtilityClass = getTableFooterUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getTableFooterUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiTableFooter', slot);
}

const tableFooterClasses = (0, _core.generateUtilityClasses)('MuiTableFooter', ['root']);
var _default = tableFooterClasses;
exports.default = _default;