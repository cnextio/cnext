"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSwitchUtilityClass = getSwitchUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getSwitchUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiSwitch', slot);
}

const switchClasses = (0, _core.generateUtilityClasses)('MuiSwitch', ['root', 'edgeStart', 'edgeEnd', 'switchBase', 'colorPrimary', 'colorSecondary', 'sizeSmall', 'sizeMedium', 'checked', 'disabled', 'input', 'thumb', 'track']);
var _default = switchClasses;
exports.default = _default;