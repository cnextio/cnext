const WAIT_500MLS = Cypress.env("wait_500mls");
const WAIT_1S = Cypress.env("wait_1s");
const WAIT_2S = Cypress.env("wait_2s");
const WAIT_3S = Cypress.env("wait_3s");
const WAIT_10S = Cypress.env("wait_10s");

describe("Test Terminal  ", () => {
    before(() => {
        cy.visit("/");
        cy.wait(WAIT_3S);
        // cy.reload();
        // truy cap va chay toan bo ung dung ->
        // mong muon: chay bt tat cac cac dich vu de test
    });

    it("Check terminal ", () => {
        cy.get("#header-terminal").should("be.visible");

        // kiem tra case co dung hay khong

        // cong co mo hay khong?

        cy.get("#header-terminal").click();
        // cy.wait(WAIT_3S);
    });
});
