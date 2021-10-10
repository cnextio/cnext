const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
import {DataTableContent} from "../lib/components/Interfaces";
// for testing
import tableData from "../lib/components/tests";

const port = process.env.PORT || 4000;
const index = require("./routes/index");
const app = express();
app.use(index);
const server = http.createServer();
options = {
    cors: {
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST"]
    },
};
const io = new socketIo.Server(server, options);
let ready = false;

io.on("connection", (socket) => {
    socket.on("ping", msgTo => {
        const minutes = new Date().getMinutes();
        console.log("Got [ping]: " + minutes);
        io.emit("pong", minutes);
    });

    socket.on("run", msgRecv => {        
        console.log("server run: ", msgRecv);       
        // pyshell.send(msgRecv);
        //for testing
        pyshell.send(testData);
    });

    socket.once("disconnect", () => {
    });
});

const sendOutput = (type, content) => {
    io.emit(type, JSON.stringify({
        type: type,
        content: content
    }));
}

server.listen(port, () => console.log(`Waiting on port ${port}`));

/*
* Communicate with python server
*/
let {PythonShell} = require('python-shell');
console.log("Starting python shell...");
let pyshell = new PythonShell('server.py', { mode: 'text'});

pyshell.on('message', function (message) {
    sendOutput('output', message);
    console.log('stdout:', message);
});

pyshell.on('stderr', function (stderr) {
    sendOutput('output', stderr);
    console.log('stderr:', stderr);
});

// // getting data from pen
// const zmq = require("zeromq"),
//     pen_socket = zmq.socket("pull");

// pen_socket.bind("tcp://127.0.0.1:5001");
// console.log("Receiving pen data on port 5001");

// pen_socket.on("message", function (msg) {
//     let strMsg = msg.toString();
//     console.log("Get pen pos: %s", strMsg);
//     let data = strMsg.split(',')
//     let x = convert(data[0]);
//     let y = convert(data[1]);
//     let z = convert(data[2]);
//     if (ready){
//         if(!isNaN(x) && !isNaN(y) && !isNaN(z)) {
//             console.log("\tFinal pen pos: %d %d %d", x, y, z);
//             sendPenData(true, x, y, z);
//         } else {
//             sendPenData(false);
//         }
//     }
// });

// function convert(x) {
//     return -parseFloat(x);
// }

//function convert_z(x) {
//    return Math.round(parseFloat(x)*1000*1.5);
//}