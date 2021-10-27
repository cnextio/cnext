"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSpeedDialUtilityClass = getSpeedDialUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getSpeedDialUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiSpeedDial', slot);
}

const speedDialClasses = (0, _core.generateUtilityClasses)('MuiSpeedDial', ['root', 'fab', 'directionUp', 'directionDown', 'directionLeft', 'directionRight', 'actions', 'actionsClosed']);
var _default = speedDialClasses;
exports.default = _default;