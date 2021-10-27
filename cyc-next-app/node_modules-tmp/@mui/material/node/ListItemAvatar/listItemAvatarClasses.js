"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getListItemAvatarUtilityClass = getListItemAvatarUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getListItemAvatarUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiListItemAvatar', slot);
}

const listItemAvatarClasses = (0, _core.generateUtilityClasses)('MuiListItemAvatar', ['root', 'alignItemsFlexStart']);
var _default = listItemAvatarClasses;
exports.default = _default;