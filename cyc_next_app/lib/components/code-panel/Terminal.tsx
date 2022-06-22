import React, { useRef, useEffect, useState } from "react";
import { XTerm } from "xterm-for-react";
import { IMessage, ContentType, WebAppEndpoint } from "../../interfaces/IApp";
import { FitAddon } from "xterm-addon-fit";

import socket from "../Socket";

const Term = () => {
    const xtermRef = useRef(null);
    const [input, setInput] = useState<string>("");
    const [cursor, setCursor] = useState<number>(0);

    const [isMountTerm, setIsMountTerm] = useState<boolean>(false);
    const fitAddon = new FitAddon();

    const socketInit = () => {
        socket.emit("ping", WebAppEndpoint.Terminal);
        socket.on(WebAppEndpoint.Terminal, (result: string) => {
            try {
                let message: IMessage = JSON.parse(result);
                console.log("Load Terminal ", message);
                if (!message.error) {
                    if (message.type === ContentType.STRING || message.error === true) {
                    }
                } else {
                }
            } catch {}
        });
    };

    const createMessage = (content = null): IMessage => {
        let message: IMessage = {
            webapp_endpoint: WebAppEndpoint.Terminal,
            command_name: "",
            content: content,
            type: ContentType.STRING,
            error: false,
            metadata: {},
        };
        return message;
    };

    const sendMessage = (message: IMessage) => {
        console.log(`Terminal Send Message: ${message.webapp_endpoint} ${JSON.stringify(message)}`);
        socket.emit(message.webapp_endpoint, JSON.stringify(message));
    };

    useEffect(() => {
        socketInit();
        return () => {
            socket.off(WebAppEndpoint.Terminal);
        };
    }, []); //TODO: run this only once - not on rerender

    function onTermData(data: any) {
        setIsMountTerm(true);

        const code = data.charCodeAt(0);
        console.log("code:" + code + "data: " + data);
        const term = xtermRef.current.terminal;
        if (code == 27) {
            switch (data.substr(1)) {
                case "[C": // Right arrow
                    if (cursor < input.length) {
                        console.log("Right");

                        setCursor(cursor + 1);
                        term.write(data);
                    }
                    break;
                case "[D": // Left arrow
                    if (cursor > 0) {
                        console.log("Right");
                        setCursor(cursor - 1);
                        term.write(`\x1b[D`);
                    }

                    break;
            }
        }
        if (code === 13 && input.length > 0) {
            let message: IMessage = createMessage();
            sendMessage(message);
            if (input === "cls" || input === "clear") {
                term.clear();
                term.write("\r\n" + "~$ ");
            } else {
                term.write("\r\n" + "~$ ");
            }
            setInput("");
        } else if (code < 32 || code === 127) {
            // Disable control Keys such as arrow keys

            return;
        } else {
            // Add general key press characters to the terminal
            term.write(data);
            setCursor((input + data).length);
            setInput(input + data);
        }
    }
    //   var inputA = "";
    // //   var cursor = 0;
    //   function onTermData(data: any) {
    //     const code = data.charCodeAt(0);
    //     const term = xtermRef.current.terminal;
    //     console.log("ata.substr(1)", data, code);
    //     console.log("ata.substr(1)", data, code, data.substr(1));

    //     if (code == 27) {
    //       switch (data.substr(1)) {
    //         case "[C": // Right arrow
    //           if (cursor < inputA.length) {
    //             console.log("Right");

    //             cursor += 1;
    //             term.write(data);
    //           }
    //           break;
    //         case "[D": // Left arrow
    //           if (cursor > 0) {
    //             console.log("Right");
    //             cursor -= 1;
    //             term.write(`\x1b[D`);
    //           }

    //           break;
    //       }
    //     } else if (code == 13) {
    //       // CR
    //     } else {
    //       term.write(data);
    //       cursor = data.length;
    //       inputA = inputA.substr(0, cursor) + data + inputA.substr(cursor);
    //     }
    //   }
    const onTermKey = (data: any) => {
        // press key backSpace and Delete
        if (data.domEvent.keyCode === 8 || data.domEvent.keyCode === 46) {
            xtermRef.current.terminal.write("\b \b");
            setInput(input.slice(0, -1));
        }
        console.log(data.domEvent.keyCode, "key");
    };
    useEffect(() => {
        var init_width = 9;
        var init_height = 17;
        var windows_width = window.innerWidth;
        var windows_height = window.innerHeight;
        const cols = Math.floor(windows_width / init_width);
        const rows = Math.floor(windows_height / init_height) - 2;

        if (xtermRef?.current?.terminal && !isMountTerm) {
            xtermRef.current.terminal.write("~$ ");
        }
    }, [xtermRef.current]);
    return (
        <XTerm
            onResize={() => {
                console.log("ádfdsf", xtermRef.current.terminal), xtermRef.current.terminal.fit();
            }}
            onKey={onTermKey}
            onData={onTermData}
            ref={xtermRef}
            addons={[fitAddon]}
        />
    );
};

export default Term;
