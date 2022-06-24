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
            console.log("ResponseTerm", data);

            if (xtermRef?.current?.terminal) {
                const term = xtermRef?.current?.terminal;
                if (data?.type === `error`) {
                    term.write("\r\n");
                    term.write(c.red(`${data.name}${data.message}`));
                    // term.write("\r\n" + pathPrefix);
                }
                if (data?.type === `path`) {
                    console.log("change path");
                    // setPathPrefix(data => );
                    term.write(pathPrefix);
                    // updatePath(`${data.path}> `)
                    // setPathPrefix(`${data.path}> `);
                } else {
                    term.write(data);
                    console.log("pathPrefix", pathPrefix);

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
                    term.write(`${Math.random()}`);
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
                term.write("\x1bc");
            }

            socket.emit(WebAppEndpoint.Terminal, JSON.stringify({ content: input }));
            term.write("\r\n");
            // sendMessage({ content: input });

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
    };
    useEffect(() => {
        if (xtermRef?.current?.terminal && !isMountTerm) {
            setIsMountTerm(true);
            socket.emit(WebAppEndpoint.Terminal, JSON.stringify({ content: input, type: "path" }));

            // xtermRef.current.terminal.write(pathPrefix);
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
                    theme: { background: "white", foreground: "#00294d" },
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
