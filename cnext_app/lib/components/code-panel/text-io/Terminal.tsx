import React, { useRef, useEffect, useState } from "react";
import { PageConfig } from "@jupyterlab/coreutils";
import { TerminalAPI, TerminalManager, ServerConnection } from "@jupyterlab/services";
import { FitAddon } from "xterm-addon-fit";
import store, { RootState } from "../../../../redux/store";
import { useSelector } from "react-redux";
import { XTerm } from "../../../@xterm";
import styled from "styled-components";

const Terminal = "terminalIO";
let elementTerminal: HTMLElement;
let session: any;

const TerminalComponent = () => {
    const state = store.getState();
    const pathRoot = useSelector((state: RootState) => state.projectManager.activeProject?.path);

    const xtermRef = useRef(null);
    const fitAddon = new FitAddon();
    const config = useSelector((state: RootState) => state.terminal.config);

    async function init() {
        if (config.port && config.token) {
            try {
                const BASEURL = `http://localhost:${config.port}`;
                const TOKEN = `${config.token}`;
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

                // check  the terminal named terminal is running ?
                const isTerminal = listTerminalRun.find((item) => item.name === Terminal);

                if (!isTerminal) {
                    // TerminalAPI.shutdownTerminal();
                    session = await terminalManager.startNew({
                        name: Terminal,
                        cwd: pathRoot,
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
                                xtermRef?.current?.terminal.write(
                                    "\r\n\r\n[Finished??? Term Session]\r\n"
                                );
                                break;
                            default:
                                break;
                        }
                    }
                );

                elementTerminal = document.getElementById(`Terminal`);
                new ResizeObserver(() => {
                    if (fitAddon !== undefined) {
                        fitAddon.fit();
                    }
                }).observe(elementTerminal);
            } catch (error) {}
        }
    }
    useEffect(() => {
        init();
        return () => {
            // session.di
        };
    }, [config]); //TODO: run this only once - not on rerender

    function onTermData(data: string) {
        if (session) {
            session.send({
                type: "stdin",
                content: [data],
            });
        }
    }

    useEffect(() => {
        if (xtermRef?.current) {
            console.log("xtermRef?.current", xtermRef?.current);
            console.log("xtermRef?.terminal", xtermRef?.current?.terminal);
        }
    }, [session]);

    const onResize = (event: { rows: number; cols: number }) => {
        if (xtermRef?.current?.terminal && session) {
            const content = [
                event.rows,
                event.cols,
                elementTerminal.offsetHeight,
                elementTerminal.offsetWidth,
            ];
            if (!session.isDisposed) {
                fitAddon.fit();
                // session.send({ type: "set_size", content });
            }
        }
    };
    const StyleXTerm = styled(XTerm)`
        height: 100%;
    `;
    return (
        <StyleXTerm
            onResize={onResize}
            options={{
                cursorBlink: true,
                /**
                 * The width of the cursor in CSS pixels when `cursorStyle` is set to 'bar'.
                 */
                cursorStyle: "bar",
                cursorWidth: 2,
                convertEol: true,
                fontFamily: "monospace",
                fontSize: 13,
                lineHeight: 1.20,
                fontWeight: 400,
                theme: {
                    selection: "#b1b1b155",
                    background: "white",
                    foreground: "#808080",
                    cursor: "#808080",
                },
            }}
            addons={[fitAddon]}
            onData={onTermData}
            ref={xtermRef}
        />
    );
};

export default TerminalComponent;
