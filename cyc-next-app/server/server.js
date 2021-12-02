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

/*
* Communicate with web client
*/
try {
    let file;
    if (process.platform=='win32'){
        file = fs.readFileSync('config-win.yaml', 'utf8');
    } else {
        file = fs.readFileSync('config.yaml', 'utf8');
    }
    config = YAML.parse(file);

    io.on("connection", (socket) => {
        socket.on("ping", message => {
            const minutes = new Date().getMinutes();
            console.log(`Got ping at ${minutes}: ${message}` );
            io.emit("pong", minutes);
        });

        //TODO: catch json parse error here
        socket.on(CodeEditor, str_message => {  //TODO: use enum    
            message = JSON.parse(str_message);
            console.log("Receive msg from CodeEditor, server will run: ", message);         
            pyshell.send(message);
        });

        socket.on(DFManager, str_message => {  //TODO: use enum                  
            message = JSON.parse(str_message);
            console.log("Receive msg from DFManager, server will run: ", message);  
            pyshell.send(message);
        });

        socket.on(FileManager, str_message => {  //TODO: use enum                  
            message = JSON.parse(str_message);
            console.log("Receive msg from FileManager, server will run: ", message);  
            pyshell.send(message);
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
    const { PythonShell } = require('python-shell');
    const pyshell_opts = {
        'stdio':
            ['pipe', 'pipe', 'pipe', 'pipe'], // stdin, stdout, stderr, custom
        'mode': 'json'
    }

    console.log("Starting python shell...");
    let pyshell = new PythonShell('server.py', pyshell_opts);

    /**
     * Standard communication from python-shell to node server
     * Note: we are not going to use zmq instead of this
     */
    pyshell.on('message', function (message) {
        try {
            console.log('stdout: forward output to client');
            sendOutput(message);            
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
        pyshell.send({webapp_endpoint: CodeEditor, content: 'import plotly.express as px'});
        pyshell.send({webapp_endpoint: CodeEditor, content: 'import plotly.io as pio'});
        pyshell.send({webapp_endpoint: CodeEditor, content: 'pio.renderers.default = "json"'});
        

        //for testing
        pyshell.send({webapp_endpoint: CodeEditor, 
                        content: `import os, sys, pandas as pd; os.chdir('${config.path_to_cycdataframe_lib}cycdataframe/'); sys.path.append(os.getcwd()); from cycdataframe.cycdataframe import CycDataFrame`});
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
        pyshell.send({webapp_endpoint: DFManager,
            command_name: "get_count_na",
            seq_number: 1}); 
    }


    initialize();

} catch (error) {
    console.log(error.stack);
}