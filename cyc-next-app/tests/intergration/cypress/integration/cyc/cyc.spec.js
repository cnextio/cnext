import {
    codeCheckConsole,
    codeTestDF,
    codeTestEditorState,
    codeTestMatplotBar,
    codeTestMatplotlibLine,
    codeTestMatplotlibTheCoherenceOfTwoSignals,
    codeTestPlotly,
    codeTestAudio,
    codeTestVideo,
    codeTestSaveState,
} from '../data/code-text';
const WAIT_TIME_OUT = 1000;
const SAVE_TIMEOUT_DURATION = 30000;

const isMacOSPlatform = () => {
    return Cypress.platform.includes('darwin');
}

const removeText = (editor) => {
    editor.type('{selectall}');
    editor.type('{del}');
};

const randomString = () => {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 10; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

describe('Check Code Editor', () => {

    before(() => {
        cy.visit('/');
        cy.wait(2000);
    })

    beforeEach(() => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        removeText(editor);
        cy.wait(2000);
    })

    it('Check print console', () => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        editor.type(codeCheckConsole);
        if (isMacOSPlatform()) {
            editor.type('{command}l');
        } else {
            editor.type('{ctrl}l');
        }
        cy.get('#CodeOutputContent > :nth-child(1)').contains('test');
        cy.wait(WAIT_TIME_OUT);
    });

    it('Check autocompletion', () => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        editor.type(codeTestDF);

        // make sure have autocompletion dialog
        editor.type('{enter}')
        editor.type('df.drop');
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
        editor = cy.get('@editor');
        editor.type('{backspace}');
        editor.type('{esc}');
        cy.get('.cm-tooltip-autocomplete').should('not.exist');

        // make sure have signature tooltip
        editor = cy.get('@editor');
        editor.type('p');
        editor.type('(');
        cy.get('.cm-tooltip-signature').should('be.visible');

        editor = cy.get('@editor');
        editor.type('{esc}');
        cy.get('.cm-tooltip-signature').should('not.exist');

        editor = cy.get('@editor');
        removeText(editor);
        editor.type(codeTestDF);
        if (isMacOSPlatform()) {
            editor.type('{command}l');
        } else {
            editor.type('{ctrl}l');
        }
        editor.type('{enter}');
        editor.type('df.drop("');
        cy.get('.cm-tooltip-autocomplete').should('be.visible');
        cy.wait(WAIT_TIME_OUT);
    });
    
});

describe('Check DataFrame', () => {
    before(() => {
        cy.visit('/');
        cy.wait(2000);

        // cy.get("#sidebar_ClearState", {timeout: 2000}).click();
        // cy.wait(2000);
    })

    beforeEach(() => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        removeText(editor);
        cy.wait(2000);
    })

    it('Check dataframe', () => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');

        editor.focus();
        cy.get('@editor').type(codeTestDF);
        cy.get('@editor').type('{selectall}');

        if (isMacOSPlatform()) {
            editor.type('{command}k');
            editor.type('{command}l');
        } else {
            editor.type('{ctrl}k');
            editor.type('{ctrl}l');
        }

        cy.wait(3000)
        
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
                assert.any(tableData, "df");
            });    

        // cy.window()
        //     .its('store')
        //     .invoke('getState')
        //     .its('dataFrames')
        //     .its('activeDataFrame')
        //     .its('df')
        //     .its('columns')
        //     .then((activeDataFrame) => {
        //         let i = 0;
        //         for (let key in columns) {
        //             i++;
        //         }
        //         // check have 20 colums
        //         assert.equal(i, 20);
        //     });

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

// describe('Check data in Redux store', () => {
//     before(() => {
//         cy.visit('/');
//         cy.wait(2000);
//     })

//     beforeEach(() => {
//         let editor = cy
//             .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
//             .as('editor');
//         editor.focus();
//         removeText(editor);
//         cy.wait(2000);
//     })

//     it('has expected CodeEditor state when typing', () => {
//         let editor = cy
//             .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
//             .as('editor');
//         editor.focus();
//         editor.type(codeTestEditorState);

//         cy.wait(3000);
//         // check file save state | saved or not
//         cy.window()
//             .its('store')
//             .invoke('getState')
//             .its('codeEditor.fileSaved')
//             .should('equal', true);

//         // check codeText
//         cy.window()
//             .its('store')
//             .invoke('getState')
//             .its('codeEditor')
//             .its('codeText')
//             .then((result) => {
//                 for (let key in result) {
//                     cy.log(key);
//                     assert.deepEqual(result[key], [`print('test1')`, `print('test2')`]);
//                 }
//             });

//         // check length code line
//         cy.window()
//             .its('store')
//             .invoke('getState')
//             .its('codeEditor')
//             .its('codeLines')
//             .then((result) => {
//                 for (let key in result) {
//                     cy.log(key);
//                     assert.equal(result[key].length, 2);
//                 }
//             });
//         cy.wait(WAIT_TIME_OUT);
//     });

//     it('has expected ProjectManager state', () => {
//         cy.window()
//             .its('store')
//             .invoke('getState')
//             .its('projectManager')
//             .its('openFiles')
//             .then((files) => {
//                 let i = 0;
//                 for (let key in files) {
//                     i++;
//                 }
//                 // check have 3 files
//                 assert.equal(i, 3);
//             });
//         cy.wait(WAIT_TIME_OUT);
//     });

//     it('has expected DataFrames state', () => {
//         let editor = cy
//             .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
//             .as('editor');
//         editor.focus();
//         // removeText(editor);
//         editor.type(codeTestDF);
//         if (isMacOSPlatform()) {
//             editor.type('{command}l');
//         } else {
//             editor.type('{ctrl}l');
//         }

