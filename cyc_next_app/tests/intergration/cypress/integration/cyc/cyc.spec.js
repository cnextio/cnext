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

    it('Check print console', () => {
        cy.get('@editor').type(codeCheckConsole);
        if (isMacOSPlatform()) {
            cy.get('@editor').type('{command}l');
        } else {
            cy.get('@editor').type('{ctrl}l');
        }
        cy.get('#CodeOutputContent > :nth-child(1)').contains('test');
    });

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
        cy.get('@editor').type('(');
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
        cy.get('.cm-tooltip-autocomplete').should('be.visible');
    });

    afterEach(() => {
        cy.wait(WAIT_1S);
    });
});

describe('Test Rich output result', () => {
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

    it('still render Matplotlib result', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should('be.visible')
            .as('editor');
        cy.get('@editor').focus().type(codeTestMatplotlibLine);
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
        cy.get('.MuiPaper-root > img').should('be.visible');
    });

    it('still render Plotly result', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should('be.visible')
            .as('editor');
        cy.get('@editor').focus();
        cy.get('@editor').type(codeTestPlotly);
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
        cy.get('.MuiPaper-root > .js-plotly-plot').should('be.visible');
    });

    it('still render Video', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should('be.visible')
            .as('editor');
        cy.get('@editor').focus();
        cy.get('@editor').type(codeTestVideo);
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
        cy.get('.MuiPaper-root > video').should('be.visible');
    });

    it('still render Image JPG', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should('be.visible')
            .as('editor');
        cy.get('@editor').focus();
        cy.get('@editor').type(codeTestImageJPG);
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
        cy.get('.MuiPaper-root > img').should('be.visible');
    });

    it('still render Image PNG', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .should('be.visible')
            .as('editor');
        cy.get('@editor').focus();
        cy.get('@editor').type(codeTestImagePNG);
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
        cy.get('.MuiPaper-root > img').should('be.visible');
    });

    afterEach(() => {
        cy.wait(WAIT_1S);
    });
});

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

