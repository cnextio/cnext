"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getToggleButtonUtilityClass = getToggleButtonUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getToggleButtonUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiToggleButton', slot);
}

const toggleButtonClasses = (0, _core.generateUtilityClasses)('MuiToggleButton', ['root', 'disabled', 'selected', 'standard', 'primary', 'secondary', 'sizeSmall', 'sizeMedium', 'sizeLarge']);
var _default = toggleButtonClasses;
exports.default = _default;