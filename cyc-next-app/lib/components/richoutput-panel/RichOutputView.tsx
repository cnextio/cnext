import { TableBody, TableHead, TableRow, TableCell, Grow, Fade, Paper, Divider } from "@mui/material";
import React, { useEffect, useRef, useState, useCallback, Fragment } from "react";
import shortid from "shortid";
import ScrollIntoViewIfNeeded from 'react-scroll-into-view-if-needed';

import { DataTable, DataTableCell, DataTableHead, DataTableHeadRow, DataTableHeadCell, 
    DataTableIndexCell, DataTableRow, TableContainer, DataTableHeadText } from "../StyledComponents";
import {IDFUpdatesReview, ReviewType} from "../../interfaces/IApp";
import ColumnHistogram from "./data-panel/ColumnHistogram"

// import dynamic from 'next/dynamic'
// const ColumnHistogramComponentWithNoSSR = dynamic(
//     () => import("./ColumnHistogram"),
//     { ssr: false }
//   )

// redux
import { useSelector, useDispatch } from 'react-redux'
import { ifElse, ifElseDict } from "../libs";
import { setDFUpdates } from "../../../redux/reducers/DataFramesRedux";
import RichOuputViewHeader from "./RichOuputViewHeader";
import SummaryView from "./summary-panel/SummaryView";
import PlotView from "./plot-panel/PlotView";
import { IResultViewHeader } from "../../interfaces/IResultViewer";
import ExperimentManager from "./experiment-panel/ExperimentsManager";
import { QueryClient, QueryClientProvider } from "react-query";
import ModelView from "./model-panel/ModelView";
import TableView from "./data-panel/TableView";

const RichOutputView = (props: any) => {    
    const tableData = useSelector((state) => state.dataFrames.tableData);
    const plotResultUpdate = useSelector((state) => state.codeEditor.plotResultUpdate); 
    const activeDataFrame = useSelector((state) => state.dataFrames.activeDataFrame);
    const [show, setShow] = useState(IResultViewHeader.EXPERIMENTS);
    const queryClient = new QueryClient() ;
    
    useEffect(()=>{
        setShow(IResultViewHeader.DATA);
    }, [tableData]);

    useEffect(()=>{
        setShow(IResultViewHeader.PLOTS);
    }, [plotResultUpdate]);

    return (
        <Fragment>
            <RichOuputViewHeader show={show} setShow={setShow}/>
            <Divider/>
            {show==IResultViewHeader.DATA && ifElse(tableData, activeDataFrame, null) && <TableView/>}      
            {show==IResultViewHeader.SUMMARY && <SummaryView/>}
            {show==IResultViewHeader.PLOTS && <PlotView/>}    
            {show==IResultViewHeader.EXPERIMENTS &&
            <QueryClientProvider client={queryClient}>        
                <ExperimentManager/>            
            </QueryClientProvider>}
            {show==IResultViewHeader.MODEL && <ModelView/>}
        </Fragment>
    );
}

export default RichOutputView;


