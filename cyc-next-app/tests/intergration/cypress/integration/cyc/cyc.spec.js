import {
    codeCheckConsole,
    codeTestDF,
    codeTestMatplotlibLine,
    codeTestMatplotlibTheCoherenceOfTwoSignals,
    codeTestPlotly,
    codeTestAudio,
    codeTestVideo,
    codeTestImageJPG,
    codeTestImagePNG
} from '../data/code-text';
const WAIT_TIME_OUT = 1000;
const SAVE_TIMEOUT_DURATION = 30000;

const isMacOSPlatform = () => {
    return Cypress.platform.includes('darwin');
}

const removeText = (editor) => {
    editor.type('{selectall}')
    editor.type('{del}');
};

const randomString = () => {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 10; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

describe('Test Code Editor', () => {

    before(() => {
        cy.visit('/');
        cy.get('[toolbarname="main.py"]').trigger("click");
    })

    beforeEach(() => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').as('editor');
        removeText(cy.get('@editor'));
    })

    it('Check print console', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
          .as('editor');
        cy.get('@editor').focus();
        cy.get('@editor').type(codeCheckConsole);
        if (isMacOSPlatform()) {
            cy.get('@editor').type('{command}l');
        } else {
            cy.get('@editor').type('{ctrl}l');
        }
        cy.get('#CodeOutputContent > :nth-child(1)').contains('test');
        cy.wait(WAIT_TIME_OUT);
    });

    it('Check autocompletion', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
          .as('editor');
        cy.get('@editor').focus();
        cy.get('@editor').type(codeTestDF);
        // make sure have autocompletion dialog
        cy.get('@editor').type('{enter}')
        cy.get('@editor').type('df.drop');
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
        // editor = cy.get('@editor');
        cy.get('@editor').type('{backspace}');
        cy.get('@editor').type('{esc}');
        cy.get('.cm-tooltip-autocomplete').should('not.exist');

        // make sure have signature tooltip
        // editor = cy.get('@editor');
        cy.get('@editor').type('p');
        cy.get('@editor').type('(');
        cy.get('.cm-tooltip-signature').should('be.visible');

        // editor = cy.get('@editor');
        cy.get('@editor').type('{esc}');
        cy.get('.cm-tooltip-signature').should('not.exist');

        // editor = cy.get('@editor');
        removeText(cy.get('@editor'));
        cy.get('@editor').type(codeTestDF);
        if (isMacOSPlatform()) {
            cy.get('@editor').type('{command}l');
        } else {
            cy.get('@editor').type('{ctrl}l');
        }
        cy.get('@editor').type('{enter}');
        cy.get('@editor').type('df.drop("');
        cy.get('.cm-tooltip-autocomplete').should('be.visible');
        cy.wait(WAIT_TIME_OUT);
    });
    
});

describe('Test DataFrame', () => {

    before(() => {
        cy.visit('/');
        cy.get('[toolbarname="main.py"]', { timeout: 10000 }).should('be.visible').trigger('click');
    })

    beforeEach(() => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').as('editor');
        removeText(cy.get('@editor'));
    })

    it('Check dataframe', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
          .as('editor');
        cy.get('@editor').focus();
        cy.get('@editor').type(codeTestDF);
        cy.get('@editor').type('{selectall}');
        if (isMacOSPlatform()) {
            cy.get('@editor').type('{command}k');
            cy.get('@editor').type('{command}l');
        } else {
            cy.get('@editor').type('{ctrl}k');
            cy.get('@editor').type('{ctrl}l');
        }

        cy.get('.MuiTableContainer-root').should('be.visible');
        // check columns name
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').contains('Id');

        cy.get('*[class^="StyledComponents__StyledTableViewHeader"] > :nth-child(2)').click();
        cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(1)').contains('Id');

        cy.window()
            .its('store')
            .invoke('getState')
            .its('dataFrames')
            .its('activeDataFrame')
            .then((activeDataFrame) => {
                assert.equal(activeDataFrame, "df");
            });

        cy.window()
            .its('store')
            .invoke('getState')
            .its('dataFrames')
            .its('tableData')
            .then((tableData) => {
                assert.notDeepEqual(tableData, {});
            });    

        cy.wait(WAIT_TIME_OUT);
    });

    it('Check DF Autocompletion', () => {
        let lines = cy
            .get('.cm-theme-light > .cm-editor > .cm-scroller > .cm-content')
            .as('df-editor')
            .children('.cm-line');
        expect(lines).to.exist;
        lines.its('length').should('be.gt', 0);

        let dfEditor = cy.get('@df-editor');
        dfEditor.focus();
        dfEditor.type('("');

        cy.get('.cm-tooltip-autocomplete').should('be.visible');
        cy.get('.cm-completionLabel').contains('Alley');
        cy.wait(WAIT_TIME_OUT);
    })
});

