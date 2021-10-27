"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSpeedDialActionUtilityClass = getSpeedDialActionUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getSpeedDialActionUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiSpeedDialAction', slot);
}

const speedDialActionClasses = (0, _core.generateUtilityClasses)('MuiSpeedDialAction', ['fab', 'fabClosed', 'staticTooltip', 'staticTooltipClosed', 'staticTooltipLabel', 'tooltipPlacementLeft', 'tooltipPlacementRight']);
var _default = speedDialActionClasses;
exports.default = _default;