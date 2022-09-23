import React, { useEffect, useState } from "react";
import { IMessage, WebAppEndpoint } from "../../interfaces/IApp";
import CircleIcon from "@mui/icons-material/Circle";
import { ExecutorManagerCommand, IExecutorStatus } from "../../interfaces/IExecutorManager";
import socket from "../Socket";
import { TextIOHeaderText } from "../StyledComponents";
import { green, red } from "@mui/material/colors";
import { useDispatch, useSelector } from "react-redux";
import {
    setExecutorStatus,
    updateExecutorRestartCounter,
} from "../../../redux/reducers/ExecutorManagerRedux";
import { RootState } from "../../../redux/store";

const ExecutorStatus = () => {
    const executorStatus = useSelector((state: RootState) => state.executorManager.executorStatus);
    const dispatch = useDispatch();
    const socketInit = () => {
        socket.emit("ping", WebAppEndpoint.ExecutorManager);
        socket.on(WebAppEndpoint.ExecutorManager, (result: string, ack) => {
            try {
                let message: IMessage = JSON.parse(result);
                console.log(`${WebAppEndpoint.ExecutorManager} got results for command `, message);
                if (!message.error) {
                    if (message.command_name === ExecutorManagerCommand.get_status) {
                        let executorStatus = message.content as IExecutorStatus;
                        // console.log("KernelManager kernel status: ", executorStatus.resource);
                        // setExecutorStatus(executorStatus);
                        dispatch(setExecutorStatus(executorStatus));
                    } else if (message.command_name === ExecutorManagerCommand.restart_kernel) {
                        let resultContent = message.content;
                        if (resultContent.success === true) {
                            dispatch(updateExecutorRestartCounter());
                        }
                    }
                }
            } catch (error) {
                console.log(error);
            }
            if (ack) ack();
        });
    };

    useEffect(() => {
        socketInit();
        return () => {
            socket.off(WebAppEndpoint.ExecutorManager);
        };
    }, []);

    const showResourceUsage = () => {
        if (executorStatus?.resource_usage?.limits?.memory.rss > 0) {
            return (
                <>
                    Mem: {(executorStatus?.resource_usage?.rss / 1024 ** 3).toFixed(3)}/
                    {(executorStatus?.resource_usage?.limits?.memory?.rss / 1024 ** 3).toFixed(3)}{" "}
                    (GB)
                </>
            );
        } else {
            return <>Mem: {(executorStatus?.resource_usage?.rss / 1024 ** 3).toFixed(3)} (GB)</>;
        }
    };

    return (
        <div className="executor-status" style={{ display: "flex", flexDirection: "row" }}>
            <TextIOHeaderText>{showResourceUsage()}</TextIOHeaderText>
            <TextIOHeaderText style={{ marginRight: "0px" }}>
                <CircleIcon
                    sx={{ fontSize: "11px", marginTop: "3px" }}
                    color={executorStatus?.alive_status ? "success" : "error"}
                />
            </TextIOHeaderText>
        </div>
    );
};

export default ExecutorStatus;
