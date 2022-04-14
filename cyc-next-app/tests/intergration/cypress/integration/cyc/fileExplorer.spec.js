describe('Check File Explorer', () => {
    before(() => {
        cy.visit('/');
        cy.wait(WAIT_3S);
    });

    // beforeEach(() => {
    //     cy.wait(WAIT_1S);
    // });

    it('Check create file', () => {
        cy.get('#sidebar_Projects').should('be.visible').click();
        cy.wait(WAIT_2S);
        // cy.get('#mui-5-./ > :nth-child(1)').rightclick();
        cy.get('[data-cy="project-root"]').rightclick();
        cy.wait(WAIT_1S);
        cy.get(".MuiMenuItem-root").contains('New file').click();
        cy.get('[data-cy="new-file-item').type("test");
        // cy.get('@editor').type('{selectall}');
        // if (isMacOSPlatform()) {
        //     cy.get('@editor').type('{command}k');
        //     cy.get('@editor').type('{command}l');
        // } else {
        //     cy.get('@editor').type('{ctrl}k');
        //     cy.get('@editor').type('{ctrl}l');
        // }

        // cy.get('#RichOuputViewHeader_RESULTS').should('be.visible').click();
        // cy.get('.MuiPaper-root > audio').should('be.visible');
    });

    afterEach(() => {
        cy.wait(WAIT_1S);
    });
});
