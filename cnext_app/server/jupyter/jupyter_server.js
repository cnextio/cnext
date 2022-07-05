const { exec } = require("child_process");
// action channel

class JupyterProcess {
    constructor(io) {}
    runServer() {
        exec("cd jupyter && jupyter server", (err, output) => {
            if (err) {
                console.error("could not execute command: ", err);
                return;
            }
        });
    }
}
module.exports = {
    JupyterProcess,
};
