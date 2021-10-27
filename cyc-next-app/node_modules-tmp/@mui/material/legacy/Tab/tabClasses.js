import { generateUtilityClass, generateUtilityClasses } from '@mui/core';
export function getTabUtilityClass(slot) {
  return generateUtilityClass('MuiTab', slot);
}
var tabClasses = generateUtilityClasses('MuiTab', ['root', 'labelIcon', 'textColorInherit', 'textColorPrimary', 'textColorSecondary', 'selected', 'disabled', 'fullWidth', 'wrapped']);
export default tabClasses;