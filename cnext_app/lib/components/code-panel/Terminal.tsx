import React, { useRef, useEffect, useState } from "react";
import { XTerm } from "xterm-for-react";
import { IMessage, ContentType, WebAppEndpoint } from "../../interfaces/IApp";
import { FitAddon } from "xterm-addon-fit";
import { SearchAddon } from "xterm-addon-search";
import c from "ansi-colors";

import KeyCode from "./KeyCode";
import socket from "../Socket";

var test = 0;
let currentHistory = 0;
let history: string[] = [];
const Term = () => {
    const xtermRef = useRef(null);
    const [input, setInput] = useState<string>("");
    const [cursor, setCursor] = useState<number>(0);
    const [cursorPosition, setCursorPosition] = useState<number>(0);
    // const [history, setHistory] = useState<{ [key: string]: string }>();

    const [pathPrefix, setPathPrefix] = useState<string>(``);
    const [isMountTerm, setIsMountTerm] = useState<boolean>(false);
    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    // Connect Socket
    const updatePath = (data) => {
        setPathPrefix(data);
    };
    const socketInit = () => {
        socket.emit("ping", "Terminal");
        socket.on("res-data", (data) => {
            console.log("ResponseTerm 1", data);

            if (xtermRef?.current?.terminal) {
                const term = xtermRef?.current?.terminal;
                if (data?.type === `error`) {
                    term.write("\r\n");
                    term.write(c.red(`${data.message}`));
                    // term.write("\r\n" + pathPrefix);
                } else {
                    term.write(data);
                    // term.write("\r\n" + pathPrefix);
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

    useEffect(() => {
        socketInit();
        return () => {
            socket.off(WebAppEndpoint.Terminal);
        };
    }, []); //TODO: run this only once - not on rerender
    useEffect(() => {
        console.log(pathPrefix);
    }, [pathPrefix]); //
    function onTermData(data: any) {
        setIsMountTerm(true);

        const code = data.charCodeAt(0);
        console.log(history, "code:" + code + "data: " + data, "27" + data.substr(1));
        const term = xtermRef?.current?.terminal;
        if (code == 27) {
            switch (data.substr(1)) {
                case KeyCode.ArrowRight: // Right arrow
                    if (cursor < input.length) {
                        console.log("Right");
                        test = test - 1;
                        setCursorPosition(cursorPosition + 1);
                        term.write(data);
                    }
                    break;
                case KeyCode.ArrowLeft: // Left arrow
                    if (cursor > 0) {
                        console.log("ArrowLeft");
                        test = test + 1;
                        setCursorPosition(cursorPosition - 1);
                        term.write(`\x1b[D`);
                    }

                    break;
                case KeyCode.ArrowUp: // Up
                    if (history.length > 0) {
                        if (currentHistory <= history.length && currentHistory > 0) {
                            currentHistory = currentHistory - 1;
                        } else if (currentHistory === 0) {
                            currentHistory = history.length - 1;
                        }
                        // term.write("\x1b[2K\r");
                        // sendMessage({ content: `cd` });
                        term.write(history[currentHistory]);
                        setInput(history[currentHistory]);
                    }

                    break;

                case KeyCode.ArrowDown: //  Bottom arrow
                    if (currentHistory > 0 && history.length) {
                        currentHistory = currentHistory - 1;
                        term.write(history[currentHistory]);
                        setInput(history[currentHistory]);
                    }

                    break;
            }
        }
        if (code === KeyCode.Enter && input.length > 0) {
            if (input === "cls" || input === "clear") {
                term.write("\x1bc");
            }

            sendMessage({ content: input });
            term.write("\r\n");
            // sendMessage({ content: input });

            if (currentHistory === history.length) {
                history = [...history, input];
            } else {
                history.splice(history.length - 1, 0, history[currentHistory]); // splice(toIndex, 0, element)
            }
            currentHistory = history.length;
            console.log(`history`, history);

            setInput("");
            test = 0;
            setCursorPosition(0);
        } else if (code < 32 || code === 127) {
            // Disable control Keys such as arrow keys

            return;
        } else {
            term.write(data);

            setInput(input + data);
        }
    }

    const onTermKey = (data: any) => {
        // press key backSpace and Delete
        console.log(`keyCode`, data);
        const key = data.domEvent;
        const term = xtermRef?.current?.terminal;
        if (key.keyCode === KeyCode.BackSpace || key.keyCode === KeyCode.Delete) {
            term.write("\b \b"); // delete text
            setInput(input.slice(0, -1));
        } else if (key.key === KeyCode.Escape) {
            term.write("\x1b[2K\r"); // remove line
            sendMessage({ content: `cd` });
        }
    };
    useEffect(() => {
        if (xtermRef?.current?.terminal && !isMountTerm) {
            setIsMountTerm(true);
            socket.emit(WebAppEndpoint.Terminal, JSON.stringify({ content: input, type: "path" }));
        }
    }, [xtermRef.current]);
    const onResize = () => {
        if (xtermRef?.current?.terminal) {
            fitAddon.fit();
        }
    };
    return (
        <>
            {pathPrefix}
            <XTerm
                onResize={onResize}
                options={{
                    fontSize: 16,
                    fontWeight: 900,
                    theme: { background: "white", foreground: "#000000", cursor: "#000000" },
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
