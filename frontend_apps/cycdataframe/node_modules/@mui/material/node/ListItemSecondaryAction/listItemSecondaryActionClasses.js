"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getListItemSecondaryActionClassesUtilityClass = getListItemSecondaryActionClassesUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getListItemSecondaryActionClassesUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiListItemSecondaryAction', slot);
}

const listItemSecondaryActionClasses = (0, _core.generateUtilityClasses)('MuiListItemSecondaryAction', ['root', 'disableGutters']);
var _default = listItemSecondaryActionClasses;
exports.default = _default;