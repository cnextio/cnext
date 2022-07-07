const { exec } = require("child_process");

// action channel

class JupyterProcess {
    constructor(io, config) {
        this.io = io;
        this.config = config;
    }
    runServer() {
        exec(
            `jupyter server --port=${this.config.port} --ServerApp.allow_origin=* --ServerApp.token=${this.config.token}`,
            (err, output) => {
                if (err) {
                    console.error("could not execute command: ", err);
                    return;
                }
            }
        );
    }
}
module.exports = {
    JupyterProcess,
};
