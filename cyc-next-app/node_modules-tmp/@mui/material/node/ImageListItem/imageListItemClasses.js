"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getImageListItemUtilityClass = getImageListItemUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getImageListItemUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiImageListItem', slot);
}

const imageListItemClasses = (0, _core.generateUtilityClasses)('MuiImageListItem', ['root', 'img', 'standard', 'woven', 'masonry', 'quilted']);
var _default = imageListItemClasses;
exports.default = _default;