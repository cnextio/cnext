export enum KernelManagerCommand {
    restart_kernel = "restart_kernel",
    interrupt_kernel = "interrupt_kernel",
    is_alive = "is_alive"
}

export interface IKernelManagerResultContent {
    success: boolean;
}

export interface ICheckAliveResultContent {
    alive: boolean;
}