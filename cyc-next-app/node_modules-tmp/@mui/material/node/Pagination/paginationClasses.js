"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPaginationUtilityClass = getPaginationUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getPaginationUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiPagination', slot);
}

const paginationClasses = (0, _core.generateUtilityClasses)('MuiPagination', ['root', 'ul', 'outlined', 'text']);
var _default = paginationClasses;
exports.default = _default;