"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTableSortLabelUtilityClass = getTableSortLabelUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getTableSortLabelUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiTableSortLabel', slot);
}

const tableSortLabelClasses = (0, _core.generateUtilityClasses)('MuiTableSortLabel', ['root', 'active', 'icon', 'iconDirectionDesc', 'iconDirectionAsc']);
var _default = tableSortLabelClasses;
exports.default = _default;