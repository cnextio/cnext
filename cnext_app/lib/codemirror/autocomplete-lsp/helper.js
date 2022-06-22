import { CompletionItemKind } from 'vscode-languageserver-protocol';
const CompletionItemKindMap = Object.fromEntries(
    Object.entries(CompletionItemKind).map(([key, value]) => [value, key])
);

export function formatContents(contents) {
    if (Array.isArray(contents)) {
        return contents.map((c) => formatContents(c) + '\n\n').join('');
    } else if (typeof contents === 'string') {
        return contents;
    } else {
        return contents.value;
    }
}

function toSet(chars) {
    let preamble = '';
    let flat = Array.from(chars).join('');
    const words = /\w/.test(flat);
    if (words) {
        preamble += '\\w';
        flat = flat.replace(/\w/g, '');
    }
    return `[${preamble}${flat.replace(/[^\w\s]/g, '\\$&')}]`;
}

export function prefixMatch(options) {
    const first = new Set();
    const rest = new Set();
    for (const { apply } of options) {
        const [initial, ...restStr] = apply;
        first.add(initial);
        for (const char of restStr) {
            rest.add(char);
        }
    }
    const source = toSet(first) + toSet(rest) + '*$';
    return [new RegExp('^' + source), new RegExp(source)];
}

export const sortResults = (context, items) => {
    let options = items?.map(
        ({
            detail,
            label,
            kind,
            textEdit,
            documentation,
            sortText,
            filterText,
            insertText,
            apply,
        }) => {
            var _a;
            const completion = {
                label,
                detail,
                apply:
                    apply ||
                    ((_a = textEdit === null || textEdit === void 0 ? void 0 : textEdit.newText) !==
                        null &&
                        _a !== void 0)
                        ? _a
                        : insertText,
                type: kind && CompletionItemKindMap[kind].toLowerCase(),
                sortText: sortText !== null && sortText !== void 0 ? sortText : label,
                filterText: filterText !== null && filterText !== void 0 ? filterText : label,
            };
            if (documentation) {
                completion.info = formatContents(documentation);
            }
            return completion;
        }
    );
    const [span, match] = prefixMatch(options); //find the regrex string
    const token = context.matchBefore(match);
    let { pos } = context;
    if (token) {
        pos = token.from;
        const word = token.text.toLowerCase();
        if (/^\w+$/.test(word)) {
            options = options
                .filter(({ filterText }) => filterText.toLowerCase().startsWith(word))
                .sort(({ apply: a }, { apply: b }) => {
                    switch (true) {
                        case a.startsWith(token.text) && !b.startsWith(token.text):
                            return -1;
                        case !a.startsWith(token.text) && b.startsWith(token.text):
                            return 1;
                    }
                    return 0;
                });
        }
    }

    return {
        from: pos,
        options,
    };
};