//         cy.wait(3000);
//         cy.window()
//             .its('store')
//             .invoke('getState')
//             .its('dataFrames')
//             .its('metadata')
//             .its('cdf')
//             .its('columns')
//             .then((columns) => {
//                 let i = 0;
//                 for (let key in columns) {
//                     i++;
//                 }
//                 // check have 20 colums
//                 assert.equal(i, 20);
//             });
//         cy.wait(WAIT_TIME_OUT);
//     });
// });

describe('Check Rich output result', () => {

    before(() => {
        cy.visit('/');
        cy.wait(2000);

        // cy.get("#sidebar_ClearState", {timeout: 2000}).click();
        // cy.wait(2000);
    })

    beforeEach(() => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        removeText(editor);
        cy.wait(2000);
    })

    it('still render Matplotlib result', () => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        cy.wait(1000);
        cy.get('@editor').type(codeTestMatplotlibLine);
        cy.wait(1000);
        cy.get('@editor').type('{selectall}');
        if (isMacOSPlatform()) {
            editor.type('{command}k');
            editor.type('{command}l');
        } else {
            editor.type('{ctrl}k');
            editor.type('{ctrl}l');
        }

        cy.wait(1000);
        cy.get('.MuiPaper-root > img').should('be.visible');
        cy.wait(WAIT_TIME_OUT);
    });

    it('still render Plotly result', () => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        cy.wait(2000);
        editor = cy.get('@editor');
        editor.type(codeTestPlotly);
        editor = cy.get('@editor');
        editor.type('{selectall}');
        if (isMacOSPlatform()) {
            editor.type('{command}k');
            editor.type('{command}l');
        } else {
            editor.type('{ctrl}k');
            editor.type('{ctrl}l');
        }

        cy.wait(5000);
        cy.get('.MuiPaper-root > .js-plotly-plot').should('be.visible');
        cy.wait(WAIT_TIME_OUT);
    });

    it('still render Audio', () => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        cy.wait(1000);
        editor = cy.get('@editor');
        editor.type(codeTestAudio);
        cy.wait(1000);
        editor = cy.get('@editor');
        editor.type('{selectall}');
        if (isMacOSPlatform()) {
            editor.type('{command}k');
            editor.type('{command}l');
        } else {
            editor.type('{ctrl}k');
            editor.type('{ctrl}l');
        }

        cy.wait(3000);
        cy.get('.MuiPaper-root > audio').should('be.visible');

        cy.wait(WAIT_TIME_OUT);
    });

    it('still render Video', () => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        cy.wait(1000);
        editor = cy.get('@editor');
        editor.type(codeTestVideo);
        cy.wait(1000);
        editor = cy.get('@editor');
        editor.type('{selectall}');
        if (isMacOSPlatform()) {
            editor.type('{command}k');
            editor.type('{command}l');
        } else {
            editor.type('{ctrl}k');
            editor.type('{ctrl}l');
        }

        cy.wait(3000);
        cy.get('.MuiPaper-root > video').should('be.visible');

        cy.wait(WAIT_TIME_OUT);
    });
});

describe('Check Save Events', () => {
    before(() => {
        cy.visit('/');
        cy.wait(2000);

        // cy.get("#sidebar_ClearState", {timeout: 2000}).click();
        // cy.wait(2000);
    })

    beforeEach(() => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        removeText(editor);
        cy.wait(2000);
    })

    it('still save file successfully after timeout', () => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        cy.wait(1000);
        editor = cy.get('@editor');
        const code = randomString(); 
        editor.type(`print("${code}")`);
        cy.wait(1000);
        editor = cy.get('@editor');
        cy.wait(SAVE_TIMEOUT_DURATION);
        cy.wait(2000)
        cy.reload();
        cy.wait(1000);
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').contains(code)

        cy.wait(WAIT_TIME_OUT);
    });

    it('still save events on reload', () => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        cy.wait(1000);
        editor = cy.get('@editor');
        const code = randomString();
        editor.type(`print("${code}")`);
        cy.wait(1000);
        editor = cy.get('@editor');
        editor.type('{selectall}');
        if (isMacOSPlatform()) {
            editor.type('{command}k');
            editor.type('{command}l');
        } else {
            editor.type('{ctrl}k');
            editor.type('{ctrl}l');
        }

        cy.wait(3000);
        cy.reload();
        cy.wait(2000);
        cy.get('#CodeOutputContent > :nth-child(1)').contains(code);
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').contains(code)

        cy.wait(WAIT_TIME_OUT);
    })

    it ('still save events on file change', () => {
        let editor = cy
            .get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content')
            .as('editor');
        editor.focus();
        cy.wait(1000);
        editor = cy.get('@editor');
        const code = randomString();
        editor.type(`print("${code}")`);
        cy.wait(1000);
        editor = cy.get('@editor');
        editor.type('{selectall}');
        if (isMacOSPlatform()) {
            editor.type('{command}k');
            editor.type('{command}l');
        } else {
            editor.type('{ctrl}k');
            editor.type('{ctrl}l');
        }

        cy.wait(2000);
        // This is hacky
        cy.get('[toolbarname="data_loader.py"]').click()
        cy.wait(2000)
        cy.get('[toolbarname="main.py"]').click()
        cy.wait(2000);
        cy.get('#CodeOutputContent > :nth-child(1)').contains(code);
        cy.get('[data-cy="code-editor"] > .cm-editor > .cm-scroller > .cm-content').contains(code)

        cy.wait(WAIT_TIME_OUT);
    })

});


