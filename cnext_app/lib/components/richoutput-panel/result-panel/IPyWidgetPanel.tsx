import React, { Fragment, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ICodeLine } from "../../../interfaces/ICodeEditor";
import store, { RootState } from "../../../../redux/store";
import { ContentType } from "../../../interfaces/IApp";

import { KernelManager, ServerConnection } from "@jupyterlab/services";
import { WidgetManager } from "./WidgetManager";
import { useSelector } from "react-redux";

// const base = dynamic(
//     () => import("@jupyter-widgets/base"),
//     { ssr: false }
// );

// import pkg from "../../../@jupyter-widgets/html-manager";
// const {HTMLManager} = pkg;

// import * as base from "@jupyter-widgets/base";
import { SERVER_SOCKET_ENDPOINT } from "../../Socket";
import { IModel } from "@jupyterlab/services/lib/kernel/restapi";
let BASEURL = SERVER_SOCKET_ENDPOINT;

const IPyWidgetView = ({ codeResult }) => {
    // const activeLine = useSelector((state: RootState) => state.codeEditor.activeLine);
    const config = useSelector((state: RootState) => state.terminal.config);
    const inViewID = useSelector((state: RootState) => state.projectManager.inViewID);
    const kernelInfo = useSelector((state: RootState) => state.executorManager.kernelInfo);

    // const BASEURL = `${BASEURL}/jps`;

    if (BASEURL?.endsWith("/")) {
        BASEURL = BASEURL.slice(0, -1);
    }

    if (BASEURL === "") {
        BASEURL = window.location.origin;
    }

    const TOKEN = `${config.token}`;
    // const WSURL = "ws:" + BASEURL.split(":").slice(1).join(":");
    const connectionInfo = ServerConnection.makeSettings({
        baseUrl: BASEURL,
        wsUrl: BASEURL.replace("http", "ws"),
        token: TOKEN,
        appendToken: true,
        init: {},
    });

    const kernelManager = new KernelManager({ serverSettings: connectionInfo });
    // let kernel;

    // async function init() {
    //     kernel = await kernelManager.startNew();
    // };

    // useEffect(() => {
    //     init();
    // }, []);

    function renderResult() {
        const state = store.getState();
        // const inViewID = state.projectManager.inViewID;
        console.log("IPyWidgerPanel render inViewID:", inViewID);
        if (inViewID) {
            // const codeLines: ICodeLine[] = state.codeEditor.codeLines[inViewID];
            // const codeWithResult: ICodeLine[] = codeLines.filter(
            //     (code) => code.result?.type === ContentType.RICH_OUTPUT
            // );

            if (
                Object.keys(codeResult.result[0].content).includes(
                    "application/vnd.jupyter.widget-view+json"
                )
            ) {
                // Create the widget area and widget manager
                const widgetarea = document.getElementsByClassName("widgetarea")[0] as HTMLElement;
                // const manager = new HTMLManager();
                const widgetData: any =
                    codeResult.result[0].content["application/vnd.jupyter.widget-view+json"];
                let kernel = kernelManager.connectTo({ model: kernelInfo as IModel });
                console.log("Widget ", kernel, widgetData);

                // const manager = new WidgetManager(kernel);
                // if (
                //     widgetData !== undefined &&
                //     widgetData.version_major === 2
                // ) {
                // if (manager.has_model("widgetData.model_id")) {
                //     const model = manager.get_model(widgetData.model_id)!;
                //     manager.display_view(manager.create_view(model), widgetarea);
                //     console.log("Widget: ", model.resolve());
                // }
                // }
            }
        }
        return <></>;
    }

    return renderResult();
};

export default IPyWidgetView;
