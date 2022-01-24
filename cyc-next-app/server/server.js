const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require('fs');
const YAML = require('yaml');
const zmq = require("zeromq");
const { PythonShell } = require('python-shell');

const port = process.env.PORT || 4000;
const server = http.createServer();
const options = {
    cors: {
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST"]
    },
};
const io = new socketIo.Server(server, options);
let ready = false;

// TODO: move to Interfaces.tsx
const CodeEditor = 'CodeEditor';
const DFManager = 'DFManager';
const FileManager = 'FileManager';
const FileExplorer = 'FileExplorer';
const MagicCommandGen = 'MagicCommandGen';
const ExperimentManager = 'ExperimentManager';
const CodeExecutor = [CodeEditor, DFManager, FileManager, FileExplorer, MagicCommandGen];
const NotCodeExecutor = [ExperimentManager];

// enum PyShellType {
//     CODE_EXECUTOR = 'code-executor',
//     NON_CODE_EXECUTOR = 'non_code-executor',
// }

class PythonProcess {
    static pyshellOpts = {
        pythonPath: '/Users/bachbui/miniforge3-m1/envs/py39-m1/bin/python',
        stdio:
            ['pipe', 'pipe', 'pipe', 'pipe'], // stdin, stdout, stderr, custom
        mode: 'text',
        env: process.env
    }
    
    send2client(message) {
        this.io.emit(message['webapp_endpoint'], JSON.stringify(message));
    }
    
    static io;
    
    // TODO: using clientMessage is hacky solution to send stdout back to client. won't work if there is multiple message being handled simultaneously
    constructor(io) {
        // this.pyshellOpts.args = [type];
        this.executor = new PythonShell('server.py', this.pyshellOpts);
        this.io = io;
        let _this = this;
        this.executor.on('message', function(stdout) {
            try {   
                console.log('On message: ', _this.clientMessage);                
                let replyMessage = JSON.parse(_this.clientMessage);
                replyMessage['content'] = stdout;
                console.log('stdout: forward output to client', replyMessage);
                _this.send2client(replyMessage);         
            } catch (error) {
                console.log(error.stack);
            }
        });
    
        this.executor.on('stderr', function (stderr) {
            let replyMessage = JSON.parse(_this.clientMessage);
            replyMessage['content'] = stderr;
            replyMessage['type'] = "str";
            console.log('stderr: forward output to client', replyMessage);
            _this.send2client(replyMessage);            
            console.log('stderr:', stderr);
        });
    
        this.executor.on('error', function (message) {
            console.log('error ', message);
        })
    
        this.executor.on('close', function (message) {
            console.log('close ', "python-shell closed: " + message);
        })
    }
    
    send2executor(message) {
        this.clientMessage = message.slice();
        console.log('On message: ', this.clientMessage);                
        this.executor.send(message);
    }
    
    
}
/*
* Communicate with web client
*/
try {
    let file;
    file = fs.readFileSync('.server.yaml', 'utf8');
    config = YAML.parse(file);

    /** this variable is used to send back stdout to server */
    // let clientMessage;

    io.on("connection", (socket) => {
        function codeExecutorHandler(strMessage){
            // clientMessage = strMessage.slice();
            console.log("Receive msg from client, server will run: ", JSON.parse(strMessage));         
            codeExecutor.send2executor(strMessage);
        }

        function nonCodeExecutorHandler(strMessage){
            // clientMessage = strMessage.slice();
            console.log("Receive msg from client, server will run: ", JSON.parse(strMessage));         
            nonCodeExecutor.send2executor(strMessage);
        }

        socket.on("ping", message => {
            const minutes = new Date().getMinutes();
            console.log(`Got ping at ${minutes}: ${message}` );
            io.emit("pong", minutes);
        });

        socket.onAny((endpoint, message) => {  //TODO: use enum 
            if(CodeExecutor.includes(endpoint)) {   
                codeExecutorHandler(message);
            }
            else if(NotCodeExecutor.includes(endpoint)) {
                nonCodeExecutorHandler(message);
            }
        });

        socket.once("disconnect", () => {
        });
    });

    const sendOutput = (message) => {
        io.emit(message['webapp_endpoint'], JSON.stringify(message));
    }

    server.listen(port, () => console.log(`Waiting on port ${port}`));
    
    console.log("Starting python shell...");
    let codeExecutor = new PythonProcess(io);
    let nonCodeExecutor = new PythonProcess(io);
    
    /**
     * ZMQ communication from python-shell to node server
     */    
    async function zmq_receiver() {
        const command_output_zmq = new zmq.Pull; 

        const p2n_host = config.p2n_comm.host; 
        const p2n_port = config.p2n_comm.p2n_port;
        await command_output_zmq.bind(`${p2n_host}:${p2n_port}`);
        
        // notification_zmq.bind(`${p2n_host}:${p2n_notif_port}`);    
        console.log(`Waiting for python executor message on ${p2n_port}`);
    
        for await (const [message] of command_output_zmq) {
            const json_message = JSON.parse(message.toString());
            console.log(`command_output_zmq: forward output of command_name ${json_message['command_name']}`);
            sendOutput(json_message);         
        }
    };
    zmq_receiver().catch(e => console.error("ZMQ_error: ", e.stack));
    /** */

    const initialize = () => {
        codeExecutor.send2executor(JSON.stringify({webapp_endpoint: CodeEditor, content: 'import os, sys, pandas as pd, plotly.express as px, plotly.io as pio'}));
        codeExecutor.send2executor(JSON.stringify({webapp_endpoint: CodeEditor, content: 'from cycdataframe.cycdataframe import CycDataFrame'}));
        // console.log(config.projects.open_projects[0]['path'])
        codeExecutor.send2executor(JSON.stringify({webapp_endpoint: CodeEditor, content: `pio.renderers.default = "json"; sys.path.append('${config.path_to_cycdataframe_lib}cycdataframe/'); os.chdir('${config.projects.open_projects[0]['path']}');`}));
        nonCodeExecutor.send2executor(JSON.stringify({webapp_endpoint: ExperimentManager, content: 'import mlflow, mlflow.tensorflow'}));
        
        // pyshell.send({webapp_endpoint: CodeEditorComponent, 
        //                 content: "df = CycDataFrame('tests/data/machine-simulation/21549286_out.csv')"}); 
        // pyshell.send({webapp_endpoint: CodeEditorComponent, 
        //     content: "df.loc[-1] = df.loc[0]"}); 
                        
        // pyshell.send({webapp_endpoint: CodeEditorComponent, 
        //                 content: "df[:10]"}); 
        // pyshell.send({request_originator: CodeEditorComponent, command_type: '', command: 'df = training_df'});
        // pyshell.send({request_originator: CodePanelOriginator, command_type: 'exec', command: 'fig = px.line(df, x=df.index, y="Fuel Rail Pressure", title="Machine")'});
        // pyshell.send({request_originator: CodePanelOriginator, command_type: 'exec', command: 'fig.show()'});

        //for testing    
        // pyshell.send({request_originator: CodeEditorComponent, command: 'df = CycDataFrame("data/housing_data/train.csv")'});
        // pyshell.send({request_originator: CodeEditorComponent, command: 'df.head()'});

        //test plot_count_na
        // pyshell.send({webapp_endpoint: DFManager,
        //     command_name: "get_count_na",
        //     seq_number: 1}); 
    }

    initialize();

} catch (error) {
    console.log(error.stack);
}