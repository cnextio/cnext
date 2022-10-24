import { Socket } from "socket.io-client";
import { CommandName, WebAppEndpoint } from "../../../interfaces/IApp";
import { createMessage } from "../../dataframe-manager/libDataFrameManager";
import { sendMessage } from "../../Socket";

export const sendGetTableData = (
    socket: Socket,
    df_id: string,
    filter: string | null = null,
    page_number: number = 0,
    page_size: number,
) => {
    let fromIndex = page_number * page_size;
    let queryStr: string = `${df_id}${filter ? filter : ""}.iloc[${fromIndex}:${
        fromIndex + page_size
    }]`;
    let message = createMessage(WebAppEndpoint.DataViewer, CommandName.get_table_data, queryStr, {
        df_id: df_id,
        filter: filter,
        page_number: page_number,
        page_size: page_size,
    });
    sendMessage(socket, WebAppEndpoint.DataViewer, message);
};
