"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPopoverUtilityClass = getPopoverUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getPopoverUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiPopover', slot);
}

const popoverClasses = (0, _core.generateUtilityClasses)('MuiPopover', ['root', 'paper']);
var _default = popoverClasses;
exports.default = _default;