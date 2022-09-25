import React from "react";
import { Socket } from "socket.io-client";
export const SERVER_SOCKET_ENDPOINT =
    process.env.NEXT_PUBLIC_SERVER_SOCKET_ENDPOINT || "http://localhost:4000";

// export const socket = openConnection(SERVER_SOCKET_ENDPOINT, {
//     closeOnBeforeunload: false,
//     // transports: ["websocket"],
// });

export const SocketContext = React.createContext<Socket | null>(null);
