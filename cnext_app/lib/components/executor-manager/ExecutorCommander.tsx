import { useCallback, useContext, useEffect, useState } from "react";
import {
    ContentType,
    ExecutorCommandStatus,
    IExecutorCommandResponse,
    IMessage,
    WebAppEndpoint,
} from "../../interfaces/IApp";
import {
    ExecutorManagerCommand,
    IExecutorManagerResultContent,
} from "../../interfaces/IExecutorManager";
import { sendMessage, SocketContext } from "../Socket";
// import socket from "../Socket";

const createMessage = (commandName: ExecutorManagerCommand) => {
    let message: IMessage = {
        webapp_endpoint: WebAppEndpoint.ExecutorManagerControl,
        command_name: commandName,
        content: "",
        type: ContentType.NONE,
        error: false,
    };
    return message;
};

export const useExecutorCommander = () => {
    const socket = useContext(SocketContext);
    const [executing, setExecuting] = useState(false);

    const handlSocketResponse = (resolve, reject, command: ExecutorManagerCommand) => {
        socket?.once(WebAppEndpoint.ExecutorManagerControl, (result: string, ack) => {
            try {
                let message: IMessage = JSON.parse(result);
                console.log(
                    `${WebAppEndpoint.ExecutorManagerControl} got results for command `,
                    message
                );
                if (!message.error) {
                    if (message.command_name === command) {
                        let resultContent = message.content as IExecutorManagerResultContent;
                        let response: IExecutorCommandResponse;
                        if (resultContent.success === true) {
                            response = {
                                status: ExecutorCommandStatus.EXECUTION_OK,
                                result: resultContent,
                            };
                        } else {
                            response = {
                                status: ExecutorCommandStatus.EXECUTION_FAILED,
                            };
                        }
                        resolve(response);
                    }
                } else {
                    resolve({
                        status: ExecutorCommandStatus.EXECUTION_FAILED,
                    });
                }
            } catch (error) {
                console.error(error);
                resolve({
                    status: ExecutorCommandStatus.EXECUTION_FAILED,
                });
            }
            setExecuting(false);
            if (ack) ack();
        });

        setTimeout(() => {
            resolve({
                status: ExecutorCommandStatus.EXECUTION_FAILED,
            });
        }, 60000);
    };

    const sendCommand = useCallback(
        (command: ExecutorManagerCommand) => {
            return new Promise<IExecutorCommandResponse>((resolve, reject) => {
                if (socket) {
                    if (!executing) {
                        setExecuting(true);
                        const message = createMessage(command);
                        sendMessage(socket, message.webapp_endpoint, message, (ack) => {
                            if (ack.success === false) {
                                setExecuting(false);
                                resolve({
                                    status: ExecutorCommandStatus.CONNECTION_FAILED,
                                });
                            }
                        });
                        handlSocketResponse(resolve, reject, command);
                    } else {
                        resolve({ status: ExecutorCommandStatus.EXECUTION_BUSY });
                    }
                } else {
                    resolve({ status: ExecutorCommandStatus.SOCKET_NOT_READY });
                }
            });
        },
        [executing, socket]
    );

    const ready = socket ? true : false;
    return { sendCommand, ready, executing };
};
