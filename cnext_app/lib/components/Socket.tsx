import openSocket from "socket.io-client";
export const CODE_SERVER_SOCKET_ENDPOINT =
    process.env.NEXT_PUBLIC_SERVER_SOCKET_ENDPOINT || "http://localhost:4000";

let previouslyConnected = false;

const socket = openSocket(CODE_SERVER_SOCKET_ENDPOINT, {
    closeOnBeforeunload: false,
});

socket.on("connect", function () {
    console.log(`Socket connect previouslyConnected=${previouslyConnected}`);
    if (previouslyConnected) {
        // send reconnect message to the server so it will send back any message in queue
        socket.emit("reconnect");
    } else {
        // first connection; any further connections means we disconnected
        socket.emit("init");
        previouslyConnected = true;
    }
});

export default socket;
