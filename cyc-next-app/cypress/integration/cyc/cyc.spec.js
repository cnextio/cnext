import {
    codeTestOutput,
    codeTestDF,
    codeTestEditor,
    codeTestEditorState,
    codeTestPlotinAudioVideo,
    codeTestMatplotBar,
    codeTestMatplotBarPhase1,
    codeTestMatplotBarPhase2,
} from '../data/code-text';
const WAIT_TIME_OUT = 1000;
describe('Check Code Editor', () => {
    it('Check state of Editor', () => {
        cy.visit('/').wait(3000);
        let lines = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor')
            .children('.cm-line');

        // make sure codeEditor have text from old state
        expect(lines).to.exist;
        lines.its('length').should('be.gt', 0);
        cy.wait(WAIT_TIME_OUT);
    });
});

describe('Check Console', () => {
    it('Check print console', () => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        // make sure have text on output
        editor.focus();
        removeText(editor);
        editor.type(codeTestOutput);
        editor.type('{ctrl}l');

        cy.get('#CodeOutputContent > :nth-child(1)').contains('test');
        cy.wait(WAIT_TIME_OUT);
    });
});

describe('Check Comletion of Editor', () => {
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

        // check data
        let content = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-tooltip-autocomplete')
            .as('autocomplete-content');
        content.contains('drop_duplicates');

        // make sure keyboard still work
        editor = cy.get('@editor');
        editor.type('{backspace}');
        editor.type('{esc}');
        cy.get('.cm-tooltip-autocomplete').should('not.exist');

        // make sure have signature tooltip
        editor = cy.get('@editor');
        editor.type('p');
        editor.type('(');
        cy.get('.cm-tooltip-signature').should('be.visible');

        editor = cy.get('@editor');
        editor.type('{esc}');
        cy.get('.cm-tooltip-signature').should('not.exist');

        editor = cy.get('@editor');
        removeText(editor);
        editor.type(codeTestDF);
        editor.type('{ctrl}l');
        editor.type('{enter}');
        editor.type('df.drop("');
        cy.get('.cm-tooltip-autocomplete').should('be.visible');
        cy.wait(WAIT_TIME_OUT);
    });
});

describe('Check DataFrame', () => {
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
        cy.wait(WAIT_TIME_OUT);
    });
});

describe('Check DF Autocompletion', () => {
    it('Check state of Editor', () => {
        let lines = cy
            .get('.cm-theme-light > .cm-editor > .cm-scroller > .cm-content')
            .as('df-editor')
            .children('.cm-line');
        expect(lines).to.exist;
        lines.its('length').should('be.gt', 0);

        let dfEditor = cy.get('@df-editor');
        dfEditor.focus();
        dfEditor.type('("');

        cy.get('.cm-tooltip-autocomplete').should('be.visible');
        cy.get('.cm-completionLabel').contains('Alley');
        cy.wait(WAIT_TIME_OUT);
    });
});

describe('Check data in Redux store', () => {
    it('has expected CodeEditor state when typing', () => {
        cy.visit('/').wait(10000);
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        removeText(editor);
        editor.type(codeTestEditorState);

        cy.wait(5000);
        // check file save state | saved or not
        cy.window()
            .its('store')
            .invoke('getState')
            .its('codeEditor.fileSaved')
            .should('equal', true);

        // check codeText
        cy.window()
            .its('store')
            .invoke('getState')
            .its('codeEditor')
            .its('codeText')
            .then((result) => {
                for (let key in result) {
                    cy.log(key);
                    assert.deepEqual(result[key], [`print('test1')`, `print('test2')`]);
                }
            });

        // check length code line
        cy.window()
            .its('store')
            .invoke('getState')
            .its('codeEditor')
            .its('codeLines')
            .then((result) => {
                for (let key in result) {
                    cy.log(key);
                    assert.equal(result[key].length, 2);
                }
            });
        cy.wait(WAIT_TIME_OUT);
    });

    it('has expected ProjectManager state', () => {
        cy.window()
            .its('store')
            .invoke('getState')
            .its('projectManager')
            .its('openFiles')
            .then((files) => {
                let i = 0;
                for (let key in files) {
                    i++;
                }
                // check have 3 files
                assert.equal(i, 3);
            });
        cy.wait(WAIT_TIME_OUT);
    });

    it('has expected DataFrames state', () => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        removeText(editor);
        editor.type(codeTestDF);
        editor.type('{ctrl}l');
        cy.wait(3000);
        cy.window()
            .its('store')
            .invoke('getState')
            .its('dataFrames')
            .its('metadata')
            .its('cdf')
            .its('columns')
            .then((columns) => {
                let i = 0;
                for (let key in columns) {
                    i++;
                }
                // check have 20 colums
                assert.equal(i, 20);
            });
        cy.wait(WAIT_TIME_OUT);
    });
});

describe('check Ploting', () => {
    it('still render Ploting result', () => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        removeText(editor);
        cy.wait(1000);
        editor = cy.get('@editor');
        editor.type(codeTestMatplotBarPhase1);
        cy.wait(10000);
        editor = cy.get('@editor');
        editor.type(codeTestMatplotBarPhase2);
        editor = cy.get('@editor');
        editor.type('{selectall}');
        editor.type('{ctrl}k');
        editor.type('{ctrl}l');
        cy.wait(1000);
        cy.get('.MuiPaper-root > img').should('be.visible');
        cy.wait(WAIT_TIME_OUT);
    });

    it('still render Audio and Video', () => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        removeText(editor);
        cy.wait(1000);
        editor = cy.get('@editor');
        editor.type(codeTestPlotinAudioVideo);
        cy.wait(1000);
        editor = cy.get('@editor');
        editor.type('{selectall}');
        editor.type('{ctrl}k');
        editor.type('{ctrl}l');
        cy.wait(WAIT_TIME_OUT);
    });
});

const removeText = (editor) => {
    editor.type('{selectall}');
    editor.type('{del}');
};
