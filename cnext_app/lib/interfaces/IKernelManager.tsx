export enum KernelManagerCommand {
    restart_kernel = "restart_kernel",
    interrupt_kernel = "interrupt_kernel",
}

export interface IKernelManagerResultContent {
    success: boolean;
}