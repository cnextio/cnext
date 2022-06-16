import React, { useRef, useEffect, useState } from "react";
import { XTerm } from "xterm-for-react";
import socket from "../Socket";
import { ContentType, IMessage, WebAppEndpoint } from "../../interfaces/IApp";

const Term = ({ openDialog = true, confirm }) => {
    const xtermRef = useRef(null);
    const [input, setInput] = useState("");
    const onTermData = (data: any) => {
        const code = data.charCodeAt(0);
        // If the user hits empty and there is something typed echo it.
        if (code === 13 && input.length > 0) {
            let message = createMessage("", null);
            sendMessage(message);
            // xtermRef.current.terminal.write("\r\nYou typed: '" + input + "'\r\n");
            xtermRef.current.terminal.write("\r\n" + "echo> ");
            setInput("");
        } else if (code < 32 || code === 127) {
            // Disable control Keys such as arrow keys
            return;
        } else {
            // Add general key press characters to the terminal
            xtermRef.current.terminal.write(data);
            setInput(input + data);
        }
        console.log(data, code, "data");
    };

    const onTermKey = (data: any) => {
        // const code = data.charCodeAt(0);
        console.log(data, "key");
        // if
    };

    const sendMessage = (message: IMessage) => {
        console.log(`${message.webapp_endpoint} send message: `, JSON.stringify(message));
        socket.emit(message.webapp_endpoint, JSON.stringify(message));
    };

    const createMessage = (command_name: "", content: string | null = null): IMessage => {
        let message: IMessage = {
            webapp_endpoint: WebAppEndpoint.TerminalCommand,
            command_name: command_name,
            type: ContentType.COMMAND,
            content: content,
            error: false,
        };
        return message;
    };

    const setupSocket = () => {
        socket.emit("ping", WebAppEndpoint.TerminalCommand);
        socket.on(WebAppEndpoint.TerminalCommand, (result: string) => {
            console.log(result);
        });
    };

    useEffect(() => {
        var init_width = 9;
        var init_height = 17;
        var windows_width = window.innerWidth;
        var windows_height = window.innerHeight;
        const cols = Math.floor(windows_width / init_width);
        const rows = Math.floor(windows_height / init_height) - 2;

        if (xtermRef?.current?.terminal) {
            xtermRef.current.terminal.writeln("Please enter any string then press enter:");
            xtermRef.current.terminal.write("echo> ");
            console.log("xtermRef.current", xtermRef.current);
            console.log("xtermRef.terminal", xtermRef.current.terminal);
        }
    }, [xtermRef.current]);

    useEffect(() => {
        setupSocket();
    }, []);

    return <XTerm onKey={onTermKey} onData={onTermData} ref={xtermRef} />;
};

export default Term;
