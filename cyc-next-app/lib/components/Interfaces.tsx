import React from "react";

export type RecvCodeOutput = (output: Message) => void;

// export interface CodeOutput {
//     type: string;
//     content: string;
// };

// export interface Message {
//     request_originator: string;    
//     command_type: string;    
//     content_type: string;
//     content: string|object;
//     error: boolean;
//     meta: object;
// };

export interface Message {
    webapp_endpoint: string; // the web client component which sends 
														 // and/or receives this message    
    command_name: string;    // 'code_area_command'|'updated_dataframe_list'|
														 // 'plot_column_histogram'|'plot_count_na'|
														 // 'query_data'|'row_difference'|'column_difference' 
	seq_number: number;      // sequence number of the command. This is needed 
														 // for commands that requires more than one command
    content_type: string;    // the object type of the output content
    content: string|object;  // the command string and output string|object
    error: boolean;
    metadata: object;            // store info about the dataframe and columns 
                             // related to this command
};

// export interface DataTableContent {
//     name: string;
//     column_names: string[];
//     rows: ((string|number)[])[];
// };

export enum CommandName {  
    code_area_command = 'code_area_command',
    active_df_status = 'active_df_status',
    plot_column_histogram = 'plot_column_histogram',
    get_countna = 'get_countna',
    plot_countna = 'plot_countna',
    get_table_data = 'get_table_data'
};

export enum ContentType {  
    str = 'str',
    dict = 'dict',
    pandas_dataframe = 'pandas_dataframe',
    plotly_fig = 'plotly_fig',
    none = 'none'
};
// 'code_area_command'|'active_df_status'|
// 'plot_column_histogram'|'plot_count_na'|
// 'query_data'|'row_difference'|'column_difference'

export enum WebAppEndpoint {
    DataFrameManager = 'DataFrameManager',
    CodeEditorComponent = 'CodeEditorComponent'
};

// export enum MessageType {
//     dataframe_updated = 'dataframe_updated'    
// }