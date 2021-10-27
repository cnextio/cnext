"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getListItemButtonUtilityClass = getListItemButtonUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getListItemButtonUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiListItemButton', slot);
}

const listItemButtonClasses = (0, _core.generateUtilityClasses)('MuiListItemButton', ['root', 'focusVisible', 'dense', 'alignItemsFlexStart', 'disabled', 'divider', 'gutters', 'selected']);
var _default = listItemButtonClasses;
exports.default = _default;