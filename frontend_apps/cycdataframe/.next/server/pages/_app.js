/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _styles_global_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../styles/global.css */ \"./styles/global.css\");\n/* harmony import */ var _styles_global_css__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_styles_global_css__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_styles_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/styles.css */ \"./styles/styles.css\");\n/* harmony import */ var _styles_styles_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_styles_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _styles_example_styles_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../styles/example-styles.css */ \"./styles/example-styles.css\");\n/* harmony import */ var _styles_example_styles_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_styles_example_styles_css__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var react_helmet__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-helmet */ \"react-helmet\");\n/* harmony import */ var react_helmet__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_helmet__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! prop-types */ \"prop-types\");\n/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var _mui_styles__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @mui/styles */ \"@mui/styles\");\n/* harmony import */ var _mui_styles__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_mui_styles__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var _mui_material_styles__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @mui/material/styles */ \"@mui/material/styles\");\n/* harmony import */ var _mui_material_styles__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_mui_material_styles__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! styled-components */ \"styled-components\");\n/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(styled_components__WEBPACK_IMPORTED_MODULE_8__);\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__);\nvar _jsxFileName = \"/Users/bachbui/works/auto_task/frontend_apps/cycdataframe/pages/_app.tsx\";\n\nfunction ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }\n\nfunction _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n\n\n // import \"./materialui/vendor/jvectormap.css\";\n// import \"./materialui/vendor/perfect-scrollbar.css\";\n// import \"react-dragula/dist/dragula.css\";\n\n\n\n // import DateFnsUtils from \"@date-io/date-fns\";\n\n\n // import { StylesProvider } from '@mui/styles';\n\n\nconst theme = (0,_mui_material_styles__WEBPACK_IMPORTED_MODULE_7__.createTheme)();\n\n\nconst GlobalStyle = (0,styled_components__WEBPACK_IMPORTED_MODULE_8__.createGlobalStyle)([\"body{height:100vh;margin:0;}\"]);\n\nfunction MyApp({\n  Component,\n  pageProps\n}) {\n  (0,react__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {\n    // Remove the server-side injected CSS.\n    const jssStyles = document.querySelector('#jss-server-side');\n    if (jssStyles) if (jssStyles.parentElement) jssStyles.parentElement.removeChild(jssStyles);\n  }, []);\n  return /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxDEV)((react__WEBPACK_IMPORTED_MODULE_4___default().Fragment), {\n    children: [/*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxDEV)(GlobalStyle, {}, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 41,\n      columnNumber: 11\n    }, this), /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxDEV)((react_helmet__WEBPACK_IMPORTED_MODULE_3___default()), {\n      titleTemplate: \"%s | CycAI\",\n      defaultTitle: \"CycAI\"\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 42,\n      columnNumber: 11\n    }, this), /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxDEV)(_mui_material_styles__WEBPACK_IMPORTED_MODULE_7__.StyledEngineProvider, {\n      injectFirst: true,\n      children: /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxDEV)(_mui_styles__WEBPACK_IMPORTED_MODULE_6__.ThemeProvider, {\n        theme: theme,\n        children: /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxDEV)(styled_components__WEBPACK_IMPORTED_MODULE_8__.ThemeProvider, {\n          theme: theme,\n          children: /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxDEV)(Component, _objectSpread({}, pageProps), void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 50,\n            columnNumber: 27\n          }, this)\n        }, void 0, false, {\n          fileName: _jsxFileName,\n          lineNumber: 49,\n          columnNumber: 23\n        }, this)\n      }, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 48,\n        columnNumber: 19\n      }, this)\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 46,\n      columnNumber: 11\n    }, this)]\n  }, void 0, true, {\n    fileName: _jsxFileName,\n    lineNumber: 40,\n    columnNumber: 7\n  }, this);\n}\n\nMyApp.propTypes = {\n  Component: (prop_types__WEBPACK_IMPORTED_MODULE_5___default().elementType.isRequired),\n  pageProps: (prop_types__WEBPACK_IMPORTED_MODULE_5___default().object.isRequired)\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLnRzeC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBO0FBQ0E7Q0FFQTtBQUNBO0FBQ0E7O0FBQ0E7QUFDQTtDQUdBOztBQUNBO0NBRUE7O0FBQ0E7QUFHQSxNQUFNUSxLQUFLLEdBQUlGLGlFQUFXLEVBQTFCO0FBRUE7O0FBRUEsTUFBTUksV0FBVyxHQUFHRCxvRUFBSCxrQ0FBakI7O0FBTUEsU0FBU0UsS0FBVCxDQUFlO0FBQUVDLEVBQUFBLFNBQUY7QUFBYUMsRUFBQUE7QUFBYixDQUFmLEVBQW1EO0FBQ2pEWCxFQUFBQSxnREFBUyxDQUFDLE1BQU07QUFDWjtBQUNBLFVBQU1ZLFNBQVMsR0FBR0MsUUFBUSxDQUFDQyxhQUFULENBQXVCLGtCQUF2QixDQUFsQjtBQUNBLFFBQUlGLFNBQUosRUFDRSxJQUFHQSxTQUFTLENBQUNHLGFBQWIsRUFDRUgsU0FBUyxDQUFDRyxhQUFWLENBQXdCQyxXQUF4QixDQUFvQ0osU0FBcEM7QUFDUCxHQU5RLEVBTU4sRUFOTSxDQUFUO0FBUUEsc0JBQ0ksOERBQUMsdURBQUQ7QUFBQSw0QkFDSSw4REFBQyxXQUFEO0FBQUE7QUFBQTtBQUFBO0FBQUEsWUFESixlQUVJLDhEQUFDLHFEQUFEO0FBQ0ksbUJBQWEsRUFBQyxZQURsQjtBQUVJLGtCQUFZLEVBQUM7QUFGakI7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQUZKLGVBTUksOERBQUMsc0VBQUQ7QUFBc0IsaUJBQVcsTUFBakM7QUFBQSw2QkFFUSw4REFBQyxzREFBRDtBQUFrQixhQUFLLEVBQUVOLEtBQXpCO0FBQUEsK0JBQ0ksOERBQUMsNERBQUQ7QUFBZSxlQUFLLEVBQUVBLEtBQXRCO0FBQUEsaUNBQ0ksOERBQUMsU0FBRCxvQkFBZUssU0FBZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBREo7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQURKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFGUjtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBTko7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBREo7QUFrQkQ7O0FBRURGLEtBQUssQ0FBQ1EsU0FBTixHQUFrQjtBQUNkUCxFQUFBQSxTQUFTLEVBQUVULDBFQURHO0FBRWRVLEVBQUFBLFNBQVMsRUFBRVYscUVBQTJCa0I7QUFGeEIsQ0FBbEI7QUFJQSxpRUFBZVYsS0FBZiIsInNvdXJjZXMiOlsid2VicGFjazovL2N5Y2RhdGFmcmFtZS8uL3BhZ2VzL19hcHAudHN4PzcyMTYiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBBcHBQcm9wcyB9IGZyb20gJ25leHQvYXBwJ1xuXG5pbXBvcnQgJy4uL3N0eWxlcy9nbG9iYWwuY3NzJ1xuaW1wb3J0IFwiLi4vc3R5bGVzL3N0eWxlcy5jc3NcIjtcbmltcG9ydCBcIi4uL3N0eWxlcy9leGFtcGxlLXN0eWxlcy5jc3NcIjtcbi8vIGltcG9ydCBcIi4vbWF0ZXJpYWx1aS92ZW5kb3IvanZlY3Rvcm1hcC5jc3NcIjtcbi8vIGltcG9ydCBcIi4vbWF0ZXJpYWx1aS92ZW5kb3IvcGVyZmVjdC1zY3JvbGxiYXIuY3NzXCI7XG4vLyBpbXBvcnQgXCJyZWFjdC1kcmFndWxhL2Rpc3QvZHJhZ3VsYS5jc3NcIjtcbmltcG9ydCBIZWxtZXQgZnJvbSAncmVhY3QtaGVsbWV0JztcbmltcG9ydCBSZWFjdCwge3VzZUVmZmVjdH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcblxuLy8gaW1wb3J0IERhdGVGbnNVdGlscyBmcm9tIFwiQGRhdGUtaW8vZGF0ZS1mbnNcIjtcbmltcG9ydCB7IFRoZW1lUHJvdmlkZXIgYXMgTXVpVGhlbWVQcm92aWRlcn0gZnJvbSAnQG11aS9zdHlsZXMnO1xuaW1wb3J0IHsgY3JlYXRlVGhlbWUsIFN0eWxlZEVuZ2luZVByb3ZpZGVyIH0gZnJvbSAnQG11aS9tYXRlcmlhbC9zdHlsZXMnO1xuLy8gaW1wb3J0IHsgU3R5bGVzUHJvdmlkZXIgfSBmcm9tICdAbXVpL3N0eWxlcyc7XG5pbXBvcnQge1RoZW1lUHJvdmlkZXJ9IGZyb20gXCJzdHlsZWQtY29tcG9uZW50c1wiO1xuaW1wb3J0IG1hVGhlbWUgZnJvbSBcIi4uL3RoZW1lXCI7XG5cbmNvbnN0IHRoZW1lID0gIGNyZWF0ZVRoZW1lKCk7XG5cbmltcG9ydCB7IGNyZWF0ZUdsb2JhbFN0eWxlIH0gZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnXG5cbmNvbnN0IEdsb2JhbFN0eWxlID0gY3JlYXRlR2xvYmFsU3R5bGVgXG4gIGJvZHkge1xuICAgIGhlaWdodDogMTAwdmg7XG4gICAgbWFyZ2luOjA7XG4gIH1gXG5cbmZ1bmN0aW9uIE15QXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfTogQXBwUHJvcHMpIHtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgIC8vIFJlbW92ZSB0aGUgc2VydmVyLXNpZGUgaW5qZWN0ZWQgQ1NTLlxuICAgICAgY29uc3QganNzU3R5bGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2pzcy1zZXJ2ZXItc2lkZScpO1xuICAgICAgaWYgKGpzc1N0eWxlcylcbiAgICAgICAgaWYoanNzU3R5bGVzLnBhcmVudEVsZW1lbnQpXG4gICAgICAgICAganNzU3R5bGVzLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoanNzU3R5bGVzKTtcbiAgfSwgW10pOyBcblxuICByZXR1cm4gKFxuICAgICAgPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgIDxHbG9iYWxTdHlsZSAvPlxuICAgICAgICAgIDxIZWxtZXRcbiAgICAgICAgICAgICAgdGl0bGVUZW1wbGF0ZT1cIiVzIHwgQ3ljQUlcIlxuICAgICAgICAgICAgICBkZWZhdWx0VGl0bGU9XCJDeWNBSVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8U3R5bGVkRW5naW5lUHJvdmlkZXIgaW5qZWN0Rmlyc3Q+XG4gICAgICAgICAgICAgIHsvKiA8TXVpUGlja2Vyc1V0aWxzUHJvdmlkZXIgdXRpbHM9e0RhdGVGbnNVdGlsc30+ICovfVxuICAgICAgICAgICAgICAgICAgPE11aVRoZW1lUHJvdmlkZXIgdGhlbWU9e3RoZW1lfT5cbiAgICAgICAgICAgICAgICAgICAgICA8VGhlbWVQcm92aWRlciB0aGVtZT17dGhlbWV9PiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfS8+XG4gICAgICAgICAgICAgICAgICAgICAgPC9UaGVtZVByb3ZpZGVyPlxuICAgICAgICAgICAgICAgICAgPC9NdWlUaGVtZVByb3ZpZGVyPlxuICAgICAgICAgICAgICB7LyogPC9NdWlQaWNrZXJzVXRpbHNQcm92aWRlcj4gKi99XG4gICAgICAgICAgPC9TdHlsZWRFbmdpbmVQcm92aWRlcj5cbiAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICk7XG59XG5cbk15QXBwLnByb3BUeXBlcyA9IHtcbiAgICBDb21wb25lbnQ6IFByb3BUeXBlcy5lbGVtZW50VHlwZS5pc1JlcXVpcmVkLFxuICAgIHBhZ2VQcm9wczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxufTtcbmV4cG9ydCBkZWZhdWx0IE15QXBwXG4iXSwibmFtZXMiOlsiSGVsbWV0IiwiUmVhY3QiLCJ1c2VFZmZlY3QiLCJQcm9wVHlwZXMiLCJUaGVtZVByb3ZpZGVyIiwiTXVpVGhlbWVQcm92aWRlciIsImNyZWF0ZVRoZW1lIiwiU3R5bGVkRW5naW5lUHJvdmlkZXIiLCJ0aGVtZSIsImNyZWF0ZUdsb2JhbFN0eWxlIiwiR2xvYmFsU3R5bGUiLCJNeUFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyIsImpzc1N0eWxlcyIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsInBhcmVudEVsZW1lbnQiLCJyZW1vdmVDaGlsZCIsInByb3BUeXBlcyIsImVsZW1lbnRUeXBlIiwiaXNSZXF1aXJlZCIsIm9iamVjdCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/_app.tsx\n");

/***/ }),

/***/ "./styles/example-styles.css":
/*!***********************************!*\
  !*** ./styles/example-styles.css ***!
  \***********************************/
/***/ (() => {



/***/ }),

/***/ "./styles/global.css":
/*!***************************!*\
  !*** ./styles/global.css ***!
  \***************************/
/***/ (() => {



/***/ }),

/***/ "./styles/styles.css":
/*!***************************!*\
  !*** ./styles/styles.css ***!
  \***************************/
/***/ (() => {



/***/ }),

/***/ "@mui/material/styles":
/*!***************************************!*\
  !*** external "@mui/material/styles" ***!
  \***************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@mui/material/styles");

/***/ }),

/***/ "@mui/styles":
/*!******************************!*\
  !*** external "@mui/styles" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("@mui/styles");

/***/ }),

/***/ "prop-types":
/*!*****************************!*\
  !*** external "prop-types" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = require("prop-types");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-helmet":
/*!*******************************!*\
  !*** external "react-helmet" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-helmet");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "styled-components":
/*!************************************!*\
  !*** external "styled-components" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("styled-components");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./pages/_app.tsx"));
module.exports = __webpack_exports__;

})();