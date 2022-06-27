import React, { useRef, useEffect, useState } from "react";
import { XTerm } from "xterm-for-react";
import { IMessage, ContentType, WebAppEndpoint } from "../../interfaces/IApp";
import { FitAddon } from "xterm-addon-fit";
import { SearchAddon } from "xterm-addon-search";
import c from "ansi-colors";

import KeyCode from "./KeyCode";
import socket from "../Socket";
const ResponseTerminal = "Terminal";

var test = 0;
let currentHistory = 0;
let history: string[] = [];
let pathPrefix = "";
const Term = () => {
    const xtermRef = useRef(null);
    const [input, setInput] = useState<string>("");
    const [cursor, setCursor] = useState<number>(0);
    const [cursorPosition, setCursorPosition] = useState<number>(0);
    // const [history, setHistory] = useState<{ [key: string]: string }>();

    // const [pathPrefix, setPathPrefix] = useState<string>(`$ `);
    const [isMountTerm, setIsMountTerm] = useState<boolean>(false);
    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    // Connect Socket

    const socketInit = () => {
        socket.emit("ping", "Terminal");
        socket.on(ResponseTerminal, (data) => {
            console.log(`on res-data`, data);

            const term = xtermRef?.current?.terminal;
            if (term) {
                if (data?.type === `error`) {
                    // term.write("\r\n");
                    // bash
                    const lines = data.message.split(/\n/);
                    lines.forEach((l) => term.write(c.red(l + "\r\n")));

                    // PS
                    // term.write(c.red(`${data.message}`));
                    if (!data.cmd.content || !data?.cmd?.content.includes("cd")) {
                        wirtePS();
                    }
                } else if (data?.type === `path`) {
                    const lines = data.message.split(/\n/);
                    pathPrefix = lines[0];
                    // setPathPrefix(lines);
                    console.log(`wirtePS`, lines);

                    wirtePS();
                } else {
                    console.log(`data`, data);

                    // bash
                    const lines = data.split(/\n/);
                    lines.forEach((l) => term.write(l + "\r\n"));
                    wirtePS();
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
    const getPS = () => {
        socket.emit(
            WebAppEndpoint.Terminal,
            JSON.stringify({
                content: "echo `id -u -n`@`hostname` $(basename `pwd`)",
                type: "path",
            })
        );
    };
    useEffect(() => {
        socketInit();
        return () => {
            socket.off(WebAppEndpoint.Terminal);
        };
    }, []); //TODO: run this only once - not on rerender
    const wirtePS = () => {
        const term = xtermRef?.current?.terminal;
        term.write(c.blue(`${pathPrefix}> `));
    };

    const moveArrayItemToNewIndex = (arr: string[], old_index: number, new_index: number) => {
        if (new_index >= arr.length) {
            var k = new_index - arr.length + 1;
            while (k--) {
                arr.push(``);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr;
    };

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
                        term.write("\x1b[2K\r"); // remove line
                        wirtePS();
                        term.write(history[currentHistory]);

                        setInput(history[currentHistory]);
                    }

                    break;

                case KeyCode.ArrowDown: //  Bottom arrow
                    if (currentHistory < history.length && currentHistory > 0 && history.length) {
                        currentHistory = currentHistory + 1;
                        wirtePS();
                        term.write(history[currentHistory]);
                        setInput(history[currentHistory]);
                    }

                    break;
                case KeyCode.ArrowDown: //  Bottom arrow
                    break;
            }
        }
        if (code === KeyCode.Enter && input.length > 0) {
            if (KeyCode.Clear.includes(input)) {
                term.write("\x1bc");
                wirtePS();
            } else {
                sendMessage({ content: input });
                if (input.includes("cd")) {
                    getPS();
                }
                term.write("\r\n");
                // wirtePS();
            }

            // sendMessage({ content: input });

            if (currentHistory === history.length) {
                history = [...history, input];
            } else {
                history = moveArrayItemToNewIndex(history, currentHistory, history.length - 1);
            }

            currentHistory = history.length;
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
        const key = data.domEvent;
        const term = xtermRef?.current?.terminal;
        console.log(key, "key");

        if (
            (key.keyCode === KeyCode.BackSpace || key.keyCode === KeyCode.Delete) &&
            input.length > 0
        ) {
            term.write("\b \b"); // delete text
            setInput(input.slice(0, -1));
        } else if (key.key === KeyCode.Escape) {
            term.write("\x1b[2K\r"); // remove line
            sendMessage({ content: `pwd` });
        } else if (key.keyCode === KeyCode.ControlC && key.ctrlKey) {
            console.log(123);

            sendMessage({ content: `KILL_PROCESS`, type: "KILL_PROCESS" });
            term.write("\r\n");
            wirtePS();
            setTimeout(() => {
                socketInit();
            }, 2000);
        }
    };
    useEffect(() => {
        if (xtermRef?.current?.terminal && !isMountTerm) {
            setIsMountTerm(true);
            getPS();
        }
    }, [xtermRef.current]);
    const onResize = () => {
        if (xtermRef?.current?.terminal) {
            fitAddon.fit();
        }
    };
    return (
        <>
            <XTerm
                onResize={onResize}
                options={{
                    // fontSize: 16,
                    fontWeight: 400,
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
