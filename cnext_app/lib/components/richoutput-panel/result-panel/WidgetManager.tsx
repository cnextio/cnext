import dynamic from "next/dynamic";

import { Kernel } from "@jupyterlab/services";

const { HTMLManager } = dynamic(() => import("@jupyter-widgets/html-manager"), {
    ssr: false,
});

export class WidgetManager extends HTMLManager {
    constructor(kernel: Kernel.IKernelConnection) {
        super();
        this.kernel = kernel;

        kernel.registerCommTarget(this.comm_target_name, async (comm, msg) => {
            const oldComm = new BASEURL.shims.services.Comm(comm);
            await this.handle_comm_open(oldComm, msg);
        });
    }

    /**
     * Create a comm.
     */
    async _create_comm(target_name: string, model_id: string, data?: any, metadata?: any) {
        //: Promise<base.shims.services.Comm> {
        const comm = this.kernel.createComm(target_name, model_id);
        if (data || metadata) {
            comm.open(data, metadata);
        }
        return Promise.resolve(new BASEURL.shims.services.Comm(comm));
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
