const { spawn } = require("child_process");
const get_jupyter_server_config = `get_jupyter_server_config;`;

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
    getJupyterServerConfig(endpoint) {
        try {
            const message = {
                webapp_endpoint: endpoint,
                command_name: get_jupyter_server_config,
                content: this.config,
                error: false,
            };
            this.io.emit(endpoint, JSON.stringify(message));
        } catch (error) {}
    }
}
module.exports = {
    JupyterProcess,
};
