import { TableBody, TableHead, TableRow, TableCell} from "@mui/material";
import React, { useEffect } from "react";
import { DataTable, DataTableCell, DataTableHead, DataTableHeadCell, DataTableRow, TableContainer } from "./StyledComponents";
import {DataTableContent} from "./Interfaces";

// redux
import { useSelector, useDispatch } from 'react-redux'

export function TableComponent(props: any) {    
    const tableData = useSelector((state) => state.tableData.data)
    
    useEffect(() => {

    }, [props.tableData]);

    return (
        <TableContainer >
        {tableData?
            <DataTable sx={{ minWidth: 650 }} size="small" stickyHeader>
                {/* {console.log(tableData)} */}
                <DataTableHead>
                    <TableRow >
                    <DataTableHeadCell>{tableData.index.name}</DataTableHeadCell>
                    {tableData.header.map((headerItem) => (    
                        <DataTableHeadCell align='right'>{headerItem}</DataTableHeadCell>
                    ))}
                    </TableRow>
                </DataTableHead>                
                <TableBody>                
                {tableData.rows.map((row, index) => (
                    <DataTableRow hover key={index}>
                    <DataTableIndexCell>{tableData.index.data[index]}</DataTableIndexCell>
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


