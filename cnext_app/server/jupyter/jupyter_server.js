const { exec, spawn } = require("child_process");
const ConfigTerminal = "ConfigTerminal";
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
        this.jupyterServer.stdout.on("data", (chunk) => {});

        this.jupyterServer.stderr.on("data", (stderr) => {});
    }

    sendMessageToJupter(message) {
        this.jupyterServer.stdin.write(message);
    }
    shutdown(signal) {
        this.jupyterServer.kill(signal);
    }
    setConfig(endpoint, message) {
        try {
            this.io.emit(
                endpoint,
                JSON.stringify({
                    config: config.jupyter_server,
                    content: message["content"],
                })
            );
        } catch (error) {}
    }
}
module.exports = {
    JupyterProcess,
};
