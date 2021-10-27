"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSwitchBaseUtilityClass = getSwitchBaseUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getSwitchBaseUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('PrivateSwitchBase', slot);
}

const switchBaseClasses = (0, _core.generateUtilityClasses)('PrivateSwitchBase', ['root', 'checked', 'disabled', 'input', 'edgeStart', 'edgeEnd']);
var _default = switchBaseClasses;
exports.default = _default;