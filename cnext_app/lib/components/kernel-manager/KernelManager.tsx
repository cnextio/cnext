import { ContentType, IMessage, WebAppEndpoint } from "../../interfaces/IApp";
import { KernelManagerCommand } from "../../interfaces/IKernelManager";
import socket from "../Socket";

const createMessage = (commandName: KernelManagerCommand) => {
    let message: IMessage = {
        webapp_endpoint: WebAppEndpoint.KernelManager,
        command_name: commandName,
        seq_number: 1,
        content: "",
        type: ContentType.NONE,
        error: false,
    };
    return message;
};

const sendMessage = (message: IMessage) => {
    console.log(
        `File Explorer Send Message: ${message.webapp_endpoint} ${JSON.stringify(message)}`
    );
    socket.emit(message.webapp_endpoint, JSON.stringify(message));
};

const restartKernel = () => {
    const message = createMessage(KernelManagerCommand.restart_kernel);
    sendMessage(message);
};

const interruptKernel = () => {
    const message = createMessage(KernelManagerCommand.interrupt_kernel);
    sendMessage(message);
};

export { restartKernel, interruptKernel };
