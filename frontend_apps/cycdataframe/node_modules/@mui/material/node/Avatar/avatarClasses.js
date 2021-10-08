"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAvatarUtilityClass = getAvatarUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getAvatarUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiAvatar', slot);
}

const avatarClasses = (0, _core.generateUtilityClasses)('MuiAvatar', ['root', 'colorDefault', 'circular', 'rounded', 'square', 'img', 'fallback']);
var _default = avatarClasses;
exports.default = _default;