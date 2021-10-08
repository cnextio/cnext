"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTabsUtilityClass = getTabsUtilityClass;
exports.default = void 0;

var _core = require("@mui/core");

function getTabsUtilityClass(slot) {
  return (0, _core.generateUtilityClass)('MuiTabs', slot);
}

const tabsClasses = (0, _core.generateUtilityClasses)('MuiTabs', ['root', 'vertical', 'flexContainer', 'flexContainerVertical', 'centered', 'scroller', 'fixed', 'scrollableX', 'scrollableY', 'hideScrollbar', 'scrollButtons', 'scrollButtonsHideMobile', 'indicator']);
var _default = tabsClasses;
exports.default = _default;