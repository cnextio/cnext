import { Socket } from "socket.io-client";
import store from "../../../../../redux/store";
import { CommandName, IMessage, WebAppEndpoint } from "../../../../interfaces/IApp";
import { IDataFrameMessageMetadata } from "../../../../interfaces/IDataFrameManager";
import { createMessage, sendMessage } from "../../libDataFrameManager";
import { setColumnHistogramPlot } from "../../../../../redux/reducers/DataFramesRedux";

const MAX_POINT_COUNT = 10000;

export const sendColumnHistogramPlotRequest = (socket: Socket, df_id: string, col_name: string) => {
    // let content: string = `px.histogram(${df_id}, x="${col_name}")`;
    let content: string = `
from libs.json_serializable import JsonSerializable 
import plotly.express as px, plotly.io as pio, simplejson as json
#pio.renderers.default = "json"        
def _tmp():    
    if ${df_id}["${col_name}"].dtypes not in ["object"]:
        if ${df_id}.shape[0] > ${MAX_POINT_COUNT}:
            _tmp_df = ${df_id}.sample(${MAX_POINT_COUNT})
        else:
            _tmp_df = ${df_id}
        fig = px.histogram(_tmp_df, x="${col_name}")
    else:
        fig = px.bar(${df_id}["${col_name}"].value_counts()[:])
    fig.update_layout({
        'showlegend': False,
        #'width': 600, 
        #'height': 400, 
        'margin': {'b': 0, 'l': 0, 'r': 0, 't': 0}, 
        'xaxis': {'showticklabels': False},
        'yaxis': {'showticklabels': False},
        'hoverlabel': {
            'bgcolor': "rgba(0,0,0,0.04)", 
            'bordercolor': "rgba(0,0,0,0.04)", 
            'font': {'color': "rgba(0,0,0,0.6)", 'size': 12 }
    }})
    
    fig.update_yaxes(visible=False, showticklabels=False)
    fig.update_xaxes(visible=False, showticklabels=False)
    return JsonSerializable({"mime_type": "image/plotly+json", "data": json.loads(fig.to_json())})
_tmp()`;
    let message = createMessage(CommandName.plot_column_histogram, content, {
        df_id: df_id,
        col_name: col_name,
    });
    sendMessage(socket, message);
};

export const getHistogramPlots = (socket: Socket, df_id: string, col_list: string[]) => {
    for (var i = 0; i < col_list.length; i++) {
        const col_name = col_list[i];
        sendColumnHistogramPlotRequest(socket, df_id, col_name);
    }
};

export const handlePlotColumnHistogram = (message: IMessage) => {
    if (message.metadata) {
        const metadata = message.metadata as IDataFrameMessageMetadata;
        console.log(
            `${WebAppEndpoint.DFManager} got plot data for "${metadata.df_id}" "${metadata.col_name}"`,
            message.content
        );
        const payload = {
            df_id: metadata.df_id,
            col_name: metadata.col_name,
            data: message.content,
        };
        store.dispatch(setColumnHistogramPlot(payload));
    }
};

