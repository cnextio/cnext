import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setTextOutput } from "../../../../redux/reducers/RichOutputRedux";
import {
    CommandName,
    ContentType,
    IMessage,
    ITableData,
    ITableMetaData,
    WebAppEndpoint,
} from "../../../interfaces/IApp";
import { SocketContext } from "../../Socket";
import { sendGetTableData } from "./libDataView";

export const useLoadTableData = (df_id: string | null, numKeepPages = 3) => {
    const socket = useContext(SocketContext);
    const [isLoading, setIsLoading] = useState(false);
    const [fromPage, setFromPage] = useState<number | null>(null);
    const [toPage, setToPage] = useState<number | null>(null);
    const [totalSize, setTotalSize] = useState<number>(0);
    const [pagedTableData, setPagedTableData] = useState<ITableData[] | null>(null);
    const dispatch = useDispatch();
        
    useEffect(() => {
        // setIsLoading(false);
        setFromPage(null);
        setToPage(null);
        setTotalSize(0);
        setPagedTableData(null);
    }, [df_id]);
    // console.log("DataViewer useLoadTableData: ", df_id, pagedTableData);

    const updateTableData = (data: ITableData, metadata: ITableMetaData) => {
        const loadedPageNumber = metadata.page_number;
        let newPagedTableData: ITableData[] = [];
        // const numKeepPages = 3;
        // console.log("DataViewer: fromPage, toPage", fromPage, toPage);
        if (toPage === null && fromPage === null) {
            newPagedTableData = [data];
            setFromPage(loadedPageNumber);
            setToPage(loadedPageNumber);
            setTotalSize(data.size);
            setPagedTableData(newPagedTableData);
        } else if (fromPage !== null && toPage !== null && pagedTableData) {
            if (loadedPageNumber > toPage) {
                /** page is rolling down */
                const startKeepPage = loadedPageNumber - fromPage >= numKeepPages ? 1 : 0;
                newPagedTableData = [...pagedTableData.slice(startKeepPage), data];
                setFromPage(fromPage + startKeepPage);
                setToPage(loadedPageNumber);
                setTotalSize(totalSize + data.size);
                setPagedTableData(newPagedTableData);
            } else if (loadedPageNumber < fromPage) {
                /** page is rolling up */
                const removePage = toPage - loadedPageNumber >= numKeepPages ? 1 : 0;
                newPagedTableData = [data, ...pagedTableData.slice(0, -removePage)];
                setToPage(toPage - removePage);
                /** reduce the total page - we only reduce the page when rolling up */
                if (toPage - loadedPageNumber >= numKeepPages) {
                    setTotalSize(totalSize - pagedTableData[pagedTableData.length - 1].size);
                }
                setFromPage(loadedPageNumber);
                setPagedTableData(newPagedTableData);
            }
        }
        
    };

    const socketInit = () => {
        socket?.emit("ping", WebAppEndpoint.DataViewer);
        socket?.on(WebAppEndpoint.DataViewer, (result: string, ack) => {
            try {
                let message: IMessage = JSON.parse(result);
                console.log(`${WebAppEndpoint.DataViewer} got results for command`, message);
                if (!message.error) {
                    if (message.type === ContentType.STRING) {
                        dispatch(setTextOutput(message));
                    } else if (message.command_name == CommandName.get_table_data) {
                        // handleGetTableData(message);
                        updateTableData(
                            message.content as ITableData,
                            message.metadata as ITableMetaData
                        );
                        setIsLoading(false);
                    } else {
                        // console.log("dispatch text output");
                        dispatch(setTextOutput(message));
                    }
                } else {
                    dispatch(setTextOutput(message));
                }
            } catch (error) {
                console.error(error);
            }
            if (ack) ack();
        });
    };

    const getTableData = (pageNumber: number, pageSize: number) => {
        if (socket && df_id && !isLoading) {
            setIsLoading(true);
            sendGetTableData(socket, df_id, null, pageNumber, pageSize);
        }
    };

    useEffect(() => {
        socketInit();
        return () => {
            socket?.off(WebAppEndpoint.DataViewer);
        };
    }, [socket, pagedTableData]);

    return { pagedTableData, getTableData, fromPage, toPage, totalSize, isLoading };
};
