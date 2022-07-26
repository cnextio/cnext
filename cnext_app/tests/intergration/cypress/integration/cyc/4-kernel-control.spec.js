import { codeTestKernelControl } from '../data/code-text';
import { removeText, isMacOSPlatform } from '../shared';
const WAIT_500MLS = Cypress.env('wait_500mls');
const WAIT_1S = Cypress.env('wait_1s');
const WAIT_3S = Cypress.env('wait_3s');
const WAIT_10S = Cypress.env('wait_10s');

describe('Check Kernel Control', () => {
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

    it('Check restart kernel', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should('be.visible')
            .as('editor');
        cy.get('@editor').focus().type(codeTestKernelControl);

        cy.wait(WAIT_500MLS);
        cy.get('@editor').type('{selectall}');
        if (isMacOSPlatform()) {
            cy.get('@editor').type('{command}g');
            cy.get('@editor').type('{command}{enter}');
        } else {
            cy.get('@editor').type('{ctrl}g');
            cy.get('@editor').type('{shift}{enter}');
        }
        cy.wait(WAIT_10S);
        cy.get('#sidebar_RestartKernel').should('be.visible').click();
        cy.wait(WAIT_1S);
        cy.get('.MuiButton-root').contains('Yes').click();
        cy.wait(WAIT_500MLS);
        cy.get('#CodeOutputContent > :nth-child(1)').contains('KeyboardInterrupt');
    });

    it('Check interrupt kernel', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should('be.visible')
            .as('editor');
        cy.get('@editor').focus().type(codeTestKernelControl);

        cy.wait(WAIT_500MLS);
        cy.get('@editor').type('{selectall}');
        if (isMacOSPlatform()) {
            cy.get('@editor').type('{command}g');
            cy.get('@editor').type('{command}{enter}');
        } else {
            cy.get('@editor').type('{ctrl}g');
            cy.get('@editor').type('{shift}{enter}');
        }
        cy.wait(WAIT_10S);
        cy.get('#sidebar_InterruptKernel').should('be.visible').click();
        cy.wait(WAIT_1S);
        cy.get('.MuiButton-root').contains('Yes').click();
        cy.wait(WAIT_500MLS);
        cy.get('#CodeOutputContent > :nth-child(1)').contains('KeyboardInterrupt');
    });

    afterEach(() => {
        cy.wait(WAIT_1S);
    });
});
