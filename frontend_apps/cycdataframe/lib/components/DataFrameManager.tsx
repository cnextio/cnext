/* *
 * This module keeps track of active dataframes. 
 * This is a single point of entry for DF management on client side with one exception ...
 * A dataframe will be added to this list when it is first created and updated when it changes.
 * `isUpdated` flag is used to indicate whether the DF has changed .
 * `isDisplayed` flag is used to indicate whether the DF is being displayed. 
 * if `isUpdated == True` and `isDisplayed == True` then DF metadata and 10 rows of table data will be updated.
 * */ 

import React, { useEffect } from "react";
import {Message, CodeRequestOriginator, MessageType} from "./interfaces";
import socket from "./Socket";
import { TableContainer } from "./StyledComponents";
import { updateTableData, updateColumnHistogram } from "../../redux/reducers/dataFrameSlice";

//redux
import { useSelector, useDispatch } from 'react-redux'

const DataFrameManager = () => {
    const dispatch = useDispatch();

    const _send_request = (command: string, metadata: object) => {
        let request = {};
        request['command'] = command;
        request['metadata'] = metadata;        
        console.log(`send ${CodeRequestOriginator.DataFrameManager} request: `, JSON.stringify(request));
        socket.emit(CodeRequestOriginator.DataFrameManager, JSON.stringify(request));
    }

    const _send_column_histogram_request = (df_id: string, col_name: string) => {
        const fig_name = `fig_${Math.floor(Math.random()*10000)}`;
        let command: string = `${fig_name} = px.histogram(${df_id}, x="${col_name}")`;
        _send_request(command, {'df_id': df_id});

        //TODO: might be dangerous to send the 2nd command back to back without knowing the output of previous one
        command = `${fig_name}.show()`;
        _send_request(command, {'df_id': df_id, 'col_name': col_name});        
    }

    const _send_table_data_request = (df_id: string) => {
        let command = `${df_id}.head()`;
        _send_request(command, {'df_id': df_id});
    }

    useEffect(() => {
        socket.emit("ping", "DataFrameManager");
        socket.on(CodeRequestOriginator.DataFrameManager, (result: string) => {
            console.log("got results...");
            try {
                let message: Message = JSON.parse(result);                            
                if(message.error==true){
                    // props.recvCodeOutput(message); //TODO move this to redux
                } else if (message.command_type == MessageType.dataframe_updated){
                    // console.log("dispatch ", MessageType.dataframe_updated);               
                    // dispatch(createTableData(message.content));
                    const updatedDataFrame = message.content;
                    Object.keys(updatedDataFrame).forEach(function(df_id) {
                        if (updatedDataFrame[df_id] == true) {
                            // console.log(key + " " + message.content[key]);
                            _send_table_data_request(df_id);
                            // console.log(updatedDataFrame['column_names'].length);
                            // for(var i=0; i<updatedDataFrame['column_names'].length; i++){
                            //     const col_name = updatedDataFrame['column_names'][i];
                            //     _send_column_histogram_request(df_id, col_name);
                            // }
                        }
                    });                                            
                } else if (message.content_type=="<class 'pandas.core.frame.DataFrame'>"){
                    const tableData = message.content;
                    const df_id = tableData['df_id'];
                    console.log("dispatch to tableData (DataFrame)");               
                    dispatch(updateTableData(message.content));
                    console.log("send request for column histograms");               
                    for(var i=0; i<tableData['column_names'].length; i++){
                        const col_name = tableData['column_names'][i];
                        _send_column_histogram_request(df_id, col_name);
                    }                    
                } else if (message.content_type=="<class 'pandas.core.frame.CycDataFrame'>"){
                    console.log("dispatch tableData (CycDataFrame)");               
                    dispatch(updateTableData(message.content));
                } else if (message.content_type=="<class 'plotly.graph_objs._figure.Figure'>"){
                    console.log(`${CodeRequestOriginator.DataFrameManager} get viz data for "${message.metadata['df_id']}" "${message.metadata['col_name']}"`,);
                    let content = {};
                    content['viz'] = JSON.parse(message.content)["application/json"];
                    content['df_id'] = message.metadata['df_id'];
                    content['col_name'] = message.metadata['col_name'];
                    dispatch(updateColumnHistogram(content));               
                } else {  
                    console.log("dispatch text output");                        
                    // props.recvCodeOutput(codeOutput);
                }                
            } catch {

            }
        });
        // editorRef;
    }, []); //run this only once - not on rerender

    return (
        <div>
            test
        </div>
    );
}

export default DataFrameManager;

