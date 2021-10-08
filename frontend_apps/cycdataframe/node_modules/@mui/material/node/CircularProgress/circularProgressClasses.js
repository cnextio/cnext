"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCircularProgressUtilityClass = getCircularProgressUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getCircularProgressUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiCircularProgress', slot);
}

const circularProgressClasses = (0, _core.generateUtilityClasses)('MuiCircularProgress', ['root', 'determinate', 'indeterminate', 'colorPrimary', 'colorSecondary', 'svg', 'circle', 'circleDeterminate', 'circleIndeterminate', 'circleDisableShrink']);
var _default = circularProgressClasses;
exports.default = _default;