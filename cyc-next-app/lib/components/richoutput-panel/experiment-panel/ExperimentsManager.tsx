import { Checkbox, FormControlLabel, FormGroup, Typography } from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import Moment from 'react-moment';
import 'moment-timezone';
import { useQuery, QueryCache, QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query-devtools';
import { CommandType, Message, WebAppEndpoint } from "../../../interfaces/IApp";
import { ExperimentManagerCommand } from "../../../interfaces/IExperimentManager";
import socket from "../../Socket";
import { 
    DFSelector as ExpSelector, 
    DFSelectorIcon, 
    DFSelectorMenuItem as ExpSelectorMenuItem, 
    ExperimentContainer, 
    ExperimentLeftPanel, 
    ExperimentRightPanel, 
    ExpSelectorForm, 
    RunSelectorForm, 
    RunSelectorLabel, 
    RunTimeLabel } from "../../StyledComponents";
import MetricPlots from "./MetricPlots";
import { setExpDict, setRunDict, setRunningRun, setRunSelection, setSelectedExp } from "../../../../redux/reducers/ExperimentManagerRedux";
import store from "../../../../redux/store";
import { useDispatch, useSelector } from "react-redux";

// const queryCache = new QueryCache();    

const ExperimentManager = (props: any) => {
    const [metricPlotData, setMetricPlot] = useState();
    const [timer, setTimer] = useState();
    const [timeout, setTimeout] = useState(0);
    let runDict = useSelector(state => state.experimentManager.runDict);
    let runningRunId = useSelector(state => state.experimentManager.runningRunId);
    let expDict = useSelector(state => state.experimentManager.expDict);
    // let runningExpId = useSelector(state => state.experimentManager.runningExpId);
    let selectedExpId = useSelector(state => state.experimentManager.selectedExpId);
    const dispatch = useDispatch();
    
    const refreshData = (expId) => {
        console.log('Exp timer refreshData timeout count and running id', timeout, expId);
        if(expId) {
            let message: Message = {
                webapp_endpoint: WebAppEndpoint.ExperimentManager,
                command_name: ExperimentManagerCommand.list_run_infos,
                type: CommandType.MLFLOW_CLIENT,            
                content: {
                    tracking_uri: '/Users/bachbui/works/cycai/cnext-working-dir/Skywalker/.mlflow',
                    experiment_id: expId
                }
            }
            sendMessage(message);

            let selectedRuns = Object.keys(runDict).filter((key) => runDict[key]['selected']);
            if (selectedRuns.length>0){
                let message: Message = {
                    webapp_endpoint: WebAppEndpoint.ExperimentManager,
                    command_name: ExperimentManagerCommand.get_metric_plots,
                    type: CommandType.MLFLOW_COMBINE,            
                    content: {
                        tracking_uri: '/Users/bachbui/works/cycai/cnext-working-dir/Skywalker/.mlflow',
                        experiment_id: expId,
                        run_ids: selectedRuns
                    }
                }
                sendMessage(message);
            }
        }  
    }

    useEffect(() => {
        let runningExpId = store.getState().experimentManager.runningExpId;
        if(timeout>0){
            refreshData(runningExpId);
        }            
    }, [timeout])

    useEffect(() => {
        let runningExpId = store.getState().experimentManager.runningExpId;
        if(!timer && runningRunId && (runningExpId === selectedExpId)){
            console.log('Exp timer set');
            setTimer(setInterval(() => {setTimeout(timeout => timeout+1);}, 10000));
        } 
        else if ((timer && !runningRunId) || (runningExpId !== selectedExpId)){
            clearInterval(timer);
            setTimer(null);
        }
    },[runningRunId, selectedExpId])

    useEffect(() => {
        if ((!selectedExpId && expDict) || (selectedExpId && !expDict[selectedExpId])) {
            console.log('Exp setSelectedExp', selectedExpId, expDict[selectedExpId], expDict)
            dispatch(setSelectedExp(Object.keys(expDict)[0]));
        }
    },[expDict])

    const setup_socket = () => {
        // const socket = openSocket(CODE_SERVER_SOCKET_ENDPOINT);
        socket.emit("ping", "ExperimentManager");
        socket.on(WebAppEndpoint.ExperimentManager, (result: string) => {
            console.log("ExperimentManager got results...", result);
            try {
                let emResult: Message = JSON.parse(result);
                if(!emResult.error){                                           
                    switch(emResult.command_name) {
                        case ExperimentManagerCommand.list_experiments: 
                            console.log('ExperimentView got list experiment: ', emResult.content);
                            let expDict = {};
                            for (let exp of emResult.content['experiments']) {
                                expDict[exp['_experiment_id']] = exp;
                            }
                            console.log('ExperimentManager: ', expDict);
                            dispatch(setExpDict(expDict));                                                            
                            break;
                        case ExperimentManagerCommand.list_run_infos: 
                            console.log('ExperimentView got list run: ', emResult.content);
                            let runDict = {};     
                            let runningRunId;                     
                            for (let run of emResult.content['runs']) {
                                let runId = run['_run_id'];
                                runDict[runId] = run;
                                if (run['_status'] == 'RUNNING'){ 
                                    // console.log('Exp timer running id ', run);                                   
                                    runningRunId = runId
                                }
                            }
                            dispatch(setRunDict(runDict));                            
                            dispatch(setRunningRun(runningRunId));
                            break;
                        case ExperimentManagerCommand.get_metric_plots: 
                            console.log('ExperimentView got metric plots: ');
                            // console.log('ExperimentView got metric plots: ', emResult.content);
                            setMetricPlot(emResult.content);
                            break;
                    } 
                } else {
                    console.log('ExperimentView command error: ', emResult);
                }
            } catch(error) {
                throw(error);
            }
        });
        // return () => socket.disconnect();
    };
    
    const sendMessage = (message: {}) => {
        console.log(`Send ${WebAppEndpoint.ExperimentManager} request: `, JSON.stringify(message));
        socket.emit(WebAppEndpoint.ExperimentManager, JSON.stringify(message));
    }

    useEffect(() => {
        setup_socket();
        let message: Message = {
            webapp_endpoint: WebAppEndpoint.ExperimentManager,
            command_name: ExperimentManagerCommand.list_experiments,
            type: CommandType.MLFLOW_CLIENT,            
            content: {
                tracking_uri: '/Users/bachbui/works/cycai/cnext-working-dir/Skywalker/.mlflow',            
            }
        }
        sendMessage(message);
    }, []);

    useEffect(()=>{
        if(selectedExpId) {
            let message: Message = {
                webapp_endpoint: WebAppEndpoint.ExperimentManager,
                command_name: ExperimentManagerCommand.list_run_infos,
                type: CommandType.MLFLOW_CLIENT,            
                content: {
                    tracking_uri: '/Users/bachbui/works/cycai/cnext-working-dir/Skywalker/.mlflow',
                    experiment_id: selectedExpId
                }
            }
            sendMessage(message);
        }        
    }, [selectedExpId]);

    useEffect(() => {
        if(runDict) {
            let selectedRuns = Object.keys(runDict).filter((key) => runDict[key]['selected']);
            if (selectedRuns.length>0){
                let message: Message = {
                    webapp_endpoint: WebAppEndpoint.ExperimentManager,
                    command_name: ExperimentManagerCommand.get_metric_plots,
                    type: CommandType.MLFLOW_COMBINE,            
                    content: {
                        tracking_uri: '/Users/bachbui/works/cycai/cnext-working-dir/Skywalker/.mlflow',
                        experiment_id: selectedExpId,
                        run_ids: selectedRuns
                    }
                }
                sendMessage(message);
            }
        }
    }, [runDict]);

    function handleExpChange(event: React.SyntheticEvent) {
        // console.log('Handle change: ', target);
        dispatch(setSelectedExp(event.target.value));
    };

    function handleRunsChange(event: React.SyntheticEvent) {
        console.log('ExperimentView: ', event.target.checked, event.target.id);
        if(runDict) {            
            dispatch(setRunSelection({id: event.target.id, selected: event.target.checked}));
        }        
    }
    const RUN_NAME_LENGTH = 10;
    return (
        <ExperimentContainer>
            <ExperimentLeftPanel>
                <Typography variant='subtitle'>Experiments</Typography>
                <ExpSelectorForm>
                    <ExpSelector                
                        onChange={handleExpChange}
                        value={selectedExpId && expDict ? expDict[selectedExpId]['_name'] : null}
                        // label={dfList.activeDF}
                        IconComponent={DFSelectorIcon}
                        SelectDisplayProps={{style: {padding: '0px 10px', lineHeight: '35px'}}}
                        // displayEmpty = {true}
                        renderValue = {()=>{
                            return (
                                <Fragment>
                                    {selectedExpId && expDict ? 
                                    <Typography height='100%' variant='caption' fontSize='14px'>
                                        {expDict[selectedExpId]['_name']}
                                    </Typography> :
                                    <Typography height='100%' variant='caption' fontSize='12px' color='#BFC7CF'>
                                        Experiments
                                    </Typography>
                                    }
                                </Fragment>
                            )    
                        }}                
                    >
                    {expDict && Object.keys(expDict).map((key, index)=>(
                        <ExpSelectorMenuItem value={expDict[key]['_experiment_id']}>
                            {expDict[key]['_name']}
                        </ExpSelectorMenuItem>
                    ))}                
                    </ExpSelector>
                </ExpSelectorForm>
                <Typography variant='subtitle'>Runs</Typography>
                <RunSelectorForm>    
                    {runDict && Object.keys(runDict)
                        .sort((k1, k2) => runDict[k2]['_start_time']-runDict[k1]['_start_time'])
                        .map((key, index)=>(
                        <RunSelectorLabel 
                            key = {key}
                            control={
                                <Checkbox id={key} defaultChecked={runDict[key]['selected']}/>
                            } 
                            label={
                                <Fragment>
                                {runDict[key]['_cnext_metadata']['run_name']}
                                {/* {Object.keys(runDict[key]).includes('_name')?runDict[key]['_name']:key.slice(0,RUN_NAME_LENGTH)} */}
                                {' - '}
                                <RunTimeLabel variant='caption' sx={{fontStyle: 'italic'}}>
                                    <Moment unix fromNow>{runDict[key]['_start_time']/1000}</Moment>
                                </RunTimeLabel>
                                </Fragment>
                            } 
                            onChange = {handleRunsChange}
                        />
                    ))}                 
                    
                </RunSelectorForm>
            </ExperimentLeftPanel>
            <ExperimentRightPanel>
                <MetricPlots metricPlotData={metricPlotData} />
            </ExperimentRightPanel>
        </ExperimentContainer>
    )
}

export default ExperimentManager;


