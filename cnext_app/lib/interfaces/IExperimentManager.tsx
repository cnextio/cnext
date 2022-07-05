export enum ExperimentManagerCommand {
    list_experiments = "list_experiments",
    get_metric_history = "get_metric_history",
    list_run_infos = "list_run_infos",
    get_metric_plots = "get_metric_plots",
    load_artifacts_to_local = "load_artifacts_to_local",
    set_tracking_uri = "set_tracking_uri",
}

export enum ReduxActionType {
    SET_RUN_DICT = "set_run_dict",
    SET_EXP_DICT = "set_exp_dict",
    SET_RUN_SELECTION = "set_run_selection",
    SET_RUNNING_RUN = "set_running_run",
    SET_RUNNING_EXP = "set_running_exp",
}
