import { codeCheckConsole, codeTestDF } from "../data/code-text";
import { removeText, isMacOSPlatform } from "./shared";
const WAIT_500MLS = Cypress.env("wait_500mls");
const WAIT_1S = Cypress.env("wait_1s");
const WAIT_2S = Cypress.env("wait_2s");
const WAIT_3S = Cypress.env("wait_3s");

describe("Test Project Management", () => {
    before(() => {
        cy.visit("/");
        cy.wait(WAIT_3S);
    });

    it("Check load project with existed workspace", () => {
        cy.writeFile(
            "/Users/vicknguyen/Desktop/PROJECTS/CYCAI/cyc-next/cyc_next_app/server/workspace.yaml",
            `active_project: 25433ea8-eb9a-11ec-b710-acde48001122
open_projects:
    - id: 25433ea8-eb9a-11ec-b710-acde48001122
    name: test_add
    path: /Users/vicknguyen/Desktop/PROJECTS/CYCAI/SAMPLE-PROJECT/test_add`
        );
        cy.visit("/");
        cy.wait(WAIT_2S);
        cy.get("#sidebar_Projects").should("be.visible").click();
        cy.wait(WAIT_2S);
        cy.get(".MuiTreeItem-content").contains("test_add").should("be.visible");
    });
});
