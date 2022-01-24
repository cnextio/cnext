export interface IMenuContent {
    name: MetricPlotContextMenuItems|null;
    text: string;
    disable: boolean;
}

export interface IMenuPosision {
    mouseX: number;
    mouseY: number;
}

export interface IContextMenu {
    menu: IMenuContent[];
    pos: IMenuPosision;
}

export enum MetricPlotContextMenuItems {
    LOAD_CHECKPOINT,
}