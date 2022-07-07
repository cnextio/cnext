const { exec, spawn } = require("child_process");

// action channel

class JupyterProcess {
    constructor(io, config) {
        this.io = io;
        this.config = config;
        this.jupyterServer = spawn(
            `jupyter server --port=${this.config.port} --ServerApp.allow_origin=* --ServerApp.token=${this.config.token}`,
            [],
            { shell: true }
        );
        this.jupyterServer.stdout.on("data", (chunk) => {
            console.log(`Jupyter Server`, chunk.toString());
        });

        this.jupyterServer.stderr.on("data", (stderr) => {
            console.log("Jupyter Server", stderr.toString());
        });
    }

    sendMessageToJupter(message) {
        this.jupyterServer.stdin.write(message);
    }
    shutdown(signal) {
        this.jupyterServer.kill(signal);
    }
}
module.exports = {
    JupyterProcess,
};
