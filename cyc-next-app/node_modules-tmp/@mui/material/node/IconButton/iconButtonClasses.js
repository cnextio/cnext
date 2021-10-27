"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getIconButtonUtilityClass = getIconButtonUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getIconButtonUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiIconButton', slot);
}

const iconButtonClasses = (0, _core.generateUtilityClasses)('MuiIconButton', ['root', 'disabled', 'colorInherit', 'colorPrimary', 'colorSecondary', 'edgeStart', 'edgeEnd', 'sizeSmall', 'sizeMedium', 'sizeLarge']);
var _default = iconButtonClasses;
exports.default = _default;