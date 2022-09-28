import { Socket } from "socket.io-client";
import store from "../../../../../redux/store";
import { CommandName, IMessage, WebAppEndpoint } from "../../../../interfaces/IApp";
import { IDataFrameMessageMetadata } from "../../../../interfaces/IDataFrameManager";
import { createMessage, sendMessage } from "../../libDataFrameManager";
import { setColumnQuantilePlot } from "../../../../../redux/reducers/DataFramesRedux";

const MAX_POINT_COUNT = 10000;

const compilePlotCode = (df_id: string, col_name: string, plotly = false) => {
    let code;
    if (plotly) {
        code = `
import plotly.express as px, plotly.io as pio, simplejson as json

if ${df_id}["${col_name}"].dtypes not in ["object"]:
    if ${df_id}.shape[0] > ${MAX_POINT_COUNT}:
        _tmp_df = ${df_id}.sample(${MAX_POINT_COUNT})
    else:
        _tmp_df = ${df_id}
    fig = px.box(_tmp_df, x="${col_name}")
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
    fig.show()
`;
    } else {
        code = `
%matplotlib inline
import matplotlib.pyplot as plt
import matplotlib_inline
import seaborn as sns
matplotlib_inline.backend_inline.set_matplotlib_formats('svg')
if ${df_id}["${col_name}"].dtypes not in ["object"]:
    plt.figure(figsize=(10,2))
    sns.boxplot(data=${df_id}, x='${col_name}', color="#3283FE")
    plt.xlabel(""); plt.ylabel(""); plt.show()
`;
    }
    return code;
};

export const getQuantilePlots = (socket: Socket, df_id: string, col_list: string[]) => {
    for (var col_name of col_list) {
        let code = compilePlotCode(df_id, col_name, false);
        let message = createMessage(CommandName.plot_column_quantile, code, {
            df_id: df_id,
            col_name: col_name,
        });
        sendMessage(socket, message);
    }
};

export const handlePlotColumnQuantile = (message: IMessage) => {
    if (message.metadata) {
        const metadata = message.metadata as IDataFrameMessageMetadata;
        console.log(
            `${WebAppEndpoint.DFManager} got quantile plot for "${metadata.df_id}" "${metadata.col_name}"`
        );
        const payload = {
            df_id: metadata.df_id,
            col_name: metadata.col_name,
            data: message.content,
        };
        store.dispatch(setColumnQuantilePlot(payload));
    }
};
