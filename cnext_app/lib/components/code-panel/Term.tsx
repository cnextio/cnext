// import { Terminal } from "./term-jupyter";

// const TermTest = () => {
//     const term = new Terminal({
//         session: {
//             model: { name: "" },
//         },
//         options: {},
//         translator: null,
//     });
// };
import React, { Fragment, useEffect, useState } from "react";
// const coreutils_1 = require("@jupyterlab/coreutils");
import { PageConfig } from "@jupyterlab/coreutils";
import { TerminalManager, ServerConnection } from "@jupyterlab/services";

let urlTerminal = "api/terminals";

const TermTest = (props: any) => {
    const BASEURL = "http://localhost:8889";
    const WSURL = "ws:" + BASEURL.split(":").slice(1).join(":");
    console.log(`WSURL`, WSURL);

    const connectionInfo = ServerConnection.makeSettings({
        baseUrl: BASEURL,
        wsUrl: WSURL,
        token: `53a794fce4cbaaeaf77dcf47b2e70fe840f09591c2cd30c9`,
        init: {
            referrerPolicy: "origin",
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
        },
    });
    const terminalManager = new TerminalManager({
        serverSettings: connectionInfo,
    });
    let terminal;
    async function init() {
        PageConfig.setOption(`terminalsAvailable`, "true");
        terminal = await terminalManager.startNew({ name: "test", cwd: "/" });
    }

    async function createTerminalWithRestApi(url = "", data = {}) {
        // Default options are marked with *
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
        });
        return response.json(); // parses JSON response into native JavaScript objects
    }

    useEffect(() => {
        createTerminalWithRestApi(
            "http://localhost:8888/api/terminals?token=53a794fce4cbaaeaf77dcf47b2e70fe840f09591c2cd30c9",
            { name: `test` }
        ).then((data) => {
            console.log(`data datadata`, data); // JSON data parsed by `data.json()` call
        });
        init();
    }, []);

    return <div>test</div>;
};

export default TermTest;
