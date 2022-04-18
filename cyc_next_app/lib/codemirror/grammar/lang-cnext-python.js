import { parser } from './cnext-python';
import {
    LRLanguage,
    indentNodeProp,
    continuedIndent,
    foldNodeProp,
    foldInside,
    LanguageSupport,
} from '@codemirror/language';
import { styleTags, tags } from '@codemirror/highlight';
import { snippetCompletion, ifNotIn, completeFromList } from '@codemirror/autocomplete';
/// A collection of Python-related
/// [snippets](#autocomplete.snippet).
const snippets = [
    snippetCompletion(
        'def ${function_name}(${args}):\n\t"""Docstring here"""\n\treturn "something"\n',
        {
            label: 'def',
            detail: 'definition',
            type: 'keyword',
        }
    ),
    snippetCompletion('for ${item} in ${list}:\n\tprint(${item})\n', {
        label: 'for',
        detail: 'loop',
        type: 'keyword',
    }),
    snippetCompletion('try:\n\t${#Execute Code Block}\nexcept Exception as e:\n\tprint(str(e))\n', {
        label: 'try',
        detail: 'block',
        type: 'keyword',
    }),
    snippetCompletion(
        'class ${name}:\n\t"""Class docstring"""\n\tdef __init__(self, something):\n\t\tself.something = something\n\n\tdef ${function_name}(${args}):\n\t\treturn "something"\n\n',
        {
            label: 'class',
            detail: 'definition',
            type: 'keyword',
        }
    ),
    snippetCompletion('import ${module}\n', {
        label: 'import',
        detail: 'module',
        type: 'keyword',
    }),
    snippetCompletion('from ${module} import ${sub_module}\n', {
        label: 'from',
        detail: 'import',
        type: 'keyword',
    }),
];

/// A language provider based on the [Lezer Python
/// parser](https://github.com/lezer-parser/python), extended with
/// highlighting and indentation information.
const pythonLanguage = LRLanguage.define({
    parser: parser.configure({
        props: [
            indentNodeProp.add({
                Body: continuedIndent(),
            }),
            foldNodeProp.add({
                'Body ArrayExpression DictionaryExpression': foldInside,
            }),
            styleTags({
                "async '*' '**' FormatConversion": tags.modifier,
                'for while if elif else try except finally return raise break continue with pass assert await yield':
                    tags.controlKeyword,
                'in not and or is del': tags.operatorKeyword,
                'import from def class global nonlocal lambda': tags.definitionKeyword,
                'with as print': tags.keyword,
                self: tags.self,
                Boolean: tags.bool,
                None: tags.null,
                VariableName: tags.variableName,
                'CallExpression/VariableName': tags.function(tags.variableName),
                'FunctionDefinition/VariableName': tags.function(
                    tags.definition(tags.variableName)
                ),
                'ClassDefinition/VariableName': tags.definition(tags.className),
                PropertyName: tags.propertyName,
                'CallExpression/MemberExpression/ProperyName': tags.function(tags.propertyName),
                Comment: tags.lineComment,
                CNextStarter: tags.definitionKeyword,
                CNextPlotKeyword: tags.definitionKeyword,
                CNextDataFrameExpresion: tags.string,
                CNextXDimColumnNameExpression: tags.string,
                CNextYDimColumnNameExpression: tags.string,
                'over vs against': tags.definitionKeyword,
                Number: tags.number,
                String: tags.string,
                FormatString: tags.special(tags.string),
                UpdateOp: tags.updateOperator,
                ArithOp: tags.arithmeticOperator,
                BitOp: tags.bitwiseOperator,
                CompareOp: tags.compareOperator,
                AssignOp: tags.definitionOperator,
                Ellipsis: tags.punctuation,
                At: tags.meta,
                '( )': tags.paren,
                '[ ]': tags.squareBracket,
                '{ }': tags.brace,
                '.': tags.derefOperator,
                ', ;': tags.separator,
            }),
        ],
    }),
    languageData: {
        closeBrackets: { brackets: ['(', '[', '{', "'", '"', "'''", '"""'] },
        commentTokens: { line: '#' },
        indentOnInput: /^\s*[\}\]\)]$/,
    },
});
/// Python language support.
function python() {
    return new LanguageSupport(
        pythonLanguage,
        pythonLanguage.data.of({
            // autocomplete: ifNotIn(["Comment", "String"], completeFromList(snippets))
        })
    );
}

export { python, pythonLanguage, snippets };
