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
const CodeExecutor = [CodeEditor, DFManager, ModelManager, MagicCommandGen];
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
            config.path_to_cnext_libs,
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
                console.log("On message: ", _this.clientMessage);
                let replyMessage = JSON.parse(_this.clientMessage);
                console.log("stdout: forward output to client", replyMessage);
                // replyMessage["content"] = stdout;
                // _this.send2client(replyMessage);
            } catch (error) {
                console.log(error.stack);
            }
        });

        this.executor.on("stderr", function (stderr) {
            let replyMessage = JSON.parse(_this.clientMessage);
            console.log("stderr: forward output to client", replyMessage);
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
                codeExecutorHandler(message);
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
            const json_message = JSON.parse(message.toString());
            // console.log(
            //     `command_output_zmq: forward output to ${json_message["webapp_endpoint"]} content=`, json_message["content"]
            // );
            console.log(`command_output_zmq: forward output to ${json_message["webapp_endpoint"]}`);
            sendOutput(json_message);
        }
    }

    zmq_receiver().catch((e) => console.error("ZMQ_error: ", e.stack));
    /** */

    const initialize = () => {
        codeExecutor.send2executor(
            JSON.stringify({
                webapp_endpoint: CodeEditor,
                content: `import os, sys, netron; sys.path.extend(['${config.path_to_cnext_libs}/', 'python/']); os.chdir('${config.projects.open_projects[0]["path"]}')`,
            })
        );

        codeExecutor.send2executor(
            JSON.stringify({
                webapp_endpoint: CodeEditor,
                content: `
import torch.nn as nn
import torch
class ToyModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.lin1 = nn.Linear(3, 3)
        self.relu = nn.ReLU()
        self.lin2 = nn.Linear(3, 2)

        # initialize weights and biases
        self.lin1.weight = nn.Parameter(torch.arange(-4.0, 5.0).view(3, 3))
        self.lin1.bias = nn.Parameter(torch.zeros(1, 3))
        self.lin2.weight = nn.Parameter(torch.arange(-3.0, 3.0).view(2, 3))
        self.lin2.bias = nn.Parameter(torch.ones(1, 2))

    def forward(self, input):
        return self.lin2(self.relu(self.lin1(input)))
    
    def createInput(self):
        return torch.randn(1, 3, 3)

model = ToyModel()
        `,
            })
        );

        //         codeExecutor.send2executor(
        //             JSON.stringify({
        //                 webapp_endpoint: CodeEditor,
        //                 content: `
        // import tensorflow as tf
        // inputs = tf.keras.Input(shape=(3,))
        // x = tf.keras.layers.Dense(4, activation=tf.nn.relu)(inputs)
        // outputs = tf.keras.layers.Dense(5, activation=tf.nn.softmax)(x)
        // model = tf.keras.Model(inputs=inputs, outputs=outputs)
        // `,
        //             })
        //         );

        codeExecutor.send2executor(
            JSON.stringify({
                webapp_endpoint: CodeEditor,
                content: `
import tensorflow as tf
model1 = tf.keras.models.Sequential([
    tf.keras.layers.Flatten(input_shape=(28, 28)),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(10)
])              
`,
            })
        );

        // codeExecutor.send2executor(
        //     JSON.stringify({
        //         webapp_endpoint: ModelManager,
        //         command_name: `get_active_models`,
        //     })
        // );

        // nonCodeExecutor.send2executor(
        //     JSON.stringify({
        //         webapp_endpoint: ExperimentManager,
        //         content: 'import mlflow, mlflow.tensorflow',
        //     })
        // );
    };

    initialize();
} catch (error) {
    console.log(error);
}
