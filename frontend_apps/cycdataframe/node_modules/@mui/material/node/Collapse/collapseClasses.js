"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCollapseUtilityClass = getCollapseUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getCollapseUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiCollapse', slot);
}

const collapseClasses = (0, _core.generateUtilityClasses)('MuiCollapse', ['root', 'horizontal', 'vertical', 'entered', 'hidden', 'wrapper', 'wrapperInner']);
var _default = collapseClasses;
exports.default = _default;