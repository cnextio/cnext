// const WAIT_1S = Cypress.env("wait_1s");
// const WAIT_2S = Cypress.env("wait_2s");
// const WAIT_3S = Cypress.env("wait_3s");

// describe("Test Project Management", () => {
//     before(() => {
//         cy.visit("/");
//         cy.wait(WAIT_3S);
//     });

//     it("Check load project with empty workspace", () => {
//         cy.writeFile("../../server/workspace.yaml", "");
//         cy.visit("/");
//         cy.wait(WAIT_2S);
//         cy.get("#sidebar_Projects").should("be.visible").click();

//         cy.window()
//             .its("store")
//             .invoke("getState")
//             .its("projectManager")
//             .its("activeProject")
//             .should("be.null");

//         cy.window()
//             .its("store")
//             .invoke("getState")
//             .its("projectManager")
//             .its("workspaceMetadata")
//             .then((workspaceMetadata) => {
//                 assert.equal(workspaceMetadata["active_project"], null);
//             });
//     });

//     it("Check load project with existed project in workspace", () => {
//         cy.writeFile(
//             "../../server/workspace.yaml",
//             `active_project: ae453c96-ec95-11ec-95e6-acde48001122
// open_projects:
// - id: ae453c96-ec95-11ec-95e6-acde48001122
//   name: test_add
//   path: cnext_sample_projects/test_add
// `
//         );
//         cy.visit("/");
//         cy.wait(WAIT_2S);
//         cy.get("#sidebar_Projects").should("be.visible").click();
//         cy.wait(WAIT_2S);
//         cy.get(".MuiTreeItem-content").contains("test_add").should("be.visible");
//         cy.window()
//             .its("store")
//             .invoke("getState")
//             .its("projectManager")
//             .its("activeProject")
//             .then((activeProject) => {
//                 assert.equal(activeProject["id"], "ae453c96-ec95-11ec-95e6-acde48001122");
//             });

//         cy.window()
//             .its("store")
//             .invoke("getState")
//             .its("projectManager")
//             .its("workspaceMetadata")
//             .then((workspaceMetadata) => {
//                 assert.equal(
//                     workspaceMetadata["active_project"],
//                     "ae453c96-ec95-11ec-95e6-acde48001122"
//                 );
//                 assert.equal(
//                     workspaceMetadata["open_projects"][0]["id"],
//                     "ae453c96-ec95-11ec-95e6-acde48001122"
//                 );
//                 assert.equal(workspaceMetadata["open_projects"][0]["name"], "test_add");
//             });
//     });

//     // it("Check add project with empty workspace", () => {
//     //     cy.writeFile("../../server/workspace.yaml", "");
//     //     cy.visit("/");
//     //     cy.wait(WAIT_2S);
//     //     cy.get("#sidebar_Projects").should("be.visible").click();
//     //     cy.wait(WAIT_1S);
//     //     cy.get("#add-project-button").should("be.visible").click();
//     //     let newProjectInput = cy.get("#new-project-input");
//     //     newProjectInput.focus();
//     //     newProjectInput
//     //         .type("/Users/vicknguyen/Desktop/PROJECTS/CYCAI/SAMPLE-PROJECT/test_add_project")
//     //         .type("{enter}");

//     //     cy.wait(WAIT_3S);
//     //     cy.get(".MuiTreeItem-label").contains("test_add_project").should("be.visible");

//     //     cy.window()
//     //         .its("store")
//     //         .invoke("getState")
//     //         .its("projectManager")
//     //         .its("activeProject")
//     //         .then((activeProject) => {
//     //             assert.equal(activeProject["name"], "test_add_project");
//     //         });

//     //     cy.window()
//     //         .its("store")
//     //         .invoke("getState")
//     //         .its("projectManager")
//     //         .its("workspaceMetadata")
//     //         .then((workspaceMetadata) => {
//     //             assert.equal(workspaceMetadata["open_projects"][0]["name"], "test_add_project");
//     //         });
//     // });

//     it("Check add project with existed project in workspace", () => {
//         cy.writeFile(
//             "../../server/workspace.yaml",
//             `active_project: ae453c96-ec95-11ec-95e6-acde48001122
// open_projects:
// - id: ae453c96-ec95-11ec-95e6-acde48001122
//   name: test_add
//   path: cnext_sample_projects/test_add
// `
//         );
//         cy.visit("/");
//         cy.wait(WAIT_2S);
//         cy.get("#sidebar_Projects").should("be.visible").click();
//         cy.wait(WAIT_1S);
//         cy.get("#add-project-button").should("be.visible").click();
//         let newProjectInput = cy.get("#new-project-input");
//         newProjectInput.focus();
//         newProjectInput.type("cnext_sample_projects/test_add_project").type("{enter}");

//         cy.wait(WAIT_3S);
//         cy.get(".MuiTreeItem-label").contains("test_add_project").should("be.visible");

//         cy.window()
//             .its("store")
//             .invoke("getState")
//             .its("projectManager")
//             .its("activeProject")
//             .then((activeProject) => {
//                 assert.equal(activeProject["name"], "test_add_project");
//             });

//         cy.window()
//             .its("store")
//             .invoke("getState")
//             .its("projectManager")
//             .its("workspaceMetadata")
//             .then((workspaceMetadata) => {
//                 assert.equal(workspaceMetadata["open_projects"][1]["name"], "test_add_project");
//             });
//     });

//     it("Check change project", () => {
//         cy.writeFile(
//             "../../server/workspace.yaml",
//             `active_project: ae453c96-ec95-11ec-95e6-acde48001122
// open_projects:
// - id: ae453c96-ec95-11ec-95e6-acde48001122
//   name: project1
//   path: cnext_sample_projects/project1
// - id: 55fea33a-ecb6-11ec-95e6-acde48001122
//   name: project2
//   path: cnext_sample_projects/project2
// `
//         );
//         cy.visit("/");
//         cy.wait(WAIT_2S);
//         cy.get("#sidebar_Projects").should("be.visible").click();
//         cy.wait(WAIT_2S);
//         cy.get("p").contains("project2").dblclick();

//         cy.wait(WAIT_3S);
//         cy.window()
//             .its("store")
//             .invoke("getState")
//             .its("projectManager")
//             .its("activeProject")
//             .then((activeProject) => {
//                 assert.equal(activeProject["name"], "project2");
//             });

//         cy.window()
//             .its("store")
//             .invoke("getState")
//             .its("projectManager")
//             .its("workspaceMetadata")
//             .then((workspaceMetadata) => {
//                 assert.equal(
//                     workspaceMetadata["active_project"],
//                     "55fea33a-ecb6-11ec-95e6-acde48001122"
//                 );
//             });
//     });
// });
