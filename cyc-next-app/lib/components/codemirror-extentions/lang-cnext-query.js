import { parser } from './cnext-query';
import { LRLanguage, LanguageSupport } from '@codemirror/language';
import { styleTags, tags } from '@codemirror/highlight';

const cnextQueryLanguage = LRLanguage.define({
    parser: parser.configure({
        props: [
            styleTags({
                "async '*' '**' FormatConversion": tags.modifier,
                "for while if elif else try except finally return raise break continue with pass assert await yield": tags.controlKeyword,
                "not index isna notna isin": tags.operatorKeyword,
                "import from def class global nonlocal lambda": tags.definitionKeyword,
                "with as print": tags.keyword,
                self: tags.self,
                Boolean: tags.bool,
                None: tags.null,
                VariableName: tags.variableName,
                ColumnNameExpression: tags.string,
                ColumnValueExpression: tags.string,
                "CallExpression/VariableName": tags.function(tags.variableName),
                "FunctionDefinition/VariableName": tags.function(tags.definition(tags.variableName)),
                "ClassDefinition/VariableName": tags.definition(tags.className),
                PropertyName: tags.propertyName,
                "CallExpression/MemberExpression/ProperyName": tags.function(tags.propertyName),
                Comment: tags.lineComment,
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
                ", ;": tags.separator
            })
        ],
    })
})

function cnextQuery() {
    return new LanguageSupport(cnextQueryLanguage);
}

export {cnextQueryLanguage, cnextQuery};