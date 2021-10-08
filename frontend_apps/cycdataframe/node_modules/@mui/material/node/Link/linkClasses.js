"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLinkUtilityClass = getLinkUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getLinkUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiLink', slot);
}

const linkClasses = (0, _core.generateUtilityClasses)('MuiLink', ['root', 'underlineNone', 'underlineHover', 'underlineAlways', 'button', 'focusVisible']);
var _default = linkClasses;
exports.default = _default;