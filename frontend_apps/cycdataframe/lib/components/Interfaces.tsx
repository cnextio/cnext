import React from "react";

export type RecvCodeOutput = (output: Message) => void;

// export interface CodeOutput {
//     type: string;
//     content: string;
// };

export interface Message {
    request_originator: string;    
    command_type: string;    
    content_type: string;
    content: string|object;
    error: boolean;
    meta: object;
};

export interface DataTableContent {
    name: string;
    column_names: string[];
    rows: ((string|number)[])[];
};

export enum CommandType { exec = 'exec', eval = 'eval' };

export enum CodeRequestOriginator {
    code_panel = 'code_panel',
    table_panel = 'table_panel',
    DataFrameManager = 'DataFrameManager'
};

export enum MessageType {
    dataframe_updated = 'dataframe_updated'    
}