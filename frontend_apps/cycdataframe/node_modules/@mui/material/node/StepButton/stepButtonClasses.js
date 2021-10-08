"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStepButtonUtilityClass = getStepButtonUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getStepButtonUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiStepButton', slot);
}

const stepButtonClasses = (0, _core.generateUtilityClasses)('MuiStepButton', ['root', 'horizontal', 'vertical', 'touchRipple']);
var _default = stepButtonClasses;
exports.default = _default;