const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const port = process.env.PORT || 4001;
const index = require("./routes/index");
const app = express();
app.use(index);
const server = http.createServer();
options = {
    cors: {
        origin: ["http://localhost:3001"],
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

    socket.on("run", msgTo => {        
        console.log("Run: ", msgTo);
        sendResult();
    });

    socket.once("disconnect", () => {
    });
});

const sendResult = () => {
    io.emit('result', JSON.stringify({
        result: 'result',
        error: 'error'
    }));
}

server.listen(port, () => console.log(`Waiting on port ${port}`));

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