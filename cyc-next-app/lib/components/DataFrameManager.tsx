/* *
 * This module keeps track of active dataframes. 
 * This is a single point of entry for DF management on client side with one exception ...
 * A dataframe will be added to this list when it is first created and updated when it changes.
 * `isUpdated` flag is used to indicate whether the DF has changed .
 * `isDisplayed` flag is used to indicate whether the DF is being displayed. 
 * if `isUpdated == True` and `isDisplayed == True` then DF metadata and 10 rows of table data will be updated.
 * */ 

import React, { useEffect, useState } from "react";
import {Message, WebAppEndpoint, CommandName} from "./Interfaces";
import socket from "./Socket";
import { TableContainer } from "./StyledComponents";
import { updateTableData, updateColumnHistogramPlot, updateColumnMetaData, 
    updateCountNA, updateDataFrameUpdates } from "../../redux/reducers/dataFrameSlice";

//redux
import { useSelector, useDispatch } from 'react-redux'
import { ifElseDict } from "./libs";

const DataFrameManager = () => {
    const dispatch = useDispatch();
    // keeping this as local variable 
    let dataFrameUpdates = {};

    const _send_message = (message: {}) => {
        console.log(`send ${WebAppEndpoint.DataFrameManager} request: `, JSON.stringify(message));
        socket.emit(WebAppEndpoint.DataFrameManager, JSON.stringify(message));
    }

    const _create_message = (command_name: string, content: string, seq_number: number, metadata: {}) => {
        let message = {};
        message['webapp_endpoint'] = WebAppEndpoint.DataFrameManager;
        message['command_name'] = command_name;
        message['seq_number'] = seq_number;     
        message['content'] = content;
        message['metadata'] = metadata;
        return message;
    }

    const _send_plot_column_histogram = (df_id: string, col_name: string) => {
        const fig_name = `fig_${Math.floor(Math.random()*10000)}`;
        let content: string = `${fig_name} = px.histogram(${df_id}, x="${col_name}")`;
        let message = _create_message(CommandName.plot_column_histogram, content, 1, {'df_id': df_id})
        _send_message(message);

        //TODO: might be dangerous to send the 2nd command back to back without knowing the output of previous one
        content = `${fig_name}.show()`;
        message = _create_message(CommandName.plot_column_histogram, content, 2, {'df_id': df_id, 'col_name': col_name})        
        _send_message(message);
    }

    const _send_get_countna = (df_id: string) => {
        // TODO: the content is actually not important because python server will generate the python command itself based on CommandName
        let content: string = `${df_id}.isna().sum()`;
        let message = _create_message(CommandName.get_countna, content, 1, {'df_id': df_id})
        _send_message(message);
    }

    const _send_get_table_data = (df_id: string) => {        
        let content: string = `${df_id}.head()`;
        let message = _create_message(CommandName.get_table_data, content, 1, {'df_id': df_id})
        _send_message(message);
    }

    const _handle_get_countna = (message: {}) => {
        const content = message.content;        
        // content['df_id'] = message.metadata['df_id'];
        console.log("Dispatch ", message.content);               
        dispatch(updateCountNA(content));
    }

    const _handle_active_df_status = (message: {}) => {
        console.log("DataFrameManager got df status message: ", message.content);               
        const updatedDataFrame = message.content;
        //we only support one dataframe update now
        Object.keys(updatedDataFrame).forEach(function(df_id) {
            if (updatedDataFrame[df_id]['df_updated'] == true) {                
                // setDataFrameUpdates(updatedDataFrame[df_id]['updates']);
                dataFrameUpdates[df_id] = ifElseDict(updatedDataFrame[df_id], 'updates');
                _send_get_table_data(df_id);
                // make redux object conform to our standard
                let dataFrameUpdateMessage = {df_id: df_id, ...updatedDataFrame[df_id]};
                dispatch(updateDataFrameUpdates(dataFrameUpdateMessage));
            }
        });        
    }

    const _handle_get_table_data = (message: {}) => {
        const df_id = message.metadata['df_id'];
        console.log("Dispatch to tableData (DataFrame)");        
        dispatch(updateTableData(message.content));
        
        console.log("send request for column histograms");     
        const tableData = message.content;
        
        for(var i=0; i<tableData['column_names'].length; i++){
            const col_name = tableData['column_names'][i];
            // _send_plot_column_histogram(df_id, col_name);
        }           
        // _send_get_countna(df_id);
    }

    const _handle_plot_column_histogram = (message: {}) => {
        if(message.seq_number == 2){
            console.log(`${WebAppEndpoint.DataFrameManager} get viz data for "${message.metadata['df_id']}" "${message.metadata['col_name']}"`,);
            let content = message.content;
            content['plot'] = JSON.parse(content['plot'])["application/json"];
            // content['df_id'] = message.metadata['df_id'];
            // content['col_name'] = message.metadata['col_name'];
            // console.log(content);
            dispatch(updateColumnHistogramPlot(content));  
        } else {
            console.error(`Expect seq_number=2, got ${message.seq_number}`)
        }
    }

    useEffect(() => {
        socket.emit("ping", "DataFrameManager");
        socket.on(WebAppEndpoint.DataFrameManager, (result: string) => {
            console.log("DataFrameManager got results...");
            try {
                let message: Message = JSON.parse(result);                  
                if(message.error==true){
                    // props.recvCodeOutput(message); //TODO move this to redux
                } else if (message.command_name == CommandName.active_df_status){
                    _handle_active_df_status(message);                                            
                } else if (message.command_name==CommandName.get_table_data){
                    _handle_get_table_data(message);                   
                } else if (message.command_name==CommandName.plot_column_histogram){
                    _handle_plot_column_histogram(message);              
                } else if (message.command_name==CommandName.get_countna){
                    _handle_get_countna(message);
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
        </div>
    );
}

export default DataFrameManager;

