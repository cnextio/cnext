const { exec, spawn } = require("child_process");

// action channel

class JupyterProcess {
    constructor(io, config) {
        this.io = io;
        this.config = config;
        this.ls = spawn(
            `jupyter server --port=${this.config.port} --ServerApp.allow_origin=* --ServerApp.token=${this.config.token}`,
            [],
            { shell: true }
        );
        this.ls.stdout.on("data", (chunk) => {
            console.log(`Jupyter Server`, chunk.toString());
        });

        this.ls.stderr.on("data", (stderr) => {
            console.log("Jupyter Server", stderr.toString());
        });
    }

    sendMessageToJupter(message) {
        this.ls.stdin.write(message);
    }
}
module.exports = {
    JupyterProcess,
};
