"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStepConnectorUtilityClass = getStepConnectorUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getStepConnectorUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiStepConnector', slot);
}

const stepConnectorClasses = (0, _core.generateUtilityClasses)('MuiStepConnector', ['root', 'horizontal', 'vertical', 'alternativeLabel', 'active', 'completed', 'disabled', 'line', 'lineHorizontal', 'lineVertical']);
var _default = stepConnectorClasses;
exports.default = _default;