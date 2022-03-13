import { codeTestOutput, codeTestDF, codeTestEditor } from '../data/code-text';
const WAIT_TIME_OUT = 2000;
describe('Check UI of all Element on Cyc web app', () => {
    it('Check state of Editor is ok?', () => {
        cy.visit('/').wait(WAIT_TIME_OUT);
        let lines = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .children('.cm-line');

        // make sure codeEditor have text from old state
        expect(lines).to.exist;
        lines.its('length').should('be.gt', 0);
    });

    it('Check print console', () => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        // make sure have text on output
        removeText(editor);
        editor.type(codeTestOutput);
        editor.type('{ctrl}l');

        cy.log(cy.get('#CodeOutputContent > :nth-child(1)').contains('test'));
    });

    it('Check dataframe', () => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        removeText(editor);
        editor.type(codeTestEditor);
    });

    it('Check autocompletion', () => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        removeText(editor);
        editor.type(codeTestDF);
        editor.type('{ctrl}l');
    });
});

const removeText = (editor) => {
    editor.type('{selectall}');
    editor.type('{del}');
};
