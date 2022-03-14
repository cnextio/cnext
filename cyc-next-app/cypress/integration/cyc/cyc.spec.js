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

        cy.get('#CodeOutputContent > :nth-child(1)').contains('test');
    });

    it('Check autocompletion', () => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        removeText(editor);
        editor.type(codeTestEditor);

        // make sure have autocompletion dialog
        editor.type('df.drop');
        cy.get('.cm-tooltip-autocomplete').should('be.visible');
        cy.get('.cm-read-more-btn').should('be.visible');
        cy.get('.cm-read-more-btn').click();
        cy.get('#code-doc-content').should('be.visible');
        cy.get('.cm-read-more-btn').click();
        cy.get('#code-doc-content').should('not.exist');

        // make sure keyboard still work
        editor = cy.get('@editor');
        editor.type('{backspace}');
        editor.type('{esc}');
        cy.get('.cm-tooltip-autocomplete').should('not.exist');

        // TODO: check data

        // make sure have signature tooltip
        editor = cy.get('@editor');
        editor.type('p');
        editor.type('(');
        cy.get('.cm-tooltip-signature').should('be.visible');

        editor = cy.get('@editor');
        editor.type('{esc}');
        cy.get('.cm-tooltip-signature').should('not.exist');

        // TODO: make hover work
        // make sure tooltip still work
        // cy.get('.cm-activeLine > :nth-child(1)').should('be.visible');
        // cy.get('.cm-activeLine > :nth-child(1)').click();

        editor = cy.get('@editor');
        removeText(editor);
        editor.type(codeTestDF);
        editor.type('{ctrl}l');
        editor.type('{enter}');
        editor.type('df.drop("');
        cy.get('.cm-tooltip-autocomplete').should('be.visible');
    });

    it('Check dataframe', () => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        removeText(editor);
        editor.type(codeTestDF);
        cy.get('#CodeOutputContent > :nth-child(2)').contains('New dataframe created');
        cy.get('.MuiTableContainer-root').should('be.visible');
        // check columns name
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').contains('Id');

        cy.get('*[class^="StyledComponents__StyledTableViewHeader"] > :nth-child(2)').click();
        cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(1)').contains('Id');
    });
});

const removeText = (editor) => {
    editor.type('{selectall}');
    editor.type('{del}');
};
