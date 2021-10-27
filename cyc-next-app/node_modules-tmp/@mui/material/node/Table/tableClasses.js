"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTableUtilityClass = getTableUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getTableUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiTable', slot);
}

const tableClasses = (0, _core.generateUtilityClasses)('MuiTable', ['root', 'stickyHeader']);
var _default = tableClasses;
exports.default = _default;