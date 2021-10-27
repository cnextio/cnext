"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFormControlLabelUtilityClasses = getFormControlLabelUtilityClasses;
exports.default = void 0;

var _core = require("@mui/core");

function getFormControlLabelUtilityClasses(slot) {
  return (0, _core.generateUtilityClass)('MuiFormControlLabel', slot);
}

const formControlLabelClasses = (0, _core.generateUtilityClasses)('MuiFormControlLabel', ['root', 'labelPlacementStart', 'labelPlacementTop', 'labelPlacementBottom', 'disabled', 'label']);
var _default = formControlLabelClasses;
exports.default = _default;