import { AccountContextMenuItem } from "./IAccount";

export interface IMenuItem {
    name: MetricPlotContextMenuItems | AccountContextMenuItem | undefined;
    text: string;
    disable: boolean;
    metadata?: {} | undefined;
}

export interface IMenuPosision {
    mouseX: number;
    mouseY: number;
}

export interface IContextMenu {
    menu: IMenuItem[];
    pos: IMenuPosision;
}

export enum MetricPlotContextMenuItems {
    LOAD_CHECKPOINT = "Load checkpoint",
    LOAD_MODEL = "Load model",
    COPY_CHECKPOINT_PATH = "Copy checkpoint path",
}
