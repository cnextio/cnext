const WAIT_500MLS = Cypress.env("wait_500mls");
const WAIT_1S = Cypress.env("wait_1s");
const WAIT_2S = Cypress.env("wait_2s");
const WAIT_3S = Cypress.env("wait_3s");

describe("Test Terminal", () => {
    before(() => {
        cy.visit("/");
        cy.wait(WAIT_3S);
    });

    it("Check terminal", () => {});

    afterEach(() => {
        cy.wait(WAIT_1S);
    });
});
