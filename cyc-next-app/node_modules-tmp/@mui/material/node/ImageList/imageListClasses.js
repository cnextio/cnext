"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getImageListUtilityClass = getImageListUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getImageListUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiImageList', slot);
}

const imageListClasses = (0, _core.generateUtilityClasses)('MuiImageList', ['root', 'masonry', 'quilted', 'standard', 'woven']);
var _default = imageListClasses;
exports.default = _default;