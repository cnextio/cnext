const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require('fs');
const YAML = require('yaml');

const port = process.env.PORT || 4000;
const index = require("./routes/index");
const app = express();
app.use(index);
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

/*
* Communicate with web client
*/
try {
    let file;
    // if (process.platform=='win32'){
    //     file = fs.readFileSync('config-win.yaml', 'utf8');
    // } else {
    //     file = fs.readFileSync('config.yaml', 'utf8');
    // }
    file = fs.readFileSync('.server.yaml', 'utf8');
    config = YAML.parse(file);

    /** this variable is used to send back stdout to server */
    let clientMessage;

    io.on("connection", (socket) => {
        function messageHandler(strMessage){
            clientMessage = strMessage.slice();
            console.log("Receive msg from client, server will run: ", JSON.parse(strMessage));         
            pyshell.send(strMessage);
        }

        socket.on("ping", message => {
            const minutes = new Date().getMinutes();
            console.log(`Got ping at ${minutes}: ${message}` );
            io.emit("pong", minutes);
        });

        //TODO: catch json parse error here
        socket.on(CodeEditor, message => {  //TODO: use enum    
            messageHandler(message);
        });

        socket.on(DFManager, message => {  //TODO: use enum                  
            messageHandler(message);
        });

        socket.on(FileManager, message => {  //TODO: use enum                  
            messageHandler(message);
        });

        socket.on(FileExplorer, message => {  //TODO: use enum                  
            messageHandler(message);
        });

        socket.on(MagicCommandGen, message => {  //TODO: use enum                  
            messageHandler(message);
        });

        socket.once("disconnect", () => {
        });
    });

    const sendOutput = (message) => {
        io.emit(message['webapp_endpoint'], JSON.stringify(message));
    }

    server.listen(port, () => console.log(`Waiting on port ${port}`));

    /*********************************************************************/

    /*
    * Communicate with python server
    */
    const { PythonShell, NewlineTransformer } = require('python-shell');
    
    const pyshellOpts = {
        pythonPath: '/Users/bachbui/miniforge3-m1/envs/py39-m1/bin/python',
        stdio:
            ['pipe', 'pipe', 'pipe', 'pipe'], // stdin, stdout, stderr, custom
        mode: 'text',
        env: process.env
    }

    console.log("Starting python shell...");
    let pyshell = new PythonShell('server.py', pyshellOpts);

    /**
     * This function handles the stdout of python-shell
     */
    pyshell.on('message', function (stdout) {
        try {            
            let replyMessage = {...JSON.parse(clientMessage)};
            replyMessage['content'] = stdout;
            console.log('stdout: forward output to client', replyMessage);
            sendOutput(replyMessage);            
        } catch (error) {
            console.log(error.stack);
        }
    });

    pyshell.on('stderr', function (stderr) {
        let replyMessage = {...JSON.parse(clientMessage)};
        replyMessage['content'] = stderr;
        replyMessage['content_type'] = "str";
        console.log('stderr: forward output to client', replyMessage);
        sendOutput(replyMessage);            
        console.log('stderr:', stderr);
    });

    pyshell.on('error', function (message) {
        console.log('error ', message);
    })

    pyshell.on('close', function (message) {
        console.log('close ', "python-shell closed: " + message);
    })
    /** */
    

    /**
     * ZMQ communication from python-shell to node server
     */
    const zmq = require("zeromq");
    async function zmq_receive() {
        const command_output_zmq = new zmq.Pull; 

        const p2n_host = config.node_py_zmq.host; 
        const p2n_port = config.node_py_zmq.p2n_port;
        command_output_zmq.connect(`${p2n_host}:${p2n_port}`);
        
        // notification_zmq.bind(`${p2n_host}:${p2n_notif_port}`);    
        console.log(`Waiting for python server message on ${p2n_port}`);
    
        for await (const [message] of command_output_zmq) {
            const json_message = JSON.parse(message.toString());
            console.log(`command_output_zmq: forward output of command_name ${json_message['command_name']}`);
            sendOutput(json_message);         
        }
    };
    zmq_receive().catch(e => console.error("ZMQ_error: ", e.stack));
    /** */


    const initialize = () => {
        // pyshell.send({webapp_endpoint: CodeEditorComponent, content: 'print("hello world!")'});
        // seting up plotly
        pyshell.send(JSON.stringify({webapp_endpoint: CodeEditor, content: 'import plotly.express as px'}));
        pyshell.send(JSON.stringify({webapp_endpoint: CodeEditor, content: 'import plotly.io as pio'}));
        pyshell.send(JSON.stringify({webapp_endpoint: CodeEditor, content: 'pio.renderers.default = "json"'}));
        
        //for testing
        pyshell.send(JSON.stringify({webapp_endpoint: CodeEditor, 
                        content: `import os, sys, pandas as pd; os.chdir('${config.path_to_cycdataframe_lib}cycdataframe/'); sys.path.append(os.getcwd()); from cycdataframe.cycdataframe import CycDataFrame`}));
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