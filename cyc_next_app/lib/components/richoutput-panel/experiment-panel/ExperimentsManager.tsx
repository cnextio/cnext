import { Checkbox, Typography } from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import Moment from "react-moment";
import "moment-timezone";
import { CommandType, IMessage, WebAppEndpoint } from "../../../interfaces/IApp";
import { ExperimentManagerCommand } from "../../../interfaces/IExperimentManager";
import socket from "../../Socket";
import {
    DFSelector as ExpSelector,
    SmallArrowIcon,
    DFSelectorMenuItem as ExpSelectorMenuItem,
    ExperimentContainer,
    ExperimentLeftPanel,
    ExperimentRightPanel,
    ExpSelectorForm,
    RunSelectorForm,
    RunSelectorLabel,
    RunTimeLabel,
} from "../../StyledComponents";
import MetricPlots from "./MetricPlots";
import {
    setExpDict,
    setRunDict,
    setRunningRun,
    setRunSelection,
    setSelectedExp,
} from "../../../../redux/reducers/ExperimentManagerRedux";
import store, { RootState } from "../../../../redux/store";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { setCodeToInsert } from "../../../../redux/reducers/CodeEditorRedux";
import { ICodeToInsert } from "../../../interfaces/ICodeEditor";
import { IMenuItem, MetricPlotContextMenuItems } from "../../../interfaces/IContextMenu";
import { ifElse } from "../../libs";

const ExperimentManager = (props: any) => {
    const [metricPlotData, setMetricPlot] = useState();
    const [timer, setTimer] = useState();
    const [timeout, setTimeout] = useState(0);
    let runDict = useSelector((state: RootState) => state.experimentManager.runDict);
    let expDict = useSelector((state: RootState) => state.experimentManager.expDict);
    let selectedRunIds = useSelector((state: RootState) => getSelectedRuns(state), shallowEqual);
    let selectedRunningRunId = useSelector((state: RootState) => getSelectedRunningRun(state));
    let selectedExpId = useSelector((state: RootState) => state.experimentManager.selectedExpId);
    const dispatch = useDispatch();

    function getSelectedRuns(state: RootState) {
        let runDict = state.experimentManager.runDict;
        return runDict ? Object.keys(runDict).filter((key) => runDict[key]["selected"]) : null;
    }

    function getSelectedRunningRun(state: RootState) {
        let runDict = state.experimentManager.runDict;
        /** There should be only one running run so we only get the first item of the list */
        return runDict
            ? Object.keys(runDict).filter(
                  (key) => runDict[key]["_status"] == "RUNNING" && runDict[key]["selected"]
              )[0]
            : null;
    }

    const refreshData = (expId: string) => {
        console.log("Exp timer refreshData timeout count and running id", timeout, expId);
        let tracking_uri =
            store.getState().projectManager?.configs?.experiment_manager?.mlflow_tracking_uri;
        if (expId && tracking_uri) {
            let message: IMessage = {
                webapp_endpoint: WebAppEndpoint.ExperimentManager,
                command_name: ExperimentManagerCommand.list_run_infos,
                type: CommandType.MLFLOW_CLIENT,
                content: {
                    tracking_uri: tracking_uri,
                    experiment_id: expId,
                },
            };
            sendMessage(message);

            let selectedRuns = Object.keys(runDict).filter((key) => runDict[key]["selected"]);
            if (selectedRuns.length > 0) {
                let message: IMessage = {
                    webapp_endpoint: WebAppEndpoint.ExperimentManager,
                    command_name: ExperimentManagerCommand.get_metric_plots,
                    type: CommandType.MLFLOW_OTHERS,
                    content: {
                        tracking_uri: tracking_uri,
                        experiment_id: expId,
                        run_ids: selectedRuns,
                    },
                };
                sendMessage(message);
            }
        }
    };

    useEffect(() => {
        let selectedExpId = store.getState().experimentManager.selectedExpId;
        if (timeout > 0) {
            refreshData(selectedExpId);
        }
    }, [timeout]);

    /**
     * If a selected run is also running then set the timer to refresh it
     */
    useEffect(() => {
        // let runningExpId = store.getState().experimentManager.runningExpId;
        console.log("ExperimentManager selectedRunningRunId: ", selectedRunningRunId);
        if (!timer && selectedRunningRunId) {
            console.log("ExperimentManager setTimer");
            setTimer(
                setInterval(() => {
                    setTimeout((timeout) => timeout + 1);
                }, 10000)
            );
        } else if (timer && !selectedRunningRunId) {
            console.log("ExperimentManager clearTimer");
            clearInterval(timer);
            setTimer(null);
        }
    }, [selectedRunningRunId]);

    /**
     * If selected runs have changed then reload the metric plots
     */
    useEffect(() => {
        let tracking_uri =
            store.getState().projectManager?.configs?.experiment_manager?.mlflow_tracking_uri;
        if (tracking_uri && selectedRunIds && selectedRunIds.length > 0) {
            let message: IMessage = {
                webapp_endpoint: WebAppEndpoint.ExperimentManager,
                command_name: ExperimentManagerCommand.get_metric_plots,
                type: CommandType.MLFLOW_OTHERS,
                content: {
                    tracking_uri: tracking_uri,
                    experiment_id: selectedExpId,
                    run_ids: selectedRunIds,
                },
            };
            sendMessage(message);
        }
    }, [selectedRunIds]);

    /**
     * If experiment lists change and reset the selected Exp when applicable
     */
    useEffect(() => {
        /**
         * Reset the selectedExp when applicapable
         */
        if ((!selectedExpId && expDict) || (selectedExpId && !expDict[selectedExpId])) {
            console.log("Exp setSelectedExp", selectedExpId, expDict[selectedExpId], expDict);
            dispatch(setSelectedExp(Object.keys(expDict)[0]));
        }
    }, [expDict]);

    /**
     * If selected exp has changed then reload the run list
     */
    useEffect(() => {
        let tracking_uri =
            store.getState().projectManager?.configs?.experiment_manager?.mlflow_tracking_uri;
        if (tracking_uri && selectedExpId) {
            let message: IMessage = {
                webapp_endpoint: WebAppEndpoint.ExperimentManager,
                command_name: ExperimentManagerCommand.list_run_infos,
                type: CommandType.MLFLOW_CLIENT,
                content: {
                    tracking_uri: tracking_uri,
                    experiment_id: selectedExpId,
                },
            };
            sendMessage(message);
        }
    }, [selectedExpId]);

    const socketInit = () => {
        // const socket = openSocket(CODE_SERVER_SOCKET_ENDPOINT);
        socket.emit("ping", "ExperimentManager");
        socket.on(WebAppEndpoint.ExperimentManager, (result: string) => {
            console.log("ExperimentManager got results...", result);
            try {
                let emResult: IMessage = JSON.parse(result);
                if (!emResult.error) {
                    switch (emResult.command_name) {
                        case ExperimentManagerCommand.list_experiments:
                            console.log(
                                "ExperimentManager got list experiment: ",
                                emResult.content
                            );
                            let expDict = {};
                            for (let exp of emResult.content["experiments"]) {
                                expDict[exp["_experiment_id"]] = exp;
                            }
                            console.log("ExperimentManager: ", expDict);
                            dispatch(setExpDict(expDict));
                            break;
                        case ExperimentManagerCommand.list_run_infos:
                            console.log("ExperimentManager got list run: ", emResult.content);
                            let runDict = {};
                            let runningRunId;
                            for (let run of emResult.content["runs"]) {
                                let runId = run["_run_id"];
                                runDict[runId] = run;
                                if (run["_status"] == "RUNNING") {
                                    // console.log('Exp timer running id ', run);
                                    runningRunId = runId;
                                }
                            }
                            dispatch(setRunDict(runDict));
                            dispatch(setRunningRun(runningRunId));
                            break;
                        case ExperimentManagerCommand.get_metric_plots:
                            console.log("ExperimentManager got metric plots: ");
                            // console.log('ExperimentView got metric plots: ', emResult.content);
                            setMetricPlot(emResult.content);
                            break;
                    }
                } else {
                    console.log("ExperimentView command error: ", emResult);
                }
            } catch (error) {
                throw error;
            }
        });
        // return () => socket.disconnect();
    };

    const sendMessage = (message: {}) => {
        console.log(`Send ${WebAppEndpoint.ExperimentManager} request: `, JSON.stringify(message));
        socket.emit(WebAppEndpoint.ExperimentManager, JSON.stringify(message));
    };

    useEffect(() => {
        socketInit();
        let tracking_uri =
            store.getState().projectManager.configs?.experiment_manager?.mlflow_tracking_uri;
        let message: IMessage = {
            webapp_endpoint: WebAppEndpoint.ExperimentManager,
            command_name: ExperimentManagerCommand.list_experiments,
            type: CommandType.MLFLOW_CLIENT,
            content: {
                tracking_uri: tracking_uri,
            },
        };
        sendMessage(message);
        return () => {
            socket.off(WebAppEndpoint.ExperimentManager);
        };
    }, []);

    function handleExpChange(event: React.SyntheticEvent) {
        console.log("ExperimentView handleExpChange: ", event.target);
        dispatch(setSelectedExp(event.target.value));
    }

    function handleRunsChange(event: React.SyntheticEvent) {
        console.log("ExperimentView handleRunsChange: ", event.target.checked, event.target.id);
        if (runDict) {
            dispatch(
                setRunSelection({
                    id: event.target.id,
                    selected: event.target.checked,
                })
            );
        }
    }

    const handleContextMenuSelection = (item: IMenuItem) => {
        console.log("ExperimentView handleContextMenuSelection", item);
        if (item) {
            switch (item.name) {
                case MetricPlotContextMenuItems.LOAD_CHECKPOINT:
                    /** first, download the artifacts to local */
                    let local_dir =
                        store.getState().projectManager.configs?.experiment_manager?.local_tmp_dir;
                    let tracking_uri =
                        store.getState().projectManager.configs?.experiment_manager
                            ?.mlflow_tracking_uri;
                    let artifact_path =
                        item && item.metadata ? ifElse(item.metadata, "checkpoint", null) : null;
                    let run_id =
                        item && item.metadata ? ifElse(item.metadata, "run_id", null) : null;
                    if (artifact_path) {
                        let message: IMessage = {
                            webapp_endpoint: WebAppEndpoint.ExperimentManager,
                            command_name: ExperimentManagerCommand.load_artifacts_to_local,
                            type: CommandType.MLFLOW_OTHERS,
                            content: {
                                tracking_uri: tracking_uri,
                                artifact_path: artifact_path,
                                local_dir: local_dir,
                                run_id: run_id,
                            },
                        };
                        sendMessage(message);
                        /** then, insert code to load weights */
                        let codeToInsert: ICodeToInsert = {
                            code: `model.load_weights('${local_dir}/${artifact_path}')`,
                        };
                        dispatch(setCodeToInsert(codeToInsert));
                    }
                    break;
            }
        }
    };

    return (
        <ExperimentContainer>
            <ExperimentLeftPanel>
                <Typography variant='subtitle'>Experiments</Typography>
                <ExpSelectorForm>
                    <ExpSelector
                        onChange={handleExpChange}
                        value={selectedExpId && expDict ? expDict[selectedExpId]["_name"] : null}
                        // label={dfList.activeDF}
                        IconComponent={SmallArrowIcon}
                        SelectDisplayProps={{
                            style: { padding: "0px 10px", lineHeight: "35px" },
                        }}
                        // displayEmpty = {true}
                        renderValue={() => {
                            return (
                                <Fragment>
                                    {selectedExpId && expDict ? (
                                        <Typography height='100%' variant='caption' fontSize='14px'>
                                            {expDict[selectedExpId]["_name"]}
                                        </Typography>
                                    ) : (
                                        <Typography
                                            height='100%'
                                            variant='caption'
                                            fontSize='12px'
                                            color='#BFC7CF'
                                        >
                                            Experiments
                                        </Typography>
                                    )}
                                </Fragment>
                            );
                        }}
                    >
                        {expDict &&
                            Object.keys(expDict).map((key, index) => (
                                <ExpSelectorMenuItem value={expDict[key]["_experiment_id"]}>
                                    {expDict[key]["_name"]}
                                </ExpSelectorMenuItem>
                            ))}
                    </ExpSelector>
                </ExpSelectorForm>
                <Typography variant='subtitle'>Runs</Typography>
                <RunSelectorForm>
                    {runDict &&
                        Object.keys(runDict)
                            .sort(
                                (k1, k2) => runDict[k2]["_start_time"] - runDict[k1]["_start_time"]
                            )
                            .map((key, index) => (
                                <RunSelectorLabel
                                    key={key}
                                    control={
                                        <Checkbox
                                            id={key}
                                            defaultChecked={runDict[key]["selected"]}
                                        />
                                    }
                                    label={
                                        <Fragment>
                                            {runDict[key]["_cnext_metadata"]["run_name"]}
                                            {" - "}
                                            <RunTimeLabel
                                                variant='caption'
                                                sx={{ fontStyle: "italic" }}
                                            >
                                                <Moment unix fromNow>
                                                    {runDict[key]["_start_time"] / 1000}
                                                </Moment>
                                            </RunTimeLabel>
                                        </Fragment>
                                    }
                                    onChange={handleRunsChange}
                                />
                            ))}
                </RunSelectorForm>
            </ExperimentLeftPanel>
            <ExperimentRightPanel>
                {selectedRunIds && selectedRunIds.length > 0 && (
                    <MetricPlots
                        metricPlotData={metricPlotData}
                        handleContextMenuSelection={handleContextMenuSelection}
                    />
                )}
            </ExperimentRightPanel>
        </ExperimentContainer>
    );
};

export default ExperimentManager;
