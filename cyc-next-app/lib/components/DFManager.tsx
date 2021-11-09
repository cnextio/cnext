/* *
 * This module keeps track of active dataframes. 
 * This is a single point of entry for DF management on client side with one exception ...
 * A dataframe will be added to this list when it is first created and updated when it changes.
 * `isUpdated` flag is used to indicate whether the DF has changed .
 * `isDisplayed` flag is used to indicate whether the DF is being displayed. 
 * if `isUpdated == True` and `isDisplayed == True` then DF metadata and 10 rows of table data will be updated.
 * */ 

import React, { useEffect, useState } from "react";
import {Message, WebAppEndpoint, CommandName, UpdateType} from "./AppInterfaces";
import socket from "./Socket";
import { TableContainer } from "./StyledComponents";
import { setTableData, setColumnHistogramPlot, setColumnMetaData, 
    setCountNA, setDFUpdates } from "../../redux/reducers/dataFrameSlice";

//redux
import { useSelector, useDispatch } from 'react-redux'
import store from '../../redux/store';

import { ifElse, ifElseDict } from "./libs";

const DFManager = () => {
    const dispatch = useDispatch();
    const requestReview = useSelector((state) => state.requestReview);

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
        let content: string = `px.histogram(${df_id}, x="${col_name}")`;
        let message = _create_message(CommandName.plot_column_histogram, content, 1, {'df_id': df_id, 'col_name': col_name})
        _send_message(message);
    }

    const _send_get_countna = (df_id: string) => {
        // TODO: the content is actually not important because python server will generate the python command itself based on CommandName
        let content: string = `${df_id}.isna().sum()`;
        let message = _create_message(CommandName.get_countna, content, 1, {'df_id': df_id})
        _send_message(message);
    }

    const DF_DISPLAY_HALF_LENGTH = 5;
    const _send_get_table_data_around_row_index = (df_id: string, around_index: number=0 ) => {               
        let content: string = `${df_id}.iloc[(${df_id}.index.get_loc(${around_index})-${DF_DISPLAY_HALF_LENGTH} 
                                if ${df_id}.index.get_loc(${around_index})>=${DF_DISPLAY_HALF_LENGTH} else 0)
                                :${df_id}.index.get_loc(${around_index})+${DF_DISPLAY_HALF_LENGTH}]` ;
        let message = _create_message(CommandName.get_table_data, content, 1, {'df_id': df_id})   
        console.log(message);     
        _send_message(message);
    }

    const _send_get_table_data = (df_id: string) => {               
        let content: string = `${df_id}.head(${DF_DISPLAY_HALF_LENGTH*2})` ;
        let message = _create_message(CommandName.get_table_data, content, 1, {'df_id': df_id})   
        // console.log("_send_get_table_data message: ", message);     
        _send_message(message);
    }

    const _handle_get_countna = (message: {}) => {
        const content = message.content;        
        // content['df_id'] = message.metadata['df_id'];
        console.log("Dispatch ", message.content);               
        dispatch(setCountNA(content));
    }

    const _get_plot_histogram = (df_id: string, col_list: []) => {
        for(var i=0; i<col_list.length; i++){
            const col_name = col_list[i];
            _send_plot_column_histogram(df_id, col_name);
        }
    }

    const _handle_active_df_status = (message: {}) => {
        console.log("DataFrameManager got df status message: ", message.content);               
        const dfStatusContent = message.content;
        //we only support one dataframe update now
        Object.keys(dfStatusContent).forEach(function(df_id) {            
            if (dfStatusContent[df_id]['df_updated'] == true) {                                
                // console.log(df_id, dfStatusContent[df_id]);
                let dfUpdates = ifElseDict(dfStatusContent[df_id], 'updates');
                let updateType = ifElse(dfUpdates, 'update_type', null);
                let updateContent = ifElse(dfUpdates, 'update_content', null);
                // console.log("Update active df: ", dfUpdates);
                if (updateType == UpdateType.add_rows) {
                    // show data around added rows
                    _send_get_table_data_around_row_index(df_id, updateContent[0]);
                } else {                    
                    _send_get_table_data(df_id);                                       
                }
                // make redux object conform to our standard 
                let dataFrameUpdateMessage = {df_id: df_id, ...dfStatusContent[df_id]};
                dispatch(setDFUpdates(dataFrameUpdateMessage));
            }
        });        
    }

    const showHistogram = false;
    const _handle_get_table_data = (message: {}) => {
        const df_id = message.metadata['df_id'];
        console.log("Dispatch to tableData (DataFrame)");        
        dispatch(setTableData(message.content));
        
        console.log("send request for column histograms");     
        const tableData = message.content;
        
        const state = store.getState();
        const dfUpdates = ifElseDict(state.dataFrames.dfUpdates, df_id);
        
        if (dfUpdates['update_type'] == UpdateType.add_cols){
            //only update histogram of columns that has been updated
            if (showHistogram) _get_plot_histogram(df_id, dfUpdates['update_content']); 
        } else if (dfUpdates['update_type'] == UpdateType.add_rows){
            if (showHistogram) _get_plot_histogram(df_id, tableData['column_names']);             
        } else if (dfUpdates['update_type'] == UpdateType.del_cols){
        
        }else { //TODO: implement other cases
            if (showHistogram) _get_plot_histogram(df_id, tableData['column_names']);                       
        }         
        if(showHistogram) _send_get_countna(df_id);
    }

    const _handle_plot_column_histogram = (message: {}) => {
        console.log(`${WebAppEndpoint.DataFrameManager} get plot data for "${message.metadata['df_id']}" "${message.metadata['col_name']}"`,);
        let content = message.content;
        content['plot'] = JSON.parse(content['plot']); 
        dispatch(setColumnHistogramPlot(content));             
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
    }, []); //TODO: run this only once - not on rerender

    return null;
}

export default DFManager;

