"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCheckboxUtilityClass = getCheckboxUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getCheckboxUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiCheckbox', slot);
}

const checkboxClasses = (0, _core.generateUtilityClasses)('MuiCheckbox', ['root', 'checked', 'disabled', 'indeterminate', 'colorPrimary', 'colorSecondary']);
var _default = checkboxClasses;
exports.default = _default;