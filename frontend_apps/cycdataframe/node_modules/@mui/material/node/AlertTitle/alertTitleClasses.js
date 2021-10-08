"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAlertTitleUtilityClass = getAlertTitleUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getAlertTitleUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiAlertTitle', slot);
}

const alertTitleClasses = (0, _core.generateUtilityClasses)('MuiAlertTitle', ['root']);
var _default = alertTitleClasses;
exports.default = _default;