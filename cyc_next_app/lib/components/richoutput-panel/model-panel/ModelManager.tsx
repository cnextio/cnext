import { Message } from "@lumino/messaging";
import { IconButton } from "@mui/material";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setModelInfo, setModelViewerInfo, setReload } from "../../../../redux/reducers/ModelManagerRedux";
import store, { RootState } from "../../../../redux/store";
import { ContentType, IMessage, WebAppEndpoint } from "../../../interfaces/IApp";
import {
    IModelInfo,
    IModelViewerInfo,
    ModelManagerCommand,
    NetronStatus,
} from "../../../interfaces/IModelManager";
import socket from "../../Socket";
import { DataToolbar as ModelManagerToolbar } from "../../StyledComponents";
import ModelExplorer from "./ModelExplorer";
import ReplayIcon from "@mui/icons-material/Replay";

const ModelManager = () => {
    const dispatch = useDispatch();
    const activeModel = useSelector((state: RootState) => state.modelManager.activeModel);
    const modelInfoReloadCounter = useSelector(
        (state: RootState) => state.modelManager.modelInfoReloadCounter
    );
    const modelInfoUpdatedCounter = useSelector(
        (state: RootState) => state.modelManager.modelInfoUpdatedCounter
    );

    const createMessage = (
        command: ModelManagerCommand,
        content: {} | null = null,
        metadata: {} = {}
    ): IMessage => {
        let message: IMessage = {
            webapp_endpoint: WebAppEndpoint.ModelManager,
            command_name: command,
            seq_number: 1,
            content: content,
            type: ContentType.STRING,
            error: false,
            metadata: metadata,
        };
        return message;
    };

    const sendMessage = (message: IMessage) => {
        console.log(`${message.webapp_endpoint} send message: ${JSON.stringify(message)}`);
        socket.emit(message.webapp_endpoint, JSON.stringify(message));
    };

    const setupSocket = () => {
        socket.emit("ping", "ModelManager");
        socket.on(WebAppEndpoint.ModelManager, (result: string) => {
            console.log("ModelManager got results...", result);
            try {
                let mmResult: IMessage = JSON.parse(result);
                if (!mmResult.error) {
                    switch (mmResult.command_name) {
                        case ModelManagerCommand.get_active_models_info:
                            let modelInfo = mmResult.content as IModelInfo;
                            // console.log("ModelManager got active model: ", modelInfo);
                            dispatch(setModelInfo(modelInfo));
                            // displayModel();
                            break;
                        case ModelManagerCommand.display_model:
                            let modelViewerInfo = mmResult.content as IModelViewerInfo;
                            dispatch(setModelViewerInfo(modelViewerInfo));
                            break;
                    }
                } else {
                    dispatch(setModelViewerInfo(null));
                }
            } catch (error) {
                throw error;
            }
        });
    };

    const reload_active_models_info = () => {
        const message = createMessage(ModelManagerCommand.get_active_models_info);
        sendMessage(message);
    };

    useEffect(() => {
        setupSocket();
        return () => {
            socket.off(WebAppEndpoint.ModelManager);
        };
    }, []);

    const displayModel = () => {
        const state = store.getState();
        const activeModel = state.modelManager.activeModel;
        if (activeModel != null) {
            let activeModelInfo = state.modelManager.modelInfo[activeModel];
            const message = createMessage(ModelManagerCommand.display_model, activeModelInfo);
            sendMessage(message);
        }
    };

    /** use this to avoid calling displayModel when this component has just been reloaded */
    const firstRender = useRef(true);
    useEffect(() => {
        /** call this when model info is updated even when activeModel has not changed or when activeModel changed */
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        displayModel();
    }, [modelInfoUpdatedCounter]);

    useEffect(() => {
        reload_active_models_info();
    }, [modelInfoReloadCounter, activeModel]);

    return null;
};

const ReloadButton = () => {
    const dispatch = useDispatch();

    const reload = () => {
        dispatch(setReload(null));
    }
    
    return (
        <IconButton
            onClick={reload}
            aria-label="Back"
            size="medium"
            color="default"
        >
            {<ReplayIcon fontSize="small" style={{ width: "20px", height: "20px" }} />}
        </IconButton>
    );
};

const ModelPanel = () => {
    const modelViewerCounter = useSelector(
        (state: RootState) => state.modelManager.modelViewerCounter
    );
    
    /** use this to avoid showing the model when this component has just been reloaded 
     * instead wait until the modelInfo has been updated first */
    const firstRender = useRef(true);
    useEffect(() => {
        firstRender.current = false;
    }, []);

    const createModelViewerComponent = () => {
        const state = store.getState();
        const modelViewerInfo = state.modelManager.modelViewerInfo;
        if (modelViewerCounter > 0 && modelViewerInfo != null && modelViewerInfo.status===NetronStatus.OK) {
            const address = `http://${modelViewerInfo.address[0]}:${modelViewerInfo.address[1]}`;
            console.log("ModelManager: ", address);
            return (
                <iframe
                    key={modelViewerCounter}
                    style={{ width: "100%", height: "100%", border: "none", paddingLeft: "25px" }}
                    src={address}
                />
            );
        } else {
            return null;
        }
    };

    return (
        <Fragment>
            <ModelManager />
            <ModelManagerToolbar>
                <ModelExplorer />
                <ReloadButton />
            </ModelManagerToolbar>
            {!firstRender.current && createModelViewerComponent()}
        </Fragment>
    );
};

export default ModelPanel;