describe('Test Rich output result', () => {

    before(() => {
        cy.visit('/');
        cy.get('[toolbarname="main.py"]', { timeout: 10000 }).should('be.visible').trigger('click');
    })

    beforeEach(() => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').as('editor');
        removeText(cy.get('@editor'));
    })

    it('still render Matplotlib result', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').as('editor');
        cy.get('@editor').focus().type(codeTestMatplotlibLine);
        cy.get('@editor').type('{selectall}');
        if (isMacOSPlatform()) {
            cy.get('@editor').type('{command}k');
            cy.get('@editor').type('{command}l');
        } else {
            cy.get('@editor').type('{ctrl}k');
            cy.get('@editor').type('{ctrl}l');
        }

        cy.get('.MuiPaper-root > img').should('be.visible');
        cy.wait(WAIT_TIME_OUT);
    });

    it('still render Plotly result', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').as('editor');
        cy.get('@editor').focus();
        cy.get('@editor').type(codeTestPlotly);
        cy.get('@editor').type('{selectall}');
        if (isMacOSPlatform()) {
            cy.get('@editor').type('{command}k');
            cy.get('@editor').type('{command}l');
        } else {
            cy.get('@editor').type('{ctrl}k');
            cy.get('@editor').type('{ctrl}l');
        }

        cy.get('.MuiPaper-root > .js-plotly-plot').should('be.visible');
        cy.wait(WAIT_TIME_OUT);
    });

    it('still render Audio', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').as('editor');
        cy.get('@editor').focus();
        cy.get('@editor').type(codeTestAudio);
        cy.get('@editor').type('{selectall}');
        if (isMacOSPlatform()) {
            cy.get('@editor').type('{command}k');
            cy.get('@editor').type('{command}l');
        } else {
            cy.get('@editor').type('{ctrl}k');
            cy.get('@editor').type('{ctrl}l');
        }

        cy.get('.MuiPaper-root > audio').should('be.visible');

        cy.wait(WAIT_TIME_OUT);
    });

    it('still render Video', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').as('editor');
        cy.get('@editor').focus();
        cy.get('@editor').type(codeTestVideo);
        cy.get('@editor').type('{selectall}');
        if (isMacOSPlatform()) {
            cy.get('@editor').type('{command}k');
            cy.get('@editor').type('{command}l');
        } else {
            cy.get('@editor').type('{ctrl}k');
            cy.get('@editor').type('{ctrl}l');
        }

        cy.get('.MuiPaper-root > video').should('be.visible');

        cy.wait(WAIT_TIME_OUT);
    });

    it('still render Image JPG', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').as('editor');
        cy.get('@editor').focus();
        cy.get('@editor').type(codeTestImageJPG);
        cy.get('@editor').type('{selectall}');
        if (isMacOSPlatform()) {
            cy.get('@editor').type('{command}k');
            cy.get('@editor').type('{command}l');
        } else {
            cy.get('@editor').type('{ctrl}k');
            cy.get('@editor').type('{ctrl}l');
        }

        cy.get('.MuiPaper-root > img').should('be.visible');

        cy.wait(WAIT_TIME_OUT);
    });

    it('still render Image PNG', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').as('editor');
        cy.get('@editor').focus();
        cy.get('@editor').type(codeTestImagePNG);
        cy.get('@editor').type('{selectall}');
        if (isMacOSPlatform()) {
            cy.get('@editor').type('{command}k');
            cy.get('@editor').type('{command}l');
        } else {
            cy.get('@editor').type('{ctrl}k');
            cy.get('@editor').type('{ctrl}l');
        }

        cy.get('.MuiPaper-root > img').should('be.visible');

        cy.wait(WAIT_TIME_OUT);
    });
});

describe('Test Save Events', () => {
    before(() => {
        cy.visit('/');
        cy.get('[toolbarname="main.py"]').trigger("click");
    })

    beforeEach(() => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').as('editor');
        removeText(cy.get('@editor'));
    })

    it('still save file successfully after timeout', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').as('editor');
        cy.get('@editor').focus();
        const code = randomString(); 
        cy.get('@editor').type(`print("${code}")`);
        cy.wait(SAVE_TIMEOUT_DURATION);
        cy.wait(2000);
        cy.reload();
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').contains(code)

        cy.wait(WAIT_TIME_OUT);
    });

    it('still save events on reload', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').as('editor');
        cy.get('@editor').focus();
        const code = randomString();
        cy.get('@editor').type(`print("${code}")`);
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
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').contains(code)

        cy.wait(WAIT_TIME_OUT);
    })

    it ('still save events on file change', () => {
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').as('editor');
        cy.get('@editor').focus();
        const code = randomString();
        cy.get('@editor').type(`print("${code}")`);
        cy.get('@editor').type('{selectall}');
        if (isMacOSPlatform()) {
            cy.get('@editor').type('{command}k');
            cy.get('@editor').type('{command}l');
        } else {
            cy.get('@editor').type('{ctrl}k');
            cy.get('@editor').type('{ctrl}l');
        }

        // This is hacky
        cy.get('[toolbarname="data_loader.py"]').click()
        cy.get('[toolbarname="main.py"]').click()
        cy.get('#CodeOutputContent > :nth-child(1)').contains(code);
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').contains(code)

        cy.wait(WAIT_TIME_OUT);
    })

});


