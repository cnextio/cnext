import { codeCheckConsole, codeTestDF } from '../data/code-text';
import { removeText, isMacOSPlatform } from './shared';
const WAIT_500MLS = Cypress.env('wait_500mls');
const WAIT_1S = Cypress.env('wait_1s');
const WAIT_3S = Cypress.env('wait_3s');

describe('Test Code Editor', () => {
    before(() => {
        cy.visit('/');
        cy.wait(WAIT_3S);
    });

    beforeEach(() => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should('be.visible')
            .as('editor');
        removeText(cy.get('@editor'));
        cy.wait(WAIT_1S);
    });

    // it('Check print console', () => {
    //     cy.get('@editor').type(codeCheckConsole);
    //     if (isMacOSPlatform()) {
    //         cy.get('@editor').type('{command}l');
    //     } else {
    //         cy.get('@editor').type('{ctrl}l');
    //     }
    //     cy.get('#CodeOutputContent > :nth-child(1)').contains('test');
    // });

    it('Check autocompletion', () => {
        cy.get('@editor').type(codeTestDF);
        cy.wait(WAIT_500MLS);
        // make sure have autocompletion dialog
        cy.get('@editor').type('{enter}');
        cy.get('@editor').type('df.drop');
        cy.wait(WAIT_500MLS);
        cy.get('.cm-tooltip-autocomplete').should('be.visible');
        cy.get('.cm-read-more-btn').should('be.visible');
        cy.get('.cm-read-more-btn').click();
        cy.get('#code-doc-content').should('be.visible');

        // check data
        let content = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-tooltip-autocomplete')
            .as('autocomplete-content');
        content.contains('drop_duplicates');

        // make sure keyboard still work
        cy.get('@editor').type('{backspace}');
        cy.get('@editor').type('{esc}');
        cy.get('.cm-tooltip-autocomplete').should('not.exist');

        // make sure have signature tooltip
        cy.get('@editor').type('p');
        cy.wait(WAIT_500MLS);
        cy.get('@editor').type('(');
        cy.wait(WAIT_1S);
        cy.get('.cm-tooltip-signature').should('be.visible');

        cy.get('@editor').type('{esc}');
        cy.wait(WAIT_1S);
        cy.get('.cm-tooltip-signature').should('not.exist');

        removeText(cy.get('@editor'));
        cy.get('@editor').type(codeTestDF);
        cy.wait(WAIT_500MLS);
        cy.get('@editor').type('{selectall}');
        if (isMacOSPlatform()) {
            cy.get('@editor').type('{command}k');
            cy.get('@editor').type('{command}l');
        } else {
            cy.get('@editor').type('{ctrl}k');
            cy.get('@editor').type('{ctrl}l');
        }
        cy.wait(WAIT_1S);
        cy.get('@editor').type('{rightArrow}');
        cy.get('@editor').type('{enter}');
        cy.get('@editor').type('df.drop("');
        cy.wait(WAIT_1S);
        cy.get('.cm-tooltip-autocomplete').should('be.visible');

        cy.wait(WAIT_1S);
        cy.get('@editor').type('{backspace}');
        cy.get('@editor').type('labels,axis');
        cy.get('.cm-activeLine').click(15, 0);
        cy.get('.cm-tooltip-signature').should('not.exist');

        cy.wait(WAIT_500MLS);
        cy.get('.cm-activeLine').click();
        cy.get('@editor').type('{backspace}');
        cy.wait(WAIT_500MLS);
        cy.get('@editor').type('{backspace}');
        cy.wait(WAIT_500MLS);
        cy.get('@editor').type('{backspace}');
        cy.wait(WAIT_500MLS);
        cy.get('@editor').type('{backspace}');
        cy.get('.cm-tooltip-signature').should('be.visible');
        cy.wait(WAIT_500MLS);

        cy.get('.cm-activeLine').click(65, 0);
        cy.wait(WAIT_500MLS);
        cy.get('.cm-tooltip-signature').should('not.exist');
    });

    afterEach(() => {
        cy.wait(WAIT_1S);
    });
});
