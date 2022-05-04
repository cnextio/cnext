require("dotenv").config();
const express = require("express");
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
const server = http.createServer();
const options = {
    cors: {
        origin: [process.env.CLIENT_URL],
        methods: ["GET", "POST"],
    },
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
const CodeExecutor = [CodeEditor, DFManager, ModelManager, MagicCommandGen, KernelManager];
const NotCodeExecutor = [ExperimentManager, FileManager, FileExplorer];

const LSPExecutor = [
    LanguageServer,
    LanguageServerHover,
    LanguageServerSignature,
    LanguageServerCompletion,
];

try {
    let file;
    file = fs.readFileSync(".server.yaml", "utf8");
    config = YAML.parse(file);
} catch (error) {
    console.log(error.stack);
}

class PythonProcess {
    static io;

    // TODO: using clientMessage is hacky solution to send stdout back to client. won't work if there is multiple message being handled simultaneously
    constructor(io, commandStr, args) {
        process.env.PYTHONPATH = [
            process.env.PYTHONPATH,
            config.path_to_cnextlib,
            "./python/",
        ].join(path.delimiter);
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
                // console.log("stdout: forward output to client", replyMessage);
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
    }

    send2client(message) {
        this.io.emit(message["webapp_endpoint"], JSON.stringify(message));
    }

    send2executor(message) {
        this.clientMessage = message.slice();
        this.executor.send(message);
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
    io.on("connection", (socket) => {
        function codeExecutorHandler(strMessage) {
            // clientMessage = strMessage.slice();
            console.log(
                "Receive msg from client, server will run: ",
                JSON.parse(strMessage)["command_name"]
            );
            codeExecutor.send2executor(strMessage);
        }

        function nonCodeExecutorHandler(strMessage) {
            // clientMessage = strMessage.slice();
            console.log(
                "Receive msg from client, server will run: ",
                JSON.parse(strMessage)["command_name"]
            );
            nonCodeExecutor.send2executor(strMessage);
        }

        socket.on("ping", (message) => {
            const time = new Date().toLocaleString();
            console.log(`Got ping at ${time}: ${message}`);
            io.emit("pong", time);
        });

        socket.onAny((endpoint, message) => {
            //TODO: use enum
            if (CodeExecutor.includes(endpoint)) {
                if (endpoint === KernelManager) {
                    // This is temporary solution, when refactor the nodejs completely conenct to python by ZMQ, we 'll refactor later
                    zmq_sender(message);
                } else {
                    codeExecutorHandler(message);
                }
            } else if (NotCodeExecutor.includes(endpoint)) {
                nonCodeExecutorHandler(message);
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
     * ZMQ communication from node server to python-shell
     */
    async function zmq_sender(message) {
        const sock = new zmq.Push({ linger: 0 });
        const n2p_host = config.p2n_comm.host;
        const n2p_port = config.p2n_comm.n2p_port;
        const n2p_address = `${n2p_host}:${n2p_port}`;
        sock.connect(n2p_address);
        try {
            const jsonMessage = JSON.parse(message.toString());
            console.log(`command_input_zmq: forward input to ${jsonMessage["webapp_endpoint"]}`);
            await sock.send(message);
            // new Promise((resolve) => setTimeout(resolve, 500));
        } catch (err) {
            console.log(err);
        } finally {
            sock.close();
        }
    }

    /**
     * ZMQ communication from python-shell to node server
     */
    async function zmq_receiver() {
        const command_output_zmq = new zmq.Pull();
        const p2n_host = config.p2n_comm.host;
        const p2n_port = config.p2n_comm.p2n_port;
        await command_output_zmq.bind(`${p2n_host}:${p2n_port}`);

        // notification_zmq.bind(`${p2n_host}:${p2n_notif_port}`);
        console.log(`Waiting for python executor message on ${p2n_port}`);

        for await (const [message] of command_output_zmq) {
            const jsonMessage = JSON.parse(message.toString());
            console.log(`command_output_zmq: forward output to ${jsonMessage["webapp_endpoint"]}`);
            sendOutput(jsonMessage);
        }
    }

    zmq_receiver().catch((e) => console.error("ZMQ_error: ", e.stack));
    /** */

    // process.on("exit", function () {});

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

    const initialize = () => {
        // codeExecutor.send2executor(
        //     JSON.stringify({
        //         webapp_endpoint: CodeEditor,
        //         content: `import os, sys, netron; sys.path.extend(['${config.path_to_cnextlib}/', 'python/']); os.chdir('${config.projects.open_projects[0]["path"]}')`,
        //     })
        // );
        const message = {
            webapp_endpoint: KernelManager,
            command_name: "interrupt_kernel",
        };
        // zmq_sender(JSON.stringify(message));

    };

    initialize();
} catch (error) {
    console.log(error);
}
