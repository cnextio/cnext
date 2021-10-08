"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAccordionDetailsUtilityClass = getAccordionDetailsUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getAccordionDetailsUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiAccordionDetails', slot);
}

const accordionDetailsClasses = (0, _core.generateUtilityClasses)('MuiAccordionDetails', ['root']);
var _default = accordionDetailsClasses;
exports.default = _default;