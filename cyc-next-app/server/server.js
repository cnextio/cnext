const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require('fs');
const YAML = require('yaml');

// workaround because of the `module not found` problem
// const {CodeExecutionMessageType} = require("../lib/components/Interfaces");
// enum CodeExecutionMessageType {
//     code_panel_request = 'code_panel_request',
//     table_panel_request = 'table_panel_request'
// }

//TODO: should use a shared interface file with the web client but have not found the way to do that yet
// enum CommandType { exec = 'exec', eval = 'eval' }

// for testing
// import tableData from "../lib/components/tests";

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
const CodeEditorComponent = 'CodeEditorComponent';
// const TableAreaComponent = 'table_panel';
const DataFrameManager = 'DataFrameManager';

/*
* Communicate with web client
*/
try {
    const file = fs.readFileSync('config.yaml', 'utf8');
    config = YAML.parse(file);

    io.on("connection", (socket) => {
        socket.on("ping", message => {
            const minutes = new Date().getMinutes();
            console.log(`Got ping at ${minutes}: ${message}` );
            io.emit("pong", minutes);
        });

        // socket.on(CodeEditorComponent, command => {  //TODO: use enum       
        //     console.log("server will run: ", command);       
        //     pyshell.send({request_originator: CodeEditorComponent, command_type: '', command: command});
        //     // for testing
        //     // pyshell.send(testData);
        // });

        //TODO: catch json parse error here
        socket.on(CodeEditorComponent, str_message => {  //TODO: use enum    
            message = JSON.parse(str_message);
            console.log("server will run: ", message);         
            pyshell.send(message);
            // for testing
            // pyshell.send(testData);
        });

        // socket.on(TableAreaComponent, command => {  //TODO: use enum       
        //     console.log("server will run: ", command);       
        //     pyshell.send({request_originator: TableAreaComponent, command_type: '', command: command});
        //     // for testing
        //     // pyshell.send(testData);
        // });

        socket.on(DataFrameManager, str_message => {  //TODO: use enum                  
            message = JSON.parse(str_message);
            console.log("server will run: ", message);    
            pyshell.send(message);
            // pyshell.send({request_originator: DataFrameManager, command_type: '', 
            //                 command: message['command'], metadata: message['metadata']});
            // for testing
            // pyshell.send(testData);
        });

        socket.once("disconnect", () => {
        });
    });

    const sendOutput = (message) => {
        // message['error'] = error
        // console.log(message);
        io.emit(message['webapp_endpoint'], JSON.stringify(message));
    }

    server.listen(port, () => console.log(`Waiting on port ${port}`));

    /*********************************************************************/

    /*
    * Communicate with python server
    */
    const { PythonShell, NewlineTransformer } = require('python-shell');
    const pyshell_opts = {
        'stdio':
            ['pipe', 'pipe', 'pipe', 'pipe'], // stdin, stdout, stderr, custom
        'mode': 'json'
    }

    console.log("Starting python shell...");
    let pyshell = new PythonShell('server.py', pyshell_opts);

    // processing outputs from python server
    pyshell.on('message', function (message) {
        try {
            console.log('stdout: forward output to client');
            sendOutput(message);            
            // console.log('stdout:', message);
        } catch (error) {
            console.log(error.stack);
        }
    });

    pyshell.on('stderr', function (message) {
        sendOutput({"command_type": "eval", "content_type": "str", "content": message}, true); 
        console.log('stderr:', message);
    });

    pyshell.on('error', function (message) {
        console.log('error ', message);
    })

    pyshell.on('close', function (message) {
        console.log('close ', "python-shell closed: " + message);
    })

    /*********************************************************************/
    

    /*********************************************************************
     * Use zmq to transfer message from python to node
    /*********************************************************************/
    const zmq = require("zeromq"),
        python_server_zmq = zmq.socket("pull");;    

    const p2n_host = config.node_py_zmq.host; //"tcp://127.0.0.1";
    const p2n_port = config.node_py_zmq.p2n_port;

    res = python_server_zmq.bind(`${p2n_host}:${p2n_port}`);    
    console.log(`Waiting for python server message on ${p2n_port}`);

    python_server_zmq.on("message", function (message) {
        console.log('python_server_zmq: forward output to client: command_name: ', JSON.parse(message.toString())['command_name']);
        sendOutput(JSON.parse(message.toString()));            
    });
    /*********************************************************************/


    const initialize = () => {
        // pyshell.send({webapp_endpoint: CodeEditorComponent, content: 'print("hello world!")'});
        // seting up plotly
        pyshell.send({webapp_endpoint: CodeEditorComponent, content: 'import plotly.express as px'});
        pyshell.send({webapp_endpoint: CodeEditorComponent, content: 'import plotly.io as pio'});
        pyshell.send({webapp_endpoint: CodeEditorComponent, content: 'pio.renderers.default = "json"'});
        

        //for testing
        pyshell.send({webapp_endpoint: CodeEditorComponent, 
                        content: `import os, sys, pandas as pd; os.chdir('${config.path_to_cycdataframe_lib}cycdataframe/'); sys.path.append(os.getcwd()); from cycdataframe.cycdataframe import CycDataFrame`});
        pyshell.send({webapp_endpoint: CodeEditorComponent, 
                        content: "df = CycDataFrame('tests/data/machine-simulation/21549286_out.csv')"}); 
        // pyshell.send({webapp_endpoint: CodeEditorComponent, 
        //                 content: "df[:10]"}); 
        // pyshell.send({request_originator: CodeEditorComponent, command_type: '', command: 'df = training_df'});
        // pyshell.send({request_originator: CodePanelOriginator, command_type: 'exec', command: 'fig = px.line(df, x=df.index, y="Fuel Rail Pressure", title="Machine")'});
        // pyshell.send({request_originator: CodePanelOriginator, command_type: 'exec', command: 'fig.show()'});

        //for testing    
        // pyshell.send({request_originator: CodeEditorComponent, command: 'df = CycDataFrame("data/housing_data/train.csv")'});
        // pyshell.send({request_originator: CodeEditorComponent, command: 'df.head()'});

        //test plot_count_na
        pyshell.send({webapp_endpoint: DataFrameManager,
            command_name: "get_count_na",
            seq_number: 1}); 
    }


    initialize();

} catch (error) {
    console.log(error.stack);
}