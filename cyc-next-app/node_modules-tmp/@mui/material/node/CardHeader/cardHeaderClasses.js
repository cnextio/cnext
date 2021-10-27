"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCardHeaderUtilityClass = getCardHeaderUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getCardHeaderUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiCardHeader', slot);
}

const cardHeaderClasses = (0, _core.generateUtilityClasses)('MuiCardHeader', ['root', 'avatar', 'action', 'content', 'title', 'subheader']);
var _default = cardHeaderClasses;
exports.default = _default;