import { LRLanguage, LanguageSupport } from '@codemirror/language';

/**
A language provider based on the [Lezer Python
parser](https://github.com/lezer-parser/python), extended with
highlighting and indentation information.
*/
declare const pythonLanguage: LRLanguage;
/**
Python language support.
*/
declare function python(): LanguageSupport;

export { python, pythonLanguage };
