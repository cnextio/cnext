import { TableBody, TableHead, TableRow, TableCell, Grow, Fade } from "@mui/material";
import React, { useEffect, Box, useRef, useState, useCallback } from "react";
// const ReactCSSTransitionGroup = require('react-addons-css-transition-group');
// import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
// import { CSSTransition } from 'react-transition-group';
import { Transition } from "react-transition-group";

import { DataTable, DataTableCell, DataTableHead, DataTableHeadRow, DataTableHeadCell, 
    DataTableIndexCell, DataTableRow, TableContainer, DataTableHeadText, DataTableHeadCellOfNewCol, DataTablCellOfNewCol } from "./StyledComponents";
import {Message, WebAppEndpoint, DataTableContent, UpdateType} from "./interfaces";
import socket from "./Socket";


import dynamic from 'next/dynamic'
const ColumnHistogramComponentWithNoSSR = dynamic(
    () => import("./ColumnHistogramComponent"),
    { ssr: false }
  )

// redux
import { useSelector, useDispatch } from 'react-redux'
import CountNAComponent from "./CountNAComponent";
import store from '../../redux/store';
import { ifElseDict } from "./libs";
import { updateDataFrameUpdates } from "../../redux/reducers/dataFrameSlice";

const TableComponent = (props: any) => {    
    const tableData = useSelector((state) => state.dataFrames.tableData);
    const activeDataFrame = useSelector((state) => state.dataFrames.activeDataFrame);
    // const dataFrameUpdates = useSelector((state) => state.dataFrames.dataFrameUpdates);
    const endPointRef = useRef(null);
    const dispatch = useDispatch();
    
    /**
     * This function will check if there is add_cols event, 
     * if so it will create a special effect with the new cols.
     * For now, We only add the add_cols special effect to the header, 
     * because adding it to data row requires more backend work.
     */
    const _create_header_col_element = (colName: string, index: number) => {
        const state = store.getState();
        const dataFrameUpdates = ifElseDict(state.dataFrames.dataFrameUpdates, activeDataFrame);
        let elem;
        if (dataFrameUpdates.hasOwnProperty('update_type') && 
            (dataFrameUpdates['update_type'] == UpdateType.add_cols) &&
            (dataFrameUpdates['updates'].includes(colName))) {                
            elem = (                               
                    <DataTableHeadCellOfNewCol>
                        <div>{colName}</div>
                        <ColumnHistogramComponentWithNoSSR  
                            key={index} 
                            df_id={activeDataFrame} 
                            col_name={colName} 
                            smallLayout={true}
                        />
                        <CountNAComponent  
                            df_id={activeDataFrame} 
                            col_name={colName}
                        />
                        <div ref={endPointRef}></div>     
                    </DataTableHeadCellOfNewCol>   
                       
            );
        } else {
            elem = (                
                <DataTableHeadCell>                    
                    <div>{colName}</div>
                    <ColumnHistogramComponentWithNoSSR  
                        df_id={activeDataFrame} 
                        col_name={colName} 
                        smallLayout={true}
                    />
                    <CountNAComponent 
                        df_id={activeDataFrame} 
                        col_name={colName}
                    />        
                </DataTableHeadCell> 
                           
            );
        }
        return elem;
    }

    const _create_col_element = (colName: string, index: number, rowItem: any) => {
        const state = store.getState();
        const dataFrameUpdates = ifElseDict(state.dataFrames.dataFrameUpdates, activeDataFrame);
        let elem;
        if (dataFrameUpdates.hasOwnProperty('update_type') && 
            (dataFrameUpdates['update_type'] == UpdateType.add_cols) &&
            (dataFrameUpdates['updates'].includes(colName))) {                
            elem = (                               
                    <DataTablCellOfNewCol key={index} align="right">
                        {rowItem}     
                    </DataTablCellOfNewCol>                          
            );
        } else {
            elem = (                
                <DataTableCell key={index} align="right">                    
                    {rowItem}        
                </DataTableCell> 
                           
            );
        }
        return elem;
    }

    const _clear_dataFrameUpdateState = (df_id: string) => {
        dispatch(updateDataFrameUpdates({df_id: df_id}));
    }

    const _scrollToNewCol = () => {
        // need block and inline property because of this 
        // https://stackoverflow.com/questions/11039885/scrollintoview-causing-the-whole-page-to-move/11041376
        if (endPointRef.current!=null) {
            endPointRef.current.scrollIntoView({behavior: "smooth", block: 'nearest', inline: 'start' })
        }
    }
    
    useEffect(() => {
        if(activeDataFrame != null){
            _scrollToNewCol();
            _clear_dataFrameUpdateState(activeDataFrame);
        }
    }, [tableData]);

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
                        {tableData[activeDataFrame].column_names.map(
                            (colName: string, index: number) => (_create_header_col_element(colName, index)))}
                    </DataTableHeadRow>
                </DataTableHead>                
                <TableBody>                
                {tableData[activeDataFrame].rows.map((row: any[], index: number) => (
                    <DataTableRow hover key={index}>
                    <DataTableIndexCell>{tableData[activeDataFrame].index.data[index]}</DataTableIndexCell>
                    {row.map((rowItem: any, index: number) => (                            
                        _create_col_element(tableData[activeDataFrame].column_names[index], index, rowItem)
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


