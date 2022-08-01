import React, { useEffect } from "react";
import { IMessage, WebAppEndpoint } from "../../interfaces/IApp";
import { ICheckAliveResultContent, KernelManagerCommand } from "../../interfaces/IKernelManager";
import socket from "../Socket";

const CheckAlive = () => {
    const sendCheckAliveMessage = () => {
        let message = {
            webapp_endpoint: WebAppEndpoint.KernelManager,
            command_name: KernelManagerCommand.is_alive,
        };
        console.log("KernelManager send check alive message");
        socket.emit(message.webapp_endpoint, JSON.stringify(message));
    };

    async function checkAlive() {
        const result: IMessage = await new Promise((resolve, reject) => {
            sendCheckAliveMessage();
            socket.once(WebAppEndpoint.KernelManager, (result) => {
                const response: IMessage = JSON.parse(result.toString());
                resolve(response);
            });
        });
        let content = result.content as ICheckAliveResultContent;
        console.log("KernelManager kernel status: ", content);
    };

    useEffect(() => {
        let intervalTimer = setInterval(checkAlive, 1000);
        return () => clearInterval(intervalTimer);
    }, []);

    return null;
};

export default CheckAlive;