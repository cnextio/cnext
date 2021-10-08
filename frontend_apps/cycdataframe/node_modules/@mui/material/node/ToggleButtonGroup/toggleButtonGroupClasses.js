"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getToggleButtonGroupUtilityClass = getToggleButtonGroupUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getToggleButtonGroupUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiToggleButtonGroup', slot);
}

const toggleButtonGroupClasses = (0, _core.generateUtilityClasses)('MuiToggleButtonGroup', ['root', 'selected', 'vertical', 'disabled', 'grouped', 'groupedHorizontal', 'groupedVertical']);
var _default = toggleButtonGroupClasses;
exports.default = _default;