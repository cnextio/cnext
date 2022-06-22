const { defineConfig } = require("cypress");
module.exports = defineConfig({
    projectId: "4rrkju",
    defaultCommandTimeout: 10000,
    video: false,
    reporter: "mocha-junit-reporter",
    reporterOptions: {
        testsuitesTitle: true,
        mochaFile: "./cypress/reports/junit.[hash].xml",
    },
    env: {
        wait_500mls: 500,
        wait_1s: 1000,
        wait_2s: 2000,
        wait_3s: 3000,
        wait_5s: 5000,
        wait_10s: 10000,
    },
    e2e: {
        // We've imported your old cypress plugins here.
        // You may want to clean this up later by importing these.
        setupNodeEvents(on, config) {
            return require("./cypress/plugins/index.js")(on, config);
        },
        baseUrl: "http://web:3000",
        specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    },
});
