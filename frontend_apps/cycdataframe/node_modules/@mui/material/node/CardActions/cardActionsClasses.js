"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCardActionsUtilityClass = getCardActionsUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getCardActionsUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiCardActions', slot);
}

const cardActionsClasses = (0, _core.generateUtilityClasses)('MuiCardActions', ['root', 'spacing']);
var _default = cardActionsClasses;
exports.default = _default;