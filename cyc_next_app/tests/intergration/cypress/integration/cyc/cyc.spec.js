import {
    codeCheckConsole,
    codeTestDF,
    codeTestMatplotlibLine,
    codeTestPlotly,
    codeTestAudio,
    codeTestVideo,
    codeTestImageJPG,
    codeTestImagePNG,
    codeTestGroupLines,
} from '../data/code-text';
import { removeText, isMacOSPlatform, randomString } from './shared';
const WAIT_500MLS = Cypress.env('wait_500mls');
const WAIT_1S = Cypress.env('wait_1s');
const WAIT_2S = Cypress.env('wait_2s');
const WAIT_3S = Cypress.env('wait_3s');
const WAIT_5S = Cypress.env('wait_5s');
const SAVE_TIMEOUT_DURATION = 30000;


describe('Test Save Events', () => {
    before(() => {
        cy.visit('/');
        cy.wait(WAIT_3S);
    });

    beforeEach(() => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should('be.visible')
            .as('editor');
        removeText(cy.get('@editor'));
    });

    it('still save file successfully after timeout', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should('be.visible')
            .as('editor');
        cy.get('@editor').focus();
        const code = randomString();
        cy.get('@editor').type(`print("${code}")`);
        cy.wait(SAVE_TIMEOUT_DURATION);
        cy.wait(WAIT_2S);
        cy.reload();
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').contains(code);
    });

    it('still save events on reload', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should('be.visible')
            .as('editor');
        cy.get('@editor').focus();
        const code = randomString();
        cy.get('@editor').type(`print("${code}")`);
        cy.wait(WAIT_500MLS);
        cy.get('@editor').type('{selectall}');
        if (isMacOSPlatform()) {
            cy.get('@editor').type('{command}k');
            cy.get('@editor').type('{command}l');
        } else {
            cy.get('@editor').type('{ctrl}k');
            cy.get('@editor').type('{ctrl}l');
        }

        cy.reload();
        cy.get('#CodeOutputContent > :nth-child(1)').contains(code);
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').contains(code);
    });

    // it('still save events on file change', () => {
    //     cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
    //         .should('be.visible')
    //         .as('editor');
    //     cy.get('@editor').focus();
    //     const code = randomString();
    //     cy.get('@editor').type(`print("${code}")`);
    //     cy.wait(WAIT_500MLS);
    //     cy.get('@editor').type('{selectall}');
    //     if (isMacOSPlatform()) {
    //         cy.get('@editor').type('{command}k');
    //         cy.get('@editor').type('{command}l');
    //     } else {
    //         cy.get('@editor').type('{ctrl}k');
    //         cy.get('@editor').type('{ctrl}l');
    //     }

    //     // This is hacky
    //     cy.get('[toolbarname="data_loader.py"]').click();
    //     cy.get('[toolbarname="main.py"]').click();
    //     cy.get('#CodeOutputContent > :nth-child(1)').contains(code);
    //     cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').contains(code);
    // });

    afterEach(() => {
        cy.wait(WAIT_1S);
    });
});

describe('Check special case on Code lines', () => {
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

    it('Check group lines', () => {
        cy.get('@editor').type(codeTestGroupLines);
        cy.wait(WAIT_500MLS);
        cy.get('@editor').type('{selectall}');
        if (isMacOSPlatform()) {
            cy.get('@editor').type('{command}k');
        } else {
            cy.get('@editor').type('{ctrl}k');
        }
        cy.wait(WAIT_3S);
        cy.reload();
        cy.wait(WAIT_2S);
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should('be.visible')
            .as('editor');
        cy.get('@editor').focus();
        cy.get('@editor').type('{selectall}');
        if (isMacOSPlatform()) {
            cy.get('@editor').type('{command}k');
            cy.get('@editor').type('{command}l');
        } else {
            cy.get('@editor').type('{ctrl}k');
            cy.get('@editor').type('{ctrl}l');
        }
        cy.get('.MuiPaper-root > img').should('be.visible');
    });

    it('Check blank code editor when loading', () => {
        cy.wait(WAIT_3S);
        cy.reload();
        cy.wait(WAIT_2S);
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should('be.visible')
            .as('editor');
        cy.get('@editor').focus();
        const code = randomString();
        cy.get('@editor').type(`print("${code}")`);
        cy.wait(WAIT_500MLS);
        cy.get('@editor').type('{selectall}');
        if (isMacOSPlatform()) {
            cy.get('@editor').type('{command}k');
            cy.get('@editor').type('{command}l');
        } else {
            cy.get('@editor').type('{ctrl}k');
            cy.get('@editor').type('{ctrl}l');
        }
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').contains(code);
    });

    afterEach(() => {
        cy.wait(WAIT_1S);
    });
});

describe('Check Heavy case', () => {
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

    it('still render Audio', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should('be.visible')
            .as('editor');
        cy.get('@editor').focus();
        cy.get('@editor').type(codeTestAudio);
        cy.wait(WAIT_500MLS);
        cy.get('@editor').type('{selectall}');
        if (isMacOSPlatform()) {
            cy.get('@editor').type('{command}k');
            cy.get('@editor').type('{command}l');
        } else {
            cy.get('@editor').type('{ctrl}k');
            cy.get('@editor').type('{ctrl}l');
        }

        cy.get('#RichOuputViewHeader_RESULTS').should('be.visible').click();
        cy.get('.MuiPaper-root > audio').should('be.visible');
    });

    afterEach(() => {
        cy.wait(WAIT_1S);
    });
});


