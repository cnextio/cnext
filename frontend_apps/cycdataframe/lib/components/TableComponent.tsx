import { TableBody, TableHead, TableRow, TableCell} from "@mui/material";
import React, { useEffect } from "react";
import { DataTable, DataTableHead, DataTableHeadCell, TableContainer } from "./StyledComponents";
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
            <DataTable sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                {/* {console.log(tableData)} */}
                <DataTableHead>
                    <TableRow >
                    {tableData.header.map((headerItem) => (    
                        <DataTableHeadCell>{headerItem}</DataTableHeadCell>
                    ))}
                    </TableRow>
                </DataTableHead>
                <TableBody>
                {tableData.rows.map((row, index) => (
                    <TableRow key={index}>
                    {row.map((rowItem) => (                            
                        <TableCell align="center">{rowItem}</TableCell>
                    ))}
                    </TableRow>
                ))}
                </TableBody>
            </DataTable>
        : null}
        </TableContainer>
    );
}

export default TableComponent;


