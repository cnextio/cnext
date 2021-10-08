"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getImageListItemBarUtilityClass = getImageListItemBarUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getImageListItemBarUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiImageListItemBar', slot);
}

const imageListItemBarClasses = (0, _core.generateUtilityClasses)('MuiImageListItemBar', ['root', 'positionBottom', 'positionTop', 'positionBelow', 'titleWrap', 'titleWrapBottom', 'titleWrapTop', 'titleWrapBelow', 'titleWrapActionPosLeft', 'titleWrapActionPosRight', 'title', 'subtitle', 'actionIcon', 'actionIconActionPosLeft', 'actionIconActionPosRight']);
var _default = imageListItemBarClasses;
exports.default = _default;