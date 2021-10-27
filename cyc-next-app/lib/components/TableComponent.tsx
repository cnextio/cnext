import { TableBody, TableHead, TableRow, TableCell} from "@mui/material";
import React, { useEffect, Box } from "react";
import { DataTable, DataTableCell, DataTableHead, DataTableHeadRow, DataTableHeadCell, 
    DataTableIndexCell, DataTableRow, TableContainer, DataTableHeadText } from "./StyledComponents";
import {Message, WebAppEndpoint, DataTableContent} from "./interfaces";
import socket from "./Socket";

import dynamic from 'next/dynamic'
const ColumnHistogramComponentWithNoSSR = dynamic(
    () => import("./ColumnHistogramComponent"),
    { ssr: false }
  )

// redux
import { useSelector, useDispatch } from 'react-redux'
import CountNAComponent from "./CountNAComponent";

const TableComponent = (props: any) => {    
    const tableData = useSelector((state) => state.dataFrames.tableData);
    const activeDataFrame = useSelector((state) => state.dataFrames.activeDataFrame);
    
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
                            <ColumnHistogramComponentWithNoSSR df_id={activeDataFrame} col_name='Engine Speed' smallLayout={true}/>
                        </DataTableHeadCell>
                        {tableData[activeDataFrame].column_names.map((colName) => (    
                        <DataTableHeadCell>
                            <div>{colName}</div>
                            <ColumnHistogramComponentWithNoSSR  df_id={activeDataFrame} col_name={colName} smallLayout={true}/>
                            <CountNAComponent df_id={activeDataFrame} col_name={colName}/>
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


