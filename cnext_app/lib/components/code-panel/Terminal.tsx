import React, { useRef, useEffect, useState } from "react";
import { XTerm } from "xterm-for-react";
import { IMessage, ContentType, WebAppEndpoint } from "../../interfaces/IApp";
import { FitAddon } from "xterm-addon-fit";
import { SearchAddon } from "xterm-addon-search";
import c from "ansi-colors";

import KeyCode from "./KeyCode";
import socket from "../Socket";

var test = 0;
const Term = () => {
    const xtermRef = useRef(null);
    const [input, setInput] = useState<string>("");
    const [cursor, setCursor] = useState<number>(0);
    const [cursorPosition, setCursorPosition] = useState<number>(0);
    const [history, setHistory] = useState<{ [key: string]: string }>();

    const [pathPrefix, setPathPrefix] = useState<string>(`~$ `);
    const [isMountTerm, setIsMountTerm] = useState<boolean>(false);
    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    // Connect Socket
    const socketInit = () => {
        console.log("test");

        socket.emit("ping", "Terminal");
        socket.on("res-data", (data) => {
            console.log("data loi", data);

            if (xtermRef?.current?.terminal) {
                const term = xtermRef?.current?.terminal;
                if (data?.code ===1) {
                    term.write(
                        c.red(
                            `${data.cmd}: The term ${data.cmd} is not recognized as the name of  a cmdlet, function, \r\n script file, or operable program`
                        )
                    );
                    term.write("\r\n" + pathPrefix);
                } else {
                    term.write(data);
                    term.write("\r\n" + pathPrefix);
                }
            }
        });
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
    const sendMessage = (message: any) => {
        console.log(`${WebAppEndpoint.Terminal} send message: `, JSON.stringify(message));
        socket.emit(WebAppEndpoint.Terminal, JSON.stringify(message));
    };
    const createMessage = (command_name: any, content: any, metadata: {} = {}): IMessage => {
        let message: IMessage = {
            webapp_endpoint: WebAppEndpoint.Terminal,
            command_name: command_name,
            type: ContentType.COMMAND,
            content: content,
            metadata: metadata,
            error: false,
        };
        return message;
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
        console.log(history, "code:" + code + "data: " + data, "27" + data.substr(1));
        const term = xtermRef?.current?.terminal;
        if (code == 27) {
            switch (data.substr(1)) {
                case "[C": // Right arrow
                    if (cursor < input.length) {
                        console.log("Right");
                        test = test - 1;
                        setCursorPosition(cursorPosition + 1);
                        term.write(data);
                    }
                    break;
                case "[D": // Left arrow
                    if (cursor > 0) {
                        console.log("Right");
                        test = test + 1;
                        setCursorPosition(cursorPosition - 1);
                        term.write(`\x1b[D`);
                    }

                    break;
                case "": // ESC
                    // setCursor(cursor + 1);
                    term.write("\x1b[2K\r");
                    term.write(pathPrefix);
                    setInput("");

                    break;

                case "[A": // Up
                    term.write(history ? history[`0`] : "");
                    setInput(history ? history[`0`] : "");

                    break;

                case "[B": //  Bottom arrow
                    term.write(history ? history[`0`] : "");
                    setInput(history ? history[`0`] : "");

                    break;
            }
        }
        if (code === KeyCode.Enter && input.length > 0) {
            if (input === "cls" || input === "clear") {
                term.clear();
                // term.write("\r\n" + pathPrefix);
            } else {
                term.write("\r\n" + pathPrefix);
            }
            // sendMessage({ content: input });
            socket.emit(WebAppEndpoint.Terminal, JSON.stringify({ content: input }));
            console.log("WebAppEndpoint.Terminal", WebAppEndpoint.Terminal);

            setHistory({
                ...history,
                [history ? Object.keys(history).length : 0]: input,
            });
            // searchAddon.findNext("'ls'");
            // console.log("searchAddon", searchAddon);

            console.log("history", history);

            setInput("");
            test = 0;
            setCursorPosition(0);
        } else if (code < 32 || code === 127) {
            // Disable control Keys such as arrow keys

            return;
        } else {
            term.write(data);
            // Add general key press characters to the terminal
            // if (cursorPosition === 0) {
            //   term.write(data);
            // } else {
            //   console.log("input", input);
            //   console.log("data", data);
            //   console.log("cursorPosition", cursorPosition);
            //   console.log("tesst", test);
            //   console.log(
            //     "tesst texxt",
            //     input.substr(0, test) + data + input.substr(test)
            //   );
            //   term.write(input.substr(0, test) + data + input.substr(test));
            //   // term.write(`\u001b[0;5H`);
            // }
            // setCursor((input + data).length);
            setInput(input + data);
        }
    }

    const onTermKey = (data: any) => {
        // press key backSpace and Delete
        if (
            data.domEvent.keyCode === KeyCode.BackSpace ||
            data.domEvent.keyCode === KeyCode.Delete
        ) {
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
            xtermRef.current.terminal.write(pathPrefix);
        }
    }, [xtermRef.current]);
    return (
        <>
            <XTerm
                onResize={() => {
                    console.log("ádfdsf", xtermRef.current.terminal),
                        xtermRef.current.terminal.fit();
                }}
                options={{
                    fontSize: 16,
                    fontWeight: 900,
                    theme: { background: "black", foreground: "white" },
                }}
                onKey={onTermKey}
                onData={onTermData}
                ref={xtermRef}
                addons={[fitAddon, searchAddon]}
            />
        </>
    );
};

export default Term;
