import { ContentType, IMessage, WebAppEndpoint } from "../../interfaces/IApp";
import { ExecutorManagerCommand } from "../../interfaces/IExecutorManager";
import socket from "../Socket";

const createMessage = (commandName: ExecutorManagerCommand) => {
    let message: IMessage = {
        webapp_endpoint: WebAppEndpoint.ExecutorManager,
        command_name: commandName,
        seq_number: 1,
        content: "",
        type: ContentType.NONE,
        error: false,
    };
    return message;
};

const sendMessage = (message: IMessage) => {
    console.log("ExecutorManager send message: ", message.webapp_endpoint, JSON.stringify(message));
    socket.emit(message.webapp_endpoint, JSON.stringify(message));
};

const restartKernel = () => {
    const message = createMessage(ExecutorManagerCommand.restart_kernel);
    sendMessage(message);
};

const interruptKernel = () => {
    const message = createMessage(ExecutorManagerCommand.interrupt_kernel);
    sendMessage(message);
};

export { restartKernel, interruptKernel };
