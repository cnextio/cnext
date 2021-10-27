"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBreadcrumbsUtilityClass = getBreadcrumbsUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getBreadcrumbsUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiBreadcrumbs', slot);
}

const breadcrumbsClasses = (0, _core.generateUtilityClasses)('MuiBreadcrumbs', ['root', 'ol', 'li', 'separator']);
var _default = breadcrumbsClasses;
exports.default = _default;