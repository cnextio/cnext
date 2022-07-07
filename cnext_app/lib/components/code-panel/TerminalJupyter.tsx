import React, { useRef, useEffect, useState } from "react";
import { XTerm } from "xterm-for-react";
import { PageConfig } from "@jupyterlab/coreutils";
import { TerminalAPI, TerminalManager, ServerConnection } from "@jupyterlab/services";
import { FitAddon } from "xterm-addon-fit";

const Terminal = "Terminal";
let elementTerminal: HTMLElement;

const Term = () => {
    const xtermRef = useRef(null);
    const fitAddon = new FitAddon();

    let session: any;
    async function init() {
        const BASEURL = "http://localhost:5008";
        const TOKEN = "token123";
        const WSURL = "ws:" + BASEURL.split(":").slice(1).join(":");
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
        const listTerminalRun = await TerminalAPI.listRunning(connectionInfo);

        if (listTerminalRun.length === 0) {
            console.log("Term: start new");
            session = await terminalManager.startNew({
                name: Terminal,
                cwd: "",
            });
        } else {
            session = terminalManager.connectTo({
                model: {
                    name: Terminal,
                },
            });
        }

        session.messageReceived.connect(
            (data: string, msg: { type: string; content: string[] }) => {
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
            }
        );

        // listen terminal resize

        elementTerminal = document.getElementById(`Terminal`);
        new ResizeObserver(() => {
            if (fitAddon !== undefined) {
                fitAddon.fit();
            }
        }).observe(elementTerminal);
    }
    useEffect(() => {
        init();
        return () => {
            // session.shutdown()
            console.log(`session`, session);
        };
    }, []); //TODO: run this only once - not on rerender

    function onTermData(data: string) {
        session.send({
            type: "stdin",
            content: [data],
        });
    }

    useEffect(() => {
        if (xtermRef?.current?.terminal && session) {
            // session.send({
            //     type: "set_size",
            //     content: [24, 124, elementTerminal.offsetHeight, elementTerminal.offsetWidth],
            // });
        }
    }, [session]);

    const onResize = (event: { rows: number; cols: number }) => {
        if (xtermRef?.current?.terminal && session) {
            session.send({
                type: "set_size",
                content: [
                    event.rows,
                    event.cols,
                    elementTerminal.offsetHeight,
                    elementTerminal.offsetWidth,
                ],
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
