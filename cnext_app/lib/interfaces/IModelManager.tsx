export interface IModelInfo {
    name: string;
    object_id: number;
    class: string;
    base_class: string;
}

export interface IModelViewerInfo {
    address: [string, number];
    status: NetronStatus;
}

export enum ModelManagerCommand {
    get_active_models_info = "get_active_models_info",
    display_model = "display_model"
};

export enum NetronStatus {
    OK = "ok",
    ERROR = "error"
};