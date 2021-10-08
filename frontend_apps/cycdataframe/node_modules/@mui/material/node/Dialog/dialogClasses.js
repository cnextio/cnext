"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDialogUtilityClass = getDialogUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getDialogUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiDialog', slot);
}

const dialogClasses = (0, _core.generateUtilityClasses)('MuiDialog', ['root', 'scrollPaper', 'scrollBody', 'container', 'paper', 'paperScrollPaper', 'paperScrollBody', 'paperWidthFalse', 'paperWidthXs', 'paperWidthSm', 'paperWidthMd', 'paperWidthLg', 'paperWidthXl', 'paperFullWidth', 'paperFullScreen']);
var _default = dialogClasses;
exports.default = _default;