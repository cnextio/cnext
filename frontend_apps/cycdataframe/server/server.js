const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

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

const CodeAreaComponent = 'code_panel';
const TableAreaComponent = 'table_panel';
const DataFrameManager = 'DataFrameManager';

/*
* Communicate with web client
*/
try {
    io.on("connection", (socket) => {
        socket.on("ping", message => {
            const minutes = new Date().getMinutes();
            console.log(`Got ping at ${minutes}: ${message}` );
            io.emit("pong", minutes);
        });

        socket.on(CodeAreaComponent, command => {  //TODO: use enum       
            console.log("server will run: ", command);       
            pyshell.send({request_originator: CodeAreaComponent, command_type: '', command: command});
            // for testing
            // pyshell.send(testData);
        });

        socket.on(TableAreaComponent, command => {  //TODO: use enum       
            console.log("server will run: ", command);       
            pyshell.send({request_originator: TableAreaComponent, command_type: '', command: command});
            // for testing
            // pyshell.send(testData);
        });

        socket.on(DataFrameManager, json_request => {  //TODO: use enum                  
            request = JSON.parse(json_request);
            console.log("server will run: ", request);    
            pyshell.send({request_originator: DataFrameManager, command_type: '', 
                            command: request['command'], metadata: request['metadata']});
            // for testing
            // pyshell.send(testData);
        });
        // socket.on("exec", command => {        
        //     console.log("server will exec: ", command);       
        //     pyshell.send({command_type: 'exec', command: command});
        //     // for testing
        //     // pyshell.send(testData);
        // });

        // socket.on("eval", command => {        
        //     console.log("server will eval: ", command);       
        //     pyshell.send({command_type: 'eval', command: command});
        //     // for text interface
        //     // pyshell.send(command)
        // });

        socket.once("disconnect", () => {
        });
    });

    const sendOutput = (message) => {
        // message['error'] = error
        io.emit(message['request_originator'], JSON.stringify(message));
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
            sendOutput(message);
            console.log('stdout: processing output');
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

    const initialize = () => {
        // seting up plotly
        pyshell.send({request_originator: CodeAreaComponent, command: 'import plotly.express as px'});
        pyshell.send({request_originator: CodeAreaComponent, command: 'import plotly.io as pio'});
        pyshell.send({request_originator: CodeAreaComponent, command: 'pio.renderers.default = "json"'});
        

        //for testing
        pyshell.send({request_originator: CodeAreaComponent, 
                        command: "import os, sys; os.chdir('/Volumes/GoogleDrive/.shortcut-targets-by-id/1FrvaCWSo3NV1g0sR9ib6frv_lzRww_8K/CycAI/works/CAT/machine_simulation'); sys.path.append(os.getcwd()); from cycdataframe.cycdataframe import CycDataFrame"});
        // pyshell.send({request_originator: CodeAreaComponent, command: "training_df = CycDataFrame('data/exp_data/997/21549286_out.csv')"}); 
        // pyshell.send({request_originator: CodeAreaComponent, command_type: '', command: 'df = training_df'});
        // pyshell.send({request_originator: CodePanelOriginator, command_type: 'exec', command: 'fig = px.line(df, x=df.index, y="Fuel Rail Pressure", title="Machine")'});
        // pyshell.send({request_originator: CodePanelOriginator, command_type: 'exec', command: 'fig.show()'});

        //for testing    
        pyshell.send({request_originator: CodeAreaComponent, command: 'df = CycDataFrame("data/housing_data/train.csv")'});
        // pyshell.send({request_originator: CodeAreaComponent, command: 'df.head()'});
    }


    initialize();
} catch (error) {
    console.log(error.stack);
}