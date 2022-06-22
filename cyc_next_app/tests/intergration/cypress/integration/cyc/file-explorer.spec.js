const WAIT_500MLS = Cypress.env('wait_500mls');
const WAIT_1S = Cypress.env('wait_1s');
const WAIT_2S = Cypress.env('wait_2s');
const WAIT_3S = Cypress.env('wait_3s');

describe('Check File Explorer', () => {
    before(() => {
        cy.visit('/');
        cy.wait(WAIT_3S);
    });

    it('Check create and delete file', () => {
        cy.get('#sidebar_Projects').should('be.visible').click();

        // Create file
        cy.wait(WAIT_2S);
        cy.get('[data-cy="project-root"]').rightclick();
        cy.wait(WAIT_1S);
        cy.get('.MuiMenuItem-root').contains('New file').click();
        cy.get('[data-cy="new-file-item').type('test').type('{enter}');
        cy.wait(WAIT_1S);

        // Delete file
        cy.get('.MuiTreeItem-label').contains('test.py').rightclick();
        cy.wait(WAIT_1S);
        cy.get('.MuiMenuItem-root').contains('Delete').click();
        cy.wait(WAIT_500MLS);
        cy.get('button').contains('Move to trash').click();

        cy.get('.MuiTreeItem-label').contains('test.py').should('not.exist');
    });

    afterEach(() => {
        cy.wait(WAIT_1S);
    });
});
