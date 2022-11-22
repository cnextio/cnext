export enum ExecutorManagerCommand {
    restart_kernel = "restart_kernel",
    interrupt_kernel = "interrupt_kernel",
    get_status = "get_status",
    get_kernel_info = "get_kernel_info",
}

export interface IExecutorManagerResultContent {
    success: boolean;
    kernel_info: Object;
}

export interface IExecutorStatus {
    alive_status: boolean;
    resource_usage: object | null;
}

export interface KernelInfo {
    id: string;
    name: string;
    spec: Object;
}