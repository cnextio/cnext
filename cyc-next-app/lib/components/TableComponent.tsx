import { TableBody, TableHead, TableRow, TableCell, Grow, Fade } from "@mui/material";
import React, { useEffect, Box, useRef, useState, useCallback, Fragment } from "react";
import shortid from "shortid";
import ScrollIntoViewIfNeeded from 'react-scroll-into-view-if-needed';

import { DataTable, DataTableCell, DataTableHead, DataTableHeadRow, DataTableHeadCell, 
    DataTableIndexCell, DataTableRow, TableContainer, DataTableHeadText, DataTableHeadCellOfNewCol as DataTableReviewHeadCell, DataTablCellOfNewCol as DataTablReviewCell } from "./StyledComponents";
import {Message, WebAppEndpoint, DataTableContent, UpdateType, IReviewRequest, IDFUpdatesReview, ReviewType} from "./AppInterfaces";
import socket from "./Socket";
import { scrollLock, scrollUnlock } from "../../redux/reducers/scrollLockSlice";

import dynamic from 'next/dynamic'
const ColumnHistogramComponentWithNoSSR = dynamic(
    () => import("./ColumnHistogramComponent"),
    { ssr: false }
  )

// redux
import { useSelector, useDispatch } from 'react-redux'
import CountNAComponent from "./CountNAComponent";
import store from '../../redux/store';
import { ifElse, ifElseDict } from "./libs";
import { setDFUpdates } from "../../redux/reducers/dataFrameSlice";

const TableComponent = (props: any) => {    
    const tableData = useSelector((state) => state.dataFrames.tableData);
    const activeDataFrame = useSelector((state) => state.dataFrames.activeDataFrame);
    const dfReview: IDFUpdatesReview = useSelector((state) => _get_review_request(state));
    // const dataFrameUpdates = useSelector((state) => state.dataFrames.dataFrameUpdates);
    const endPointRef = useRef(null);
    const dispatch = useDispatch();    
    /* 
    * We use this scrollLocked to make sure this and CodeOutputComponent can scroll to view
    * at the same time. This is very ugly solution for this problem 
    * https://stackoverflow.com/questions/49318497/google-chrome-simultaneously-smooth-scrollintoview-with-more-elements-doesn
    */
    const scrollLocked = useSelector((state) => state.scrollLock.locked);    
    
    function _get_review_request(state): IDFUpdatesReview {
        return ifElse(state.dataFrames.dfUpdatesReview, activeDataFrame, null);
    }

    /**
     * This function will check if there is add_cols event, 
     * if so it will create a special effect with the new cols.
     * For now, We only add the add_cols special effect to the header, 
     * because adding it to data row requires more backend work.
     */
    // const _create_header_col_element = (colName: string, index: number) => {
    //     const state = store.getState();
    //     console.log("TableComponent: ", state.dataFrames.dfUpdates);
    //     const dfUpdates = ifElseDict(state.dataFrames.dfUpdates, activeDataFrame);
    //     let elem;
    //     if (('update_type' in dfUpdates) && 
    //         (dfUpdates['update_type'] == UpdateType.add_cols) &&
    //         (dfUpdates['update_content'].includes(colName))) {                
    //         elem = (                               
    //                 <DataTableHeadCellOfNewCol>
    //                     <div>{colName}</div>
    //                     <ColumnHistogramComponentWithNoSSR  
    //                         key={index} 
    //                         df_id={activeDataFrame} 
    //                         col_name={colName} 
    //                         smallLayout={true}
    //                     />
    //                     <CountNAComponent  
    //                         df_id={activeDataFrame} 
    //                         col_name={colName}
    //                     />
    //                     <div ref={endPointRef}></div>     
    //                 </DataTableHeadCellOfNewCol>                          
    //         );
    //     } else {
    //         elem = (                
    //             <DataTableHeadCell>                    
    //                 <div>{colName}</div>
    //                 <ColumnHistogramComponentWithNoSSR  
    //                     df_id={activeDataFrame} 
    //                     col_name={colName} 
    //                     smallLayout={true}
    //                 />
    //                 <CountNAComponent 
    //                     df_id={activeDataFrame} 
    //                     col_name={colName}
    //                 />        
    //             </DataTableHeadCell> 
                           
    //         );
    //     }
    //     return elem;
    // }
    // const _create_header_col_element = (colName: string, index: number) => {
    //     let review: boolean = (dfReview && dfReview.type==ReviewType.col && dfReview.name===colName);
    //     return (                
    //         <DataTableHeadCell key={shortid.generate()} review={review} head={false}>                    
    //             <div>{colName}</div>
    //             <ColumnHistogramComponentWithNoSSR  
    //                 df_id={activeDataFrame} 
    //                 col_name={colName} 
    //                 smallLayout={true}
    //             />
    //             <CountNAComponent 
    //                 df_id={activeDataFrame} 
    //                 col_name={colName}
    //             />
    //             {review ? <div ref={endPointRef}></div> : null}                            
    //         </DataTableHeadCell> 
                        
    //     );
    // }

    // const _create_col_element = (colName: string, index: number, rowItem: any) => {
    //     const state = store.getState();
    //     const dfUpdates = ifElseDict(state.dataFrames.dfUpdates, activeDataFrame);
    //     let elem;
    //     if (('update_type' in dfUpdates) && 
    //         (dfUpdates['update_type'] == UpdateType.add_cols) &&
    //         (dfUpdates['update_content'].includes(colName))) {                
    //         elem = (                               
    //                 <DataTablCellOfNewCol key={index} align="right">
    //                     {rowItem}     
    //                 </DataTablCellOfNewCol>                          
    //         );
    //     } else {
    //         elem = (                
    //             <DataTableCell key={index} align="right">                    
    //                 {rowItem}        
    //             </DataTableCell> 
                           
    //         );
    //     }
    //     return elem;
    // }

    const _create_cell = (dfColName: string, dfRowIndex: number, item: any, head: boolean = false) => {
        let review: boolean = false;
        if (dfReview){
            if (dfReview.type==ReviewType.col){
                review = (dfReview.name==dfColName);
            } else if (dfReview.type==ReviewType.row) {
                review = (dfReview.name==dfRowIndex);
            } else if (dfReview.type==ReviewType.cell) {
                // console.log(dfReview.name);
                let name = dfReview.name as [string, number];
                review = (name[0]==dfColName && name[1]==dfRowIndex);
            }
        }
        // dfReview && ((dfReview.type==ReviewType.col && dfReview.name===dfColName) ||
        //                         (dfReview.type==ReviewType.row && dfReview.name===dfRowIndex));
        return (
            
            <DataTableCell key={shortid.generate()} align="right" review={review} head={head}>                    
            <ScrollIntoViewIfNeeded active={review}>
                <div>{item}</div>
                {head ? 
                    <ColumnHistogramComponentWithNoSSR  
                        df_id={activeDataFrame} 
                        col_name={dfColName} 
                        smallLayout={true}
                    /> : null
                }
                {head ? 
                    <CountNAComponent 
                        df_id={activeDataFrame} 
                        col_name={dfColName}
                    /> : null
                }                        
                {/* {review ? <div ref={endPointRef}></div> : null}     */}
                </ScrollIntoViewIfNeeded>
            </DataTableCell>             
            
        );
    }

    const _create_row = (colNames: [], rowIndex: any, rowData: any[]) => {
        return (
            <DataTableRow hover key={shortid.generate()}>
                <DataTableIndexCell>{rowIndex}</DataTableIndexCell>
                {rowData.map((item: any, index: number) => (                            
                    _create_cell(colNames[index], rowIndex, item)
                ))}
            </DataTableRow>
        )
    }
    const _clear_dataFrameUpdateState = (df_id: string) => {
        dispatch(setDFUpdates({df_id: df_id}));
    }

    // const _scrollToReview = () => {
    //     // need block and inline property because of this 
    //     // https://stackoverflow.com/questions/11039885/scrollintoview-causing-the-whole-page-to-move/11041376
    //     if (endPointRef.current!=null) {            
    //         endPointRef.current.scrollIntoView({behavior: "smooth", block: 'nearest', inline: 'start' });
    //     }
    // }
    
    // useEffect(() => {
    //     if(activeDataFrame != null){                        
    //         _scrollToReview();            
    //     }
    // }, [dfReview]);

    // useEffect(() => {
    //     if(activeDataFrame != null && !scrollLocked){                        
    //         _scrollToReview();            
    //     }
    // }, [tableData, scrollLocked]);

    return (
        <TableContainer >
        {/* {console.log("Render TableContainer: ", tableData)} */}
        {console.log("Render TableContainer")}
        {ifElse(tableData, activeDataFrame, null)?
            <DataTable sx={{ minWidth: 650 }} size="small" stickyHeader>
                {/* {console.log(tableData)} */}
                <DataTableHead>
                    <DataTableHeadRow>
                        <DataTableHeadCell>
                            <DataTableHeadText>{tableData[activeDataFrame].index.name}</DataTableHeadText>
                            {/* <ColumnHistogramComponentWithNoSSR df_id={activeDataFrame} col_name='Engine Speed' smallLayout={true}/> */}
                        </DataTableHeadCell>
                        {tableData[activeDataFrame].column_names.map(
                            (dfCol: string, index: number) => 
                            (_create_cell(dfCol, 0, dfCol, true)))}
                    </DataTableHeadRow>
                </DataTableHead>                
                <TableBody>                
                {tableData[activeDataFrame].rows.map((rowData: any[], index: number) => (
                    _create_row(tableData[activeDataFrame].column_names, tableData[activeDataFrame].index.data[index], rowData)
                ))}
                </TableBody>
            </DataTable>
        : null}
        </TableContainer>
    );
}

export default TableComponent;


