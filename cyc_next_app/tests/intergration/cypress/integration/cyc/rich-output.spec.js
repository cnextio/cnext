import {
    codeTestMatplotlibLine,
    codeTestPlotly,
    codeTestVideo,
    codeTestImageJPG,
    codeTestImagePNG,
} from '../data/code-text';
import { removeText, isMacOSPlatform } from './shared';
const WAIT_500MLS = Cypress.env('wait_500mls');
const WAIT_1S = Cypress.env('wait_1s');
const WAIT_3S = Cypress.env('wait_3s');


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