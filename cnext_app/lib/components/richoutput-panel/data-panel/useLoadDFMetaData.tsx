import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setTextOutput } from "../../../../redux/reducers/RichOutputRedux";
import store from "../../../../redux/store";
import { CommandName, ContentType, IMessage, WebAppEndpoint } from "../../../interfaces/IApp";
import {
    handleGetDFMetadata,
    sendGetDFMetadata,
} from "../../dataframe-manager/libDataFrameManager";
import { SocketContext } from "../../Socket";

export const useLoadDFMetaData = () => {
    const socket = useContext(SocketContext);
    // const dfMetaDataList = useSelector((state: RootState) => state.dataFrames?.metadata);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const dispatch = useDispatch();

    // const reset = useCallback(() => {
    //     setIsError(false);
    //     // dispatch(setTableData({ df_id: df_id, data: null }));
    // }, []);

    // useEffect(() => {
    //     reset();
    // }, [df_id]);

    const loadDFMetaData = useCallback((df_id: string) => {
        if (df_id) {
            const state = store.getState();
            const type = state.dataFrames.metadata[df_id]?.type;
            setIsLoading(true);
            if (socket) sendGetDFMetadata(WebAppEndpoint.DFExplorer, socket, df_id, type);
        }
    }, [socket]);

    const socketInit = () => {
        // socket?.emit("ping", WebAppEndpoint.DataViewer);
        socket?.on(WebAppEndpoint.DFExplorer, (result: string, ack) => {
            try {
                let message: IMessage = JSON.parse(result);
                console.log(`${WebAppEndpoint.DataViewer} got results for command`, message);
                if (!message.error) {
                    if (message.type === ContentType.STRING) {
                        dispatch(setTextOutput(message));
                    } else if (message.command_name === CommandName.get_df_metadata) {
                        handleGetDFMetadata(message);
                    } else {
                        // console.log("dispatch text output");
                        dispatch(setTextOutput(message));
                    }
                } else {
                    setIsError(true);
                    dispatch(setTextOutput(message));
                }
                setIsLoading(false);
            } catch (error) {
                setIsError(true);
                console.error(error);
            }
            if (ack) ack();
        });
    };

    useEffect(() => {
        socketInit();
        return () => {
            socket?.off(WebAppEndpoint.DFExplorer);
        };
    }, [socket]);

    return { loadDFMetaData, isLoading };
};
