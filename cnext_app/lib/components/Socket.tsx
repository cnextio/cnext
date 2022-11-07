import React from "react";
import { Socket } from "socket.io-client";
import { setNotification } from "../../redux/reducers/NotificationRedux";
import store from "../../redux/store";
import { IMessage, WebAppEndpoint } from "../interfaces/IApp";
export const SERVER_SOCKET_ENDPOINT =
    process.env.NEXT_PUBLIC_SERVER_SOCKET_ENDPOINT || "http://localhost:4000";

// export const socket = openConnection(SERVER_SOCKET_ENDPOINT, {
//     closeOnBeforeunload: false,
//     // transports: ["websocket"],
// });

export const SocketContext = React.createContext<Socket | null>(null);

type AckFunc = (response: {[status: string]: string}) => void;

export const sendMessage = (
    socket: Socket | null,
    endpoint: WebAppEndpoint,
    message: IMessage,
    ack: AckFunc | undefined = undefined
) => {
    console.log(`Send ${endpoint} request: `, JSON.stringify(message));
    socket
        ?.timeout(1000)
        .emit(endpoint, JSON.stringify(message), (error: boolean, response: any) => {
            if (error) {
                store.dispatch(setNotification("Failed to connect to the server."));
                if (ack) ack({status: "failed"});
            } else {
                // console.log("Socket ack");
                if (ack) ack({status: "ok"});
            }
        });
};
