import { Socket } from "socket.io-client";
import { CommandName, ContentType, IMessage, WebAppEndpoint } from "../../../interfaces/IApp";

export const createMessage = (content: string) => {
    let message: IMessage = {
        webapp_endpoint: WebAppEndpoint.ExecutorManager,
        command_name: CommandName.send_stdin,
        content: content,
        type: ContentType.STRING,
        error: false,
    };

    return message;
};

// export const sendMessage = (socket: Socket, content: string) => {
//     const message = createMessage(content);
//     console.log(`${message.webapp_endpoint} send message: `, message);
//     socket?.emit(message.webapp_endpoint, JSON.stringify(message));
// };
