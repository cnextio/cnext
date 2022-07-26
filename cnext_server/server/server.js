require("dotenv").config();
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const YAML = require("yaml");
const zmq = require("zeromq");
const path = require("path");
const { PythonShell } = require("python-shell");
const {
    LSPProcess,
    LanguageServer,
    LanguageServerHover,
    LanguageServerSignature,
    LanguageServerCompletion,
} = require("./ls/lsp_process");
const port = process.env.PORT || 4000;
const express = require('express');
const app = express();
const server = http.createServer(app);
const options = {
    cors: true,
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000,
};
const io = new socketIo.Server(server, options);

// TODO: move to Interfaces.tsx
const CodeEditor = "CodeEditor";
const DFManager = "DFManager";
const ModelManager = "ModelManager";
const FileManager = "FileManager";
const FileExplorer = "FileExplorer";
const MagicCommandGen = "MagicCommandGen";
const ExperimentManager = "ExperimentManager";
const KernelManager = "KernelManager";
const Terminal = "Terminal";
const CodeExecutor = [CodeEditor, DFManager, ModelManager, MagicCommandGen, KernelManager];
const NoneCodeExecutor = [ExperimentManager, FileManager, FileExplorer, Terminal];

const LSPExecutor = [
    LanguageServer,
    LanguageServerHover,
    LanguageServerSignature,
    LanguageServerCompletion,
];

const ServerConfigPath = "server.yaml";

try {
    let file;
    file = fs.readFileSync(ServerConfigPath, "utf8");
    config = YAML.parse(file);
} catch (error) {
    console.log(error.stack);
}

class PythonProcess {
    static io;

    // TODO: using clientMessage is hacky solution to send stdout back to client. won't work if there is multiple message being handled simultaneously
    constructor(io, commandStr, args) {
        process.env.PYTHONPATH = [process.env.PYTHONPATH, config.path_to_cnextlib, "./python"].join(
            path.delimiter
        );

        console.log("Environment path: ", process.env.PATH);

        let pyshellOpts = {
            stdio: ["pipe", "pipe", "pipe", "pipe"], // stdin, stdout, stderr, custom
            mode: "text",
            env: process.env,
            args: args,
        };

        this.executor = new PythonShell(commandStr, pyshellOpts);

        this.io = io;
        let _this = this;
        this.executor.on("message", function (stdout) {
            try {
                // console.log("On message: ", _this.clientMessage);
                // let replyMessage = JSON.parse(_this.clientMessage);
                // replyMessage["content"] = stdout;
                // _this.send2client(replyMessage);
                console.log("stdout: ", stdout);
            } catch (error) {
                console.log(error.stack);
            }
        });

        this.executor.on("stderr", function (stderr) {
            // let replyMessage = JSON.parse(_this.clientMessage);
            // console.log("stderr: forward output to client", replyMessage);
            // replyMessage['content'] = stderr;
            // replyMessage['type'] = 'str';
            // _this.send2client(replyMessage);
            console.log("stderr:", stderr);
        });

        this.executor.on("error", function (message) {
            console.log("error ", message);
        });

        this.executor.on("close", function (message) {
            console.log("close ", "python-shell closed: " + message);
        });

        if (args[0] === "code") {
            this.kernel_control_socket = new zmq.Push({ linger: 0 });
            const n2p_host = config.n2p_comm.host;
            const control_port = config.n2p_comm.kernel_control_port;
            const control_address = `${n2p_host}:${control_port}`;
            this.kernel_control_socket.connect(control_address);
        }
    }

    send2client(message) {
        this.io.emit(message["webapp_endpoint"], JSON.stringify(message));
    }

    send2executor(message) {
        this.clientMessage = message.slice();
        this.executor.send(message);
    }

    async send2kernel_manager(message) {
        try {
            if (this.kernel_control_socket != undefined) {
                console.log(`send2kernel_manager: ${message}`);
                await this.kernel_control_socket.send(message);
            }
        } catch (err) {
            console.log(err);
        }
    }

    shutdown(signal) {
        this.executor.kill(signal);
    }
}

/*
 * Communicate with web client
 */
/** this variable is used to send back stdout to server */
// let clientMessage;
try {
    app.use(express.static(path.resolve(__dirname, '../public')))

    io.on("connection", (socket) => {
        socket.on("ping", (message) => {
            const time = new Date().toLocaleString();
            console.log(`Got ping at ${time}: ${message}`);
            io.emit("pong", time);
        });

        socket.onAny((endpoint, message) => {
            //TODO: use enum
            if (CodeExecutor.includes(endpoint)) {
                console.log(
                    "Receive msg from client, server will run: ",
                    JSON.parse(message)["command_name"]
                );
                if (endpoint === KernelManager) {
                    // This is temporary solution, when refactor the nodejs completely conenct to python by ZMQ, we 'll refactor later
                    codeExecutor.send2kernel_manager(message);
                } else {
                    codeExecutor.send2executor(message);
                }
            } else if (NoneCodeExecutor.includes(endpoint)) {
                // nonCodeExecutor.send2executor(message);
                console.log(
                    "Receive msg from client, server will run:",
                    JSON.parse(message)["command_name"]
                );
                nonCodeExecutor.send2executor(message);
            } else if (LSPExecutor.includes(endpoint)) {
                lspExecutor.sendMessageToLsp(message);
            }
        });
        socket.once("disconnect", () => {});
    });

    const sendOutput = (message) => {
        io.emit(message["webapp_endpoint"], JSON.stringify(message));
    };

    server.listen(port, () => console.log(`Waiting on port ${port}`));

    console.log("Starting python shell...");
    let codeExecutor = new PythonProcess(io, `python/server.py`, ["code"]);
    let nonCodeExecutor = new PythonProcess(io, `python/server.py`, ["noncode"]);
    let lspExecutor = new LSPProcess(io);
    /**
     * ZMQ communication from python-shell to node server
     */
    async function zmq_receiver() {
        const command_output_zmq = new zmq.Pull();
        const p2n_host = config.p2n_comm.host;
        const p2n_port = config.p2n_comm.port;
        await command_output_zmq.bind(`${p2n_host}:${p2n_port}`);
        console.log(`Waiting for python executor message on ${p2n_port}`);
        for await (const [message] of command_output_zmq) {
            const jsonMessage = JSON.parse(message.toString());
            console.log(`command_output_zmq: forward output to ${jsonMessage["webapp_endpoint"]}`);
            sendOutput(jsonMessage);
        }
    }

    zmq_receiver().catch((e) => console.error("ZMQ_error: ", e.stack));

    process.on("SIGINT", function () {
        codeExecutor.shutdown("SIGINT");
        nonCodeExecutor.shutdown("SIGINT");
        process.exit(1);
    });

    process.on("SIGTERM", function () {
        codeExecutor.shutdown("SIGTERM");
        nonCodeExecutor.shutdown("SIGTERM");
        process.exit(1);
    });
} catch (error) {
    console.log(error);
}
