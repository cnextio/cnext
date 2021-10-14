import { Extension } from '@codemirror/state';
import { HighlightStyle } from '@codemirror/highlight';

/**
The editor theme styles for One Dark.
*/
declare const oneDarkTheme: Extension;
/**
The highlighting style for code in the One Dark theme.
*/
declare const oneDarkHighlightStyle: HighlightStyle;
/**
Extension to enable the One Dark theme (both the editor theme and
the highlight style).
*/
declare const oneDark: Extension;

export { oneDark, oneDarkHighlightStyle, oneDarkTheme };
