"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStepperUtilityClass = getStepperUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getStepperUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiStepper', slot);
}

const stepperClasses = (0, _core.generateUtilityClasses)('MuiStepper', ['root', 'horizontal', 'vertical', 'alternativeLabel']);
var _default = stepperClasses;
exports.default = _default;