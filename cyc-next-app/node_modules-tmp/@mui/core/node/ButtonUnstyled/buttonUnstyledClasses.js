"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getButtonUnstyledUtilityClass = getButtonUnstyledUtilityClass;
exports.default = void 0;

var _generateUtilityClass = _interopRequireDefault(require("../generateUtilityClass"));

var _generateUtilityClasses = _interopRequireDefault(require("../generateUtilityClasses"));

function getButtonUnstyledUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('ButtonUnstyled', slot);
}

const buttonUnstyledClasses = (0, _generateUtilityClasses.default)('ButtonUnstyled', ['root', 'active', 'disabled', 'focusVisible']);
var _default = buttonUnstyledClasses;
exports.default = _default;