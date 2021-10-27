"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSpeedDialIconUtilityClass = getSpeedDialIconUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getSpeedDialIconUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiSpeedDialIcon', slot);
}

const speedDialIconClasses = (0, _core.generateUtilityClasses)('MuiSpeedDialIcon', ['root', 'icon', 'iconOpen', 'iconWithOpenIconOpen', 'openIcon', 'openIconOpen']);
var _default = speedDialIconClasses;
exports.default = _default;