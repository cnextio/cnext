"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCardMediaUtilityClass = getCardMediaUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getCardMediaUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiCardMedia', slot);
}

const cardMediaClasses = (0, _core.generateUtilityClasses)('MuiCardMedia', ['root', 'media', 'img']);
var _default = cardMediaClasses;
exports.default = _default;