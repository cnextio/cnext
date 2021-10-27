"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBottomNavigationUtilityClass = getBottomNavigationUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getBottomNavigationUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiBottomNavigation', slot);
}

const bottomNavigationClasses = (0, _core.generateUtilityClasses)('MuiBottomNavigation', ['root']);
var _default = bottomNavigationClasses;
exports.default = _default;