import { codeTestAudio, codeTestGroupLines } from "../data/code-text";
import { removeText, isMacOSPlatform, randomString } from "../shared";
const WAIT_500MLS = Cypress.env("wait_500mls");
const WAIT_1S = Cypress.env("wait_1s");
const WAIT_2S = Cypress.env("wait_2s");
const WAIT_3S = Cypress.env("wait_3s");
const SAVE_TIMEOUT_DURATION = 30000;

describe("Test Save Events", () => {
    before(() => {
        cy.visit("/");
        cy.wait(WAIT_3S);
    });

    beforeEach(() => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should("be.visible")
            .as("editor");
        removeText(cy.get("@editor"));
    });

    it("still save file successfully after timeout", () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should("be.visible")
            .as("editor");
        cy.get("@editor").focus();
        const code = randomString();
        cy.get("@editor").type(`print("${code}")`);
        cy.wait(SAVE_TIMEOUT_DURATION);
        cy.wait(WAIT_2S);
        cy.reload();
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').contains(code);
    });

    it("still save events on reload", () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should("be.visible")
            .as("editor");
        cy.get("@editor").focus();
        const code = randomString();
        cy.get("@editor").type(`print("${code}")`);
        cy.wait(WAIT_500MLS);
        cy.get("@editor").type("{selectall}");
        if (isMacOSPlatform()) {
            cy.get("@editor").type("{command}g");
            cy.get("@editor").type("{command}{enter}");
        } else {
            cy.get("@editor").type("{ctrl}g");
            cy.get("@editor").type("{shift}{enter}");
        }
        cy.wait(WAIT_1S);
        cy.reload();
        cy.get("#CodeOutputContent > :nth-child(1)").contains(code);
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').contains(code);
    });

    afterEach(() => {
        cy.wait(WAIT_1S);
    });
});

describe("Check special case on Code lines", () => {
    before(() => {
        cy.visit("/");
        cy.wait(WAIT_3S);
    });

    beforeEach(() => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should("be.visible")
            .as("editor");
        removeText(cy.get("@editor"));
        cy.wait(WAIT_2S);
    });

    it("Check group lines", () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').type(
            codeTestGroupLines
        );
        cy.wait(WAIT_500MLS);
        cy.get("@editor").type("{selectall}");
        if (isMacOSPlatform()) {
            cy.get("@editor").type("{command}g");
        } else {
            cy.get("@editor").type("{ctrl}g");
        }
        cy.wait(WAIT_3S);
        cy.reload();
        cy.wait(WAIT_2S);
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should("be.visible")
            .as("editor");
        cy.get("@editor").focus();
        cy.get("@editor").type("{selectall}");
        if (isMacOSPlatform()) {
            cy.get("@editor").type("{command}g");
            cy.get("@editor").type("{command}{enter}");
        } else {
            cy.get("@editor").type("{ctrl}g");
            cy.get("@editor").type("{shift}{enter}");
        }
        cy.wait(WAIT_1S);
        cy.get(".MuiPaper-root > div > img").should("be.visible");
    });

    it("Check blank code editor when loading", () => {
        cy.wait(WAIT_3S);
        cy.reload();
        cy.wait(WAIT_2S);
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should("be.visible")
            .as("editor");
        cy.get("@editor").focus();
        const code = randomString();
        cy.get("@editor").type(`print("${code}")`);
        cy.wait(WAIT_500MLS);
        cy.get("@editor").type("{selectall}");
        if (isMacOSPlatform()) {
            cy.get("@editor").type("{command}g");
            cy.get("@editor").type("{command}{enter}");
        } else {
            cy.get("@editor").type("{ctrl}g");
            cy.get("@editor").type("{shift}{enter}");
        }
        cy.wait(WAIT_1S);
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').contains(code);
    });

    afterEach(() => {
        cy.wait(WAIT_1S);
    });
});

describe("Check Heavy case", () => {
    before(() => {
        cy.visit("/");
        cy.wait(WAIT_3S);
    });

    beforeEach(() => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should("be.visible")
            .as("editor");
        removeText(cy.get("@editor"));
        cy.wait(WAIT_1S);
    });

    it("still render Audio", () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should("be.visible")
            .as("editor");
        cy.get("@editor").focus();
        cy.get("@editor").type(codeTestAudio);
        cy.wait(WAIT_500MLS);
        cy.get("@editor").type("{selectall}");
        if (isMacOSPlatform()) {
            cy.get("@editor").type("{command}g");
            cy.get("@editor").type("{command}{enter}");
        } else {
            cy.get("@editor").type("{ctrl}g");
            cy.get("@editor").type("{shift}{enter}");
        }
        cy.wait(WAIT_1S);
        cy.get("#RichOuputViewHeader_RESULTS").should("be.visible").click();
        cy.get("audio").should("be.visible");
    });

    afterEach(() => {
        cy.wait(WAIT_1S);
    });
});
