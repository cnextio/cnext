require("dotenv").config();
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const YAML = require("yaml");
const zmq = require("zeromq");
const path = require("path");
const { nanoid } = require("nanoid");
const { eventLog } = require("./eventLog");
// const { instrument } = require("@socket.io/admin-ui");
const { PythonShell } = require("python-shell");
const {
    LSPProcess,
    LanguageServer,
    LanguageServerHover,
    LanguageServerSignature,
    LanguageServerCompletion,
} = require("./ls/lsp_process");
const port = process.env.PORT || 4000;
const express = require("express");
const app = express();
const server = http.createServer(app);
const options = {
    cors: true,
    maxHttpBufferSize: 1e8,
    pingInterval: 30000,
    pingTimeout: 60000,
};
const io = new socketIo.Server(server, options);
const httpProxyMiddleware = require("http-proxy-middleware");

// TODO: move to Interfaces.tsx
const CodeEditor = "CodeEditor";
const DFManager = "DFManager";
const ModelManager = "ModelManager";
const FileManager = "FileManager";
const FileExplorer = "FileExplorer";
const MagicCommandGen = "MagicCommandGen";
const ExperimentManager = "ExperimentManager";
const ExecutorManager = "ExecutorManager";
const Terminal = "Terminal";
const LogsManager = "LogsManager";
const EnvironmentManager = "EnvironmentManager";
const CodeEndpoints = [
    CodeEditor,
    DFManager,
    ModelManager,
    MagicCommandGen,
    ExecutorManager,
    EnvironmentManager,
];
const NonCodeEndpoints = [ExperimentManager, FileManager, FileExplorer, Terminal, LogsManager];

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

const create_socket = (host, port) => {
    const newSocket = new zmq.Push({ linger: 0 });
    newSocket.connect(`${host}:${port}`);
    return newSocket;
};

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
        this.executorCommChannel = {};
        this.io = io;
        let _this = this;

        this.executor.on("message", function (stdout) {
            try {
                console.log("stdout: ", stdout);
            } catch (error) {
                console.log(error.stack);
            }
        });

        this.executor.on("stderr", function (stderr) {
            console.log("stderr:", stderr);
        });

        this.executor.on("error", function (message) {
            console.log("error ", message);
        });

        this.executor.on("close", function (message) {
            console.log("close ", "python-shell closed: " + message);
        });

        const mode = args[0];
        let endpoins = [];
        if (mode === "code") {
            endpoins = CodeEndpoints;
        } else if (mode === "noncode") {
            endpoins = NonCodeEndpoints;
        }
        for (let endpoint of endpoins) {
            /** only ExecutorManager use zmq now. TODO: move everything to zmq */
            if (endpoint === ExecutorManager) {
                this.executorCommChannel[ExecutorManager] = create_socket(
                    config.n2p_comm.host,
                    config.n2p_comm.kernel_control_port
                );
            } else {
                this.executorCommChannel[endpoint] = this.executor;
            }
        }
    }

    send2client(message) {
        this.io.emit(message["webapp_endpoint"], JSON.stringify(message));
    }

    async send2executor(endpoint, message) {
        await this.executorCommChannel[endpoint].send(message);
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
    app.use(express.static(path.resolve(__dirname, "../public")));
    const proxy = httpProxyMiddleware.createProxyMiddleware({
        target: "http://127.0.0.1:5008",
        changeOrigin: true,
        pathRewrite: { "^/jps": "" },
        ws: true,
    });
    app.use("/jps", proxy);

    let clientSocket;
    let pendingMessagesForSocket = [];
    io.on("connection", (socket) => {
        console.log("Socket connected >>>>> sid =", socket.id);
        clientSocket = socket;

        socket.on("ping", (message) => {
            const time = new Date().toLocaleString();
            console.log(`Got ping at ${time}: ${message}`);
            io.emit("pong", time);
        });

        socket.onAny((endpoint, message) => {
            //TODO: use enum
            if (CodeEndpoints.includes(endpoint)) {
                let jsonMessage = JSON.parse(message);
                if (jsonMessage.command_name !== "get_status") {
                    console.log(
                        "Receive msg from client, server will run:",
                        jsonMessage["command_name"]
                    );
                }
                codeExecutor.send2executor(endpoint, message);
            } else if (NonCodeEndpoints.includes(endpoint)) {
                let jsonMessage = JSON.parse(message);
                console.log(
                    "Receive msg from client, server will run:",
                    jsonMessage["command_name"]
                );
                nonCodeExecutor.send2executor(endpoint, message);
            } else if (LSPExecutor.includes(endpoint)) {
                lspExecutor.sendMessageToLsp(message);
            }
        });

        socket.on("reconnect", () => {
            /** resend the message in queue upon reconnected */
            console.log("Socket reconnect sid =", socket.id);
            for (const messageQueueItem of pendingMessagesForSocket) {
                // console.log("Sending queued message");
                let message = messageQueueItem.content;
                socket.emit(message["webapp_endpoint"], JSON.stringify(message), function () {
                    let mid = messageQueueItem.id;
                    // console.log(
                    //     `received ack on message mid=${mid} pendingMessagesForSocket.length=${pendingMessagesForSocket.length}`
                    // );
                    pendingMessagesForSocket = pendingMessagesForSocket.filter(
                        (messageQueueItem) => {
                            return messageQueueItem.id != mid;
                        }
                    );
                });
            }
        });

        socket.on("init", () => {
            console.log("Init message queue for socket with id: ", socket.id); // "ping timeout"
            pendingMessagesForSocket = [];
        });

        socket.on("disconnect", (reason) => {
            clientSocket = null;
            console.log("Socket disconnected: ", reason); // "ping timeout"
        });
    });

    const sendOutput = (message) => {
        const mid = nanoid();
        pendingMessagesForSocket.push({ id: mid, content: message });
        // console.log(
        //     `Sending message pendingMessagesForSocket.length = ${pendingMessagesForSocket.length} mid=${mid} message.webapp_endpoint=${message["webapp_endpoint"]}`
        // );
        if (clientSocket) {
            /** FIXME: there is a slight chance that this message will be send right after the socket is reconnected and before
             * the rest of the queue has been sent. If that is the case the order of received message may be off */
            clientSocket.emit(message["webapp_endpoint"], JSON.stringify(message), function () {
                // console.log(
                //     `received ack on message mid=${mid} pendingMessagesForSocket.length=${pendingMessagesForSocket.length}`
                // );
                pendingMessagesForSocket = pendingMessagesForSocket.filter((messageQueueItem) => {
                    return messageQueueItem.id != mid;
                });
            });
        }
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
            if (jsonMessage.command_name !== "get_status") {
                console.log(
                    `command_output_zmq: forward output to ${jsonMessage["webapp_endpoint"]}`
                );
            }
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

    if (!process.env.EVENT_LOG_DISABLE) {
        eventLog();
    }
} catch (error) {
    console.log(error);
}
