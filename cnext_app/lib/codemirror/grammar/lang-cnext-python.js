import { parser } from './cnext-python';
// import { parser } from "@lezer/python";
import {
    LRLanguage,
    indentNodeProp,
    delimitedIndent,
    foldNodeProp,
    foldInside,
    LanguageSupport,
} from "@codemirror/language";
import { styleTags, tags } from "@lezer/highlight";
import { snippetCompletion, ifNotIn, completeFromList } from "@codemirror/autocomplete";

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

function indentBody(context, node) {
    let base = context.lineIndent(node.from);
    let line = context.lineAt(context.pos, -1),
        to = line.from + line.text.length;
    // Don't consider blank, deindented lines at the end of the
    // block part of the block
    if (
        !/\S/.test(line.text) &&
        context.node.to < to + 100 &&
        !/\S/.test(context.state.sliceDoc(to, context.node.to)) &&
        context.lineIndent(context.pos, -1) <= base
    )
        return null;
    // A normally deindenting keyword that appears at a higher
    // indentation than the block should probably be handled by the next
    // level
    if (
        /^\s*(else:|elif |except |finally:)/.test(context.textAfter) &&
        context.lineIndent(context.pos, -1) > base
    )
        return null;
    return base + context.unit;
}

/// A language provider based on the [Lezer Python
/// parser](https://github.com/lezer-parser/python), extended with
/// highlighting and indentation information.
const pythonLanguage = LRLanguage.define({
    parser: parser.configure({
        props: [
            indentNodeProp.add({
                Body: (context) => {
                    var _a;
                    return (_a = indentBody(context, context.node)) !== null && _a !== void 0
                        ? _a
                        : context.continue();
                },
                IfStatement: (cx) =>
                    /^\s*(else:|elif )/.test(cx.textAfter) ? cx.baseIndent : cx.continue(),
                TryStatement: (cx) =>
                    /^\s*(except |finally:)/.test(cx.textAfter) ? cx.baseIndent : cx.continue(),
                "TupleExpression ComprehensionExpression ParamList ArgList ParenthesizedExpression":
                    /*@__PURE__*/ delimitedIndent({ closing: ")" }),
                "DictionaryExpression DictionaryComprehensionExpression SetExpression SetComprehensionExpression":
                    /*@__PURE__*/ delimitedIndent({ closing: "}" }),
                "ArrayExpression ArrayComprehensionExpression": /*@__PURE__*/ delimitedIndent({
                    closing: "]",
                }),
                Script: (context) => {
                    if (context.pos + /\s*/.exec(context.textAfter)[0].length >= context.node.to) {
                        let endBody = null;
                        for (let cur = context.node, to = cur.to; ; ) {
                            cur = cur.lastChild;
                            if (!cur || cur.to != to) break;
                            if (cur.type.name == "Body") endBody = cur;
                        }
                        if (endBody) {
                            let bodyIndent = indentBody(context, endBody);
                            if (bodyIndent != null) return bodyIndent;
                        }
                    }
                    return context.continue();
                },
            }),
            foldNodeProp.add({
                "Body ArrayExpression DictionaryExpression": foldInside,
            }),
            // styleTags({
            //     "async '*' '**' FormatConversion": tags.modifier,
            //     "for while if elif else try except finally return raise break continue with pass assert await yield":
            //         tags.controlKeyword,
            //     "in not and or is del": tags.operatorKeyword,
            //     "import from def class global nonlocal lambda": tags.definitionKeyword,
            //     "with as print": tags.keyword,
            //     self: tags.self,
            //     Boolean: tags.bool,
            //     None: tags.null,
            //     VariableName: tags.variableName,
            //     "CallExpression/VariableName": tags.function(tags.variableName),
            //     "FunctionDefinition/VariableName": tags.function(
            //         tags.definition(tags.variableName)
            //     ),
            //     "ClassDefinition/VariableName": tags.definition(tags.className),
            //     PropertyName: tags.propertyName,
            //     "CallExpression/MemberExpression/ProperyName": tags.function(tags.propertyName),
            //     Comment: tags.lineComment,
            //     CNextStarter: tags.definitionKeyword,
            //     CNextPlotKeyword: tags.definitionKeyword,
            //     CNextDataFrameExpresion: tags.string,
            //     CNextXDimColumnNameExpression: tags.string,
            //     CNextYDimColumnNameExpression: tags.string,
            //     "over vs against": tags.definitionKeyword,
            //     Number: tags.number,
            //     String: tags.string,
            //     FormatString: tags.special(tags.string),
            //     UpdateOp: tags.updateOperator,
            //     ArithOp: tags.arithmeticOperator,
            //     BitOp: tags.bitwiseOperator,
            //     CompareOp: tags.compareOperator,
            //     AssignOp: tags.definitionOperator,
            //     Ellipsis: tags.punctuation,
            //     At: tags.meta,
            //     "( )": tags.paren,
            //     "[ ]": tags.squareBracket,
            //     "{ }": tags.brace,
            styleTags({
                "async '*' '**' FormatConversion": tags.modifier,
                "for while if elif else try except finally return raise break continue with pass assert await yield":
                    tags.controlKeyword,
                "in not and or is del": tags.operatorKeyword,
                "import from def class global nonlocal lambda": tags.definitionKeyword,
                "with as print": tags.keyword,
                self: tags.self,
                Boolean: tags.bool,
                None: tags.null,
                VariableName: tags.variableName,
                "CallExpression/VariableName": tags.function(tags.variableName),
                "FunctionDefinition/VariableName": tags.function(
                    tags.definition(tags.variableName)
                ),
                "ClassDefinition/VariableName": tags.definition(tags.className),
                PropertyName: tags.propertyName,
                "CallExpression/MemberExpression/ProperyName": tags.function(tags.propertyName),
                Comment: tags.lineComment,
                CNextStarter: tags.definitionKeyword,
                CNextPlotKeyword: tags.definitionKeyword,
                CNextDataFrameExpresion: tags.string,
                CNextXDimColumnNameExpression: tags.string,
                CNextYDimColumnNameExpression: tags.string,
                "over vs against": tags.definitionKeyword,
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
                "( )": tags.paren,
                "[ ]": tags.squareBracket,
                "{ }": tags.brace,
                ".": tags.derefOperator,
                ", ;": tags.separator,
            }),
        ],
    }),
    languageData: {
        closeBrackets: { brackets: ["(", "[", "{", "'", '"', "'''", '"""'] },
        commentTokens: { line: "#" },
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
