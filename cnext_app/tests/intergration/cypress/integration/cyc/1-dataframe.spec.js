import { codeTestDF } from "../data/code-text";
import { removeText, isMacOSPlatform } from "../shared";
const WAIT_500MLS = Cypress.env("wait_500mls");
const WAIT_1S = Cypress.env("wait_1s");
const WAIT_2S = Cypress.env("wait_3s");
const WAIT_3S = Cypress.env("wait_3s");
const WAIT_5S = Cypress.env("wait_5s");

describe("Test DataFrame", () => {
    before(() => {
        cy.visit("/");
        cy.wait(WAIT_3S);
    });

    beforeEach(() => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').as("editor");
        removeText(cy.get("@editor"));
        cy.wait(WAIT_1S);
    });

    it("Check dataframe", () => {
        cy.get("@editor").type(codeTestDF);
        cy.wait(WAIT_500MLS);
        cy.get("@editor").type("{selectall}");
        if (isMacOSPlatform()) {
            cy.get("@editor").type("{command}g");
            cy.get("@editor").type("{command}{enter}");
        } else {
            cy.get("@editor").type("{ctrl}g");
            cy.get("@editor").type("{shift}{enter}");
        }
        cy.wait(WAIT_2S);
        cy.get("#RichOuputViewHeader_DATA").should("be.visible").click();
        cy.wait(WAIT_2S);
        cy.get(".MuiTableContainer-root").should("be.visible");
        // check columns name
        cy.get(".MuiTableHead-root > .MuiTableRow-root > :nth-child(2)").contains("Id");

        cy.window()
            .its("store")
            .invoke("getState")
            .its("dataFrames")
            .its("activeDataFrame")
            .then((activeDataFrame) => {
                assert.equal(activeDataFrame, "df");
            });

        cy.window()
            .its("store")
            .invoke("getState")
            .its("dataFrames")
            .its("tableData")
            .then((tableData) => {
                assert.notDeepEqual(tableData, {});
            });
    });

    it("Check DF Autocompletion", () => {
        cy.get("@editor").type(codeTestDF);
        cy.wait(WAIT_1S);
        cy.get("@editor").type("{selectall}");
        if (isMacOSPlatform()) {
            cy.get("@editor").type("{command}g");
            cy.get("@editor").type("{command}{enter}");
        } else {
            cy.get("@editor").type("{ctrl}g");
            cy.get("@editor").type("{shift}{enter}");
        }
        cy.wait(WAIT_1S);
        cy.get("#RichOuputViewHeader_DATA").should("be.visible").click();
        let lines = cy
            .get(".cm-theme-light > .cm-editor > .cm-scroller > .cm-content")
            .as("df-editor")
            .children(".cm-line");
        expect(lines).to.exist;
        lines.its("length").should("be.gt", 0);

        let dfEditor = cy.get("@df-editor");
        dfEditor.focus();
        dfEditor.type('("');

        cy.get(".cm-tooltip-autocomplete").should("be.visible");
        cy.get(".cm-completionLabel").contains("Alley");
    });

    it("Check Data Stats", () => {
        cy.visit("/");
        cy.wait(WAIT_3S);

        cy.get("@editor").type(codeTestDF);
        cy.wait(WAIT_1S);
        cy.get("@editor").type("{selectall}");
        if (isMacOSPlatform()) {
            cy.get("@editor").type("{command}g");
            cy.get("@editor").type("{command}{enter}");
        } else {
            cy.get("@editor").type("{ctrl}g");
            cy.get("@editor").type("{shift}{enter}");
        }
        cy.wait(WAIT_2S);
        cy.get('[data-cy="df-stats-checkbox"]').should("be.visible").click();
        cy.wait(WAIT_5S);
        cy.get(
            ".MuiTableHead-root > .MuiTableRow-root > :nth-child(2) > .MuiTableContainer-root > .js-plotly-plot > .plot-container"
        ).should("be.visible");

        cy.get('[data-cy="df-stats-checkbox"]').should("be.visible").click();
        cy.wait(WAIT_2S);
        cy.get(
            ".MuiTableHead-root > .MuiTableRow-root > :nth-child(2) > .MuiTableContainer-root > .js-plotly-plot > .plot-container"
        ).should("not.exist");
    });

    afterEach(() => {
        cy.wait(WAIT_1S);
    });
});
