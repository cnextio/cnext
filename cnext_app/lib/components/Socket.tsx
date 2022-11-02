import React from "react";
import { Socket } from "socket.io-client";
import { IMessage, WebAppEndpoint } from "../interfaces/IApp";
export const SERVER_SOCKET_ENDPOINT =
    process.env.NEXT_PUBLIC_SERVER_SOCKET_ENDPOINT || "http://localhost:4000";

// export const socket = openConnection(SERVER_SOCKET_ENDPOINT, {
//     closeOnBeforeunload: false,
//     // transports: ["websocket"],
// });

export const SocketContext = React.createContext<Socket | null>(null);

export const sendMessage = (socket: Socket | null, endpoint: WebAppEndpoint, message: IMessage) => {
    console.log(`Send ${endpoint} request: `, JSON.stringify(message));
    socket?.emit(endpoint, JSON.stringify(message));
};