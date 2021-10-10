import React from "react";

export type RecvCodeOutput = (output: CodeOutput) => void;

export interface CodeOutput {
    type: string;
    content: string;
};

export interface DataTableContent {
    header: string[];
    rows: ((string|number)[])[];
}