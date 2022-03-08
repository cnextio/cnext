import { EditorView } from '@codemirror/view';
import { MaxInfoWidth } from './source';

export const baseTheme = /*@__PURE__*/ EditorView.baseTheme({
    '.cm-tooltip.documentation': {
        display: 'block',
        marginLeft: '0',
        padding: '3px 6px 3px 8px',
        borderLeft: '5px solid #999',
        whiteSpace: 'pre',
    },
    '.cm-tooltip.lint': {
        whiteSpace: 'pre',
    },
    '.cm-tooltip-section::-webkit-scrollbar': {
        width: '5px',
    },
    '.cm-tooltip-section::-webkit-scrollbar-thumb': {
        background: '#ccc',
        borderRadius: '2px',
    },
    '.cm-tooltip-section::-webkit-scrollbar-thumb:hover': {
        background: '#bbb',
    },
    '.cm-tooltip.cm-tooltip-autocomplete': {
        '& > ul': {
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            overflow: 'auto',
            maxWidth_fallback: '700px',
            maxWidth: 'min(700px, 95vw)',
            maxHeight: '10em',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            '& > li': {
                cursor: 'pointer',
                lineHeight: 1.2,
                margin: 'auto',
                padding: '4px 5px 1px 4px !important',
            },
            '& > li[aria-selected]': {
                background_fallback: '#bdf',
                backgroundColor: '#0060C0',
                color_fallback: 'white',
            },
        },
    },
    '.cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after': {
        content: '"···"',
        opacity: 0.5,
        display: 'block',
        textAlign: 'center',
    },
    '.cm-tooltip.cm-completionInfo': {
        margin: '-1px 0px !important',
        maxWidth: 2 * MaxInfoWidth + 'px !important',
        overflow: 'auto !important',
    },
    '.cm-completionInfo.cm-completionInfo-left': { right: '100%' },
    '.cm-completionInfo.cm-completionInfo-right': { left: '100%' },
    '&light .cm-snippetField': { backgroundColor: '#00000022' },
    '&dark .cm-snippetField': { backgroundColor: '#ffffff22' },
    '.cm-snippetFieldPosition': {
        verticalAlign: 'text-top',
        width: 0,
        height: '1.15em',
        margin: '0 -0.7px -.7em',
        borderLeft: '1.4px dotted #888',
    },
    '.cm-completionLabel': {
        display: 'inline-block',
        width: '200px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    '.cm-completionMatchedText': {
        textDecoration: 'none !important',
        color: '#0064b7',
        fontWeight: 'bold',
    },
    '.cm-completionDetail': {
        marginLeft: '0.5em',
        fontStyle: 'italic',
    },
    '.cm-completion-icon': {
        width: '12px',
        marginTop: '2px',
        float: 'left',
        marginRight: '6px',
        height: '12px',
    },
    '.cm-completion-icon-selected': {
        marginTop: '5px',
    },
    '.cm-read-more-btn': {
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        outline: 'none',
        color: 'white',
        float: 'right',
        fontWeight: 'bold',
        fontSize: '116%',
        marginTop: '-2px',
    },
    '.cm-list-options': {
        float: 'left',
    },
    '.cm-list-options::-webkit-scrollbar': {
        width: '5px',
    },
    '.cm-list-options::-webkit-scrollbar-thumb': {
        background: '#ccc',
        borderRadius: '2px',
    },
    '.cm-list-options::-webkit-scrollbar-thumb:hover': {
        background: '#bbb',
    },
    '#code-doc-container': {
        float: 'right',
    },
    '#code-doc-content::-webkit-scrollbar': {
        width: '5px',
    },
    '#code-doc-content::-webkit-scrollbar-thumb': {
        background: '#ccc',
        borderRadius: '2px',
    },
    '#code-doc-content::-webkit-scrollbar-thumb:hover': {
        background: '#bbb',
    },
    '#code-doc-content::-webkit-scrollbar:horizontal': {
        height: '5px',
    },
    '#code-doc-content::-webkit-scrollbar-thumb:horizontal': {
        background: '#ccc',
        borderRadius: '2px',
    },
    '#code-doc-content::-webkit-scrollbar-thumb:horizontal:hover': {
        background: '#bbb',
    },
    '.cm-completionIcon-function, .cm-completionIcon-method': {
        '&:after': {
            content: "url('../icons/block.png') !important",
            height: '10px',
            width: '10px',
        },
    },
    '.cm-completionIcon': {
        fontSize: '90%',
        width: '.8em',
        float: 'left',
        textAlign: 'center',
        opacity: '0.8',
        padding: '1px 1.6em 0 0.3em !important',
    },
    '.cm-completionIcon-function, .cm-completionIcon-method': {
        '&:after': { content: "'ƒ'" },
    },
    '.cm-completionIcon-class': {
        '&:after': { content: "'○'" },
    },
    '.cm-completionIcon-interface': {
        '&:after': { content: "'◌'" },
    },
    '.cm-completionIcon-variable': {
        '&:after': { content: "'𝑥'" },
    },
    '.cm-completionIcon-constant': {
        '&:after': { content: "'𝐶'" },
    },
    '.cm-completionIcon-type': {
        '&:after': { content: "'𝑡'" },
    },
    '.cm-completionIcon-enum': {
        '&:after': { content: "'∪'" },
    },
    '.cm-completionIcon-property': {
        '&:after': { content: "'□'" },
    },
    '.cm-completionIcon-keyword': {
        paddingRight: '1.8em !important',
        marginLeft: '-2px',
        '&:after': { content: "'🔑\uFE0E'", fontSize: '90%' }, // Disable emoji rendering
    },
    '.cm-completionIcon-namespace': {
        '&:after': { content: "'▢'" },
    },
    '.cm-completionIcon-text': {
        '&:after': {
            content: "'Ab'",
            fontSize: '80%',
            verticalAlign: 'middle',
            fontWeight: 'bold',
        },
    },
    '.cm-completionIcon-field': {
        '&:after': {
            content: "'Col'",
            fontSize: '75%',
            verticalAlign: 'middle',
            fontWeight: 'bold',
        },
    },
    '.cm-tooltip.cm-tooltip-signature': {
        padding: '2px 7px',
    },
    '.cm-tooltip-signature-element': {
        color: '#0060C0',
        fontWeight: 'bold',
    },
    '.cm-tooltip-signature-doc': {
        overflow: 'auto !important',
        maxHeight: '100px',
        whiteSpace: 'pre-wrap',
    },
    '.cm-tooltip-signature-doc::-webkit-scrollbar': {
        width: '5px',
    },
    '.cm-tooltip-signature-doc::-webkit-scrollbar-thumb': {
        background: '#ccc',
        borderRadius: '2px',
    },
    '.cm-tooltip-signature-doc::-webkit-scrollbar-thumb:hover': {
        background: '#bbb',
    },
});
