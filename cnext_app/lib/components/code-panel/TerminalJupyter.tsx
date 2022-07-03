import React, { useRef, useEffect, useState } from "react";
import { XTerm } from "xterm-for-react";
import { PageConfig } from "@jupyterlab/coreutils";
import { TerminalManager, ServerConnection } from "@jupyterlab/services";
import { FitAddon } from "xterm-addon-fit";

const ResponseTerminal = "Terminal";

const Term = () => {
    const xtermRef = useRef(null);
    const [input, setInput] = useState<string>("");
    const fitAddon = new FitAddon();

    let terminal: any;
    async function init() {
        const BASEURL = "http://localhost:8888";
        const TOKEN = "cnext-token";
        const WSURL = "ws:" + BASEURL.split(":").slice(1).join(":");
        console.log(`WSURL`, WSURL);

        const connectionInfo = ServerConnection.makeSettings({
            baseUrl: BASEURL,
            wsUrl: WSURL,
            token: TOKEN,
            init: {},
        });
        PageConfig.setOption(`terminalsAvailable`, "true");
        const terminalManager = new TerminalManager({
            serverSettings: connectionInfo,
        });
        terminal = await terminalManager.startNew({
            name: "terminal1",
            cwd: "",
        });
        // let test = await terminalManager.listRunning()
        terminal.messageReceived.connect((data, msg) => {
            switch (msg.type) {
                case "stdout":
                    if (msg.content) {
                        xtermRef?.current?.terminal.write(msg.content[0] as string);
                    }
                    break;
                case "disconnect":
                    xtermRef?.current?.terminal.write("\r\n\r\n[Finished… Term Session]\r\n");
                    break;
                default:
                    break;
            }
        });
    }
    useEffect(() => {
        init();
        return () => {};
    }, []); //TODO: run this only once - not on rerender

    function onTermData(data: any) {
        terminal.send({
            type: "stdin",
            content: [data],
        });
    }

    useEffect(() => {
        if (xtermRef?.current?.terminal) {
        }
    }, [xtermRef.current]);

    const setSize = () => {
        terminal.send({
            type: "set_size",
            content: [24, 208, 10, 10],
        });
    };
    const onResize = (event: any) => {
        if (xtermRef?.current?.terminal) {
            terminal.send({
                type: "set_size",
                content: [event.rows, event.cols, 10, 10],
            });
            fitAddon.fit();
        }
    };
    return (
        <>
            <XTerm
                onResize={onResize}
                options={{
                    fontFamily: `monospace`,
                    fontSize: 13,
                    lineHeight: 1.43,
                    fontWeight: 400,
                    theme: { background: "white", foreground: "#000000", cursor: "#000000" },
                }}
                addons={[fitAddon]}
                onData={onTermData}
                ref={xtermRef}
            />
        </>
    );
};

export default Term;
