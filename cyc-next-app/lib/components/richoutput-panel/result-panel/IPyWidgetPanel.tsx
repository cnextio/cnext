import React, { Fragment, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ICodeLine } from "../../../interfaces/ICodeEditor";
import store, { RootState } from "../../../../redux/store";
import { ContentType } from "../../../interfaces/IApp";

import {
  KernelManager,
  ServerConnection,
  KernelMessage,
} from '@jupyterlab/services';
import { useSelector } from "react-redux";

const { HTMLManager } = dynamic(
    () => import("../../../@jupyter-widgets/html-manager"),
    { ssr: false }
);

// const { * as base } = dynamic(
//     () => import("../../../@jupyter-widgets/base"),
//     { ssr: false }
// );

import { Kernel } from '@jupyterlab/services';

class WidgetManager extends HTMLManager {
  constructor(kernel: Kernel.IKernelConnection) {
    super();
    this.kernel = kernel;

    kernel.registerCommTarget(this.comm_target_name, async (comm, msg) => {
      const oldComm = new base.shims.services.Comm(comm);
      await this.handle_comm_open(oldComm, msg);
    });
  }

  /**
   * Create a comm.
   */
  async _create_comm(
    target_name: string,
    model_id: string,
    data?: any,
    metadata?: any
  ): Promise<base.shims.services.Comm> {
    const comm = this.kernel.createComm(target_name, model_id);
    if (data || metadata) {
      comm.open(data, metadata);
    }
    return Promise.resolve(new base.shims.services.Comm(comm));
  }

  /**
   * Get the currently-registered comms.
   */
  _get_comm_info(): Promise<any> {
    return this.kernel
      .requestCommInfo({ target_name: this.comm_target_name })
      .then((reply) => (reply.content as any).comms);
  }

  kernel: Kernel.IKernelConnection;
}

const IPyWidgetView = (props: any) => {
    const activeLine = useSelector((state: RootState) => state.codeEditor.activeLine);
    const BASEURL = "http://localhost:8888";
    const WSURL = "ws:" + BASEURL.split(":").slice(1).join(":");
    const connectionInfo = ServerConnection.makeSettings({
        baseUrl: BASEURL,
        wsUrl: WSURL,
    });
    const kernelManager = new KernelManager({ serverSettings: connectionInfo });
    let kernel;

    async function init() {        
        kernel = await kernelManager.startNew();
    };

    useEffect(() => {
        init();
    }, []);

    async function renderResult() {
        const state = store.getState();
        const inViewID = state.projectManager.inViewID;
        console.log('IPyWidgerPanel: render');
        if (inViewID) {
            const codeLines: ICodeLine[] = state.codeEditor.codeLines[inViewID];
            const codeWithResult: ICodeLine[] = codeLines.filter(
                (code) => code.result?.type === ContentType.RICH_OUTPUT
            );
            for (let i = 0; i < codeWithResult.length; i++) {
                if (
                    codeWithResult[i].result?.subType ==
                    "application/vnd.jupyter.widget-view+json"
                ) {
                    // Create the widget area and widget manager
                    const widgetarea = document.getElementsByClassName(
                        "widgetarea"
                    )[0] as HTMLElement;
                    // const manager = new HTMLManager();
                    const manager = new WidgetManager(kernel);                    
                    const widgetData: any =
                        codeWithResult[i].result?.content?.data[
                            "application/vnd.jupyter.widget-view+json"
                        ];
                    // if (
                    //     widgetData !== undefined &&
                    //     widgetData.version_major === 2
                    // ) {
                        if (manager.has_model('widgetData.model_id')) {
                            const model = await manager.get_model(
                                widgetData.model_id
                            )!;
                            manager.display_view(
                                manager.create_view(model),
                                widgetarea
                            );
                        }
                    // }
                }
            }
            return (
              <Fragment />  
            );
        } else return null;
    };

    return renderResult();
};

export default IPyWidgetView;
