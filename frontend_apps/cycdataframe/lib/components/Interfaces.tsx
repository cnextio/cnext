import React from "react";

export type RecvCodeOutput = (output: CodeOutput) => void;

// export interface CodeOutput {
//     type: string;
//     content: string;
// };

export interface CodeOutput {
    commandType: string;    
    contentType: string;
    content: string;
    error: boolean;
};

export interface DataTableContent {
    header: string[];
    rows: ((string|number)[])[];
}

export enum CommandType { exec = 'exec', eval = 'eval' }