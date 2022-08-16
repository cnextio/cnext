export enum ExecutorManagerCommand {
    restart_kernel = "restart_kernel",
    interrupt_kernel = "interrupt_kernel",
    get_status = "get_status",
}

export interface IExecutorManagerResultContent {
    success: boolean;
}

export interface IExecutorStatus {
    alive_status: boolean;
    resource_usage: object | null;
}
