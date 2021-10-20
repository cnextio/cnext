import { TableBody, TableHead, TableRow, TableCell} from "@mui/material";
import React, { useEffect, Box } from "react";
import { DataTable, DataTableCell, DataTableHead, DataTableHeadRow, DataTableHeadCell, 
    DataTableIndexCell, DataTableRow, TableContainer, DataTableHeadText } from "./StyledComponents";
import {Message, CodeRequestOriginator, DataTableContent} from "./interfaces";
import socket from "./Socket";

import dynamic from 'next/dynamic'
const ColumnHistogramComponentWithNoSSR = dynamic(
    () => import("./ColumnHistogramComponent"),
    { ssr: false }
  )

// redux
import { useSelector, useDispatch } from 'react-redux'

const TableComponent = (props: any) => {    
    const tableData = useSelector((state) => state.dataFrames.tableData)
    const activeDataFrame = useSelector((state) => state.dataFrames.activeDataFrame)    
    
    const _send_column_histogram_request = (df_name, col_name) => {
        // const fig_name = `fig_${Math.floor(Math.random()*10000)}`;
        // let command = `${fig_name} = px.histogram(${df_name}, x="${col_name}")`;
        // console.log(`send ${CodeRequestOriginator.table_panel} request: `, command);
        // socket.emit(CodeRequestOriginator.table_panel, command);
        // //TODO: might be dangerous to send the 2nd command back to back without knowing the output of previous one
        // command = `${fig_name}.show()`;
        // console.log(`send ${CodeRequestOriginator.table_panel} request: `, command);
        // socket.emit(CodeRequestOriginator.table_panel, command);
    }

    useEffect(()=>{
        // socket.emit("ping", "TableComponent");
        // socket.on(CodeRequestOriginator.table_panel, (result: string) => {
        //     console.log(`${CodeRequestOriginator.table_panel} got results: `, result, '\n');
        //     try {
        //         let codeOutput: Message = JSON.parse(result);                
        //         if(codeOutput.error==false){                    
        //             if (codeOutput.content_type=="<class 'plotly.graph_objs._figure.Figure'>"){
        //                 console.log(`${CodeRequestOriginator.table_panel} dispatch viz output`);               
        //                 // dispatch(vizDataUpdate(JSON.parse(codeOutput.content)["application/json"]));
        //             }
        //             else {
        //                 //TODO: send this to the text output using redux                        
        //             }
        //         }
        //         else {                          
        //             console.log(`${CodeRequestOriginator.table_panel} dispatch text output: `, codeOutput);                        
        //             //TODO: send this to the text output using redux                        
        //         }
        //     } catch {
        //         //TODO: add logging
        //     }
        // });
    },[])

    useEffect(()=>{
        try {
            if (tableData != null){
                // _send_column_histogram_request(tableData.name, `Fuel Rail Pressure`);
            }
        } catch {

        }
        
    },[tableData])
    
    return (
        <TableContainer >
        {console.log("Render TableContainer")}
        {tableData[activeDataFrame]?
            <DataTable sx={{ minWidth: 650 }} size="small" stickyHeader>
                {/* {console.log(tableData)} */}
                <DataTableHead>
                    <DataTableHeadRow>
                        <DataTableHeadCell>
                            <DataTableHeadText>{tableData[activeDataFrame].index.name}</DataTableHeadText>
                            <ColumnHistogramComponentWithNoSSR df_id='test_df' col_name='Engine Speed' smallLayout={true}/>
                        </DataTableHeadCell>
                        {tableData[activeDataFrame].column_names.map((colName) => (    
                        <DataTableHeadCell>
                            <div>{colName}</div>
                            <ColumnHistogramComponentWithNoSSR  df_id='test_df' col_name={colName} smallLayout={true}/>
                        </DataTableHeadCell>
                        ))}
                    </DataTableHeadRow>
                </DataTableHead>                
                <TableBody>                
                {tableData[activeDataFrame].rows.map((row, index) => (
                    <DataTableRow hover key={index}>
                    <DataTableIndexCell>{tableData[activeDataFrame].index.data[index]}</DataTableIndexCell>
                    {row.map((rowItem) => (                            
                        <DataTableCell align="right">{rowItem}</DataTableCell>
                    ))}
                    </DataTableRow>
                ))}
                </TableBody>
            </DataTable>
        : null}
        </TableContainer>
    );
}

export default TableComponent;


