import {
    TableBody,
    TableHead,
    TableRow,
    TableCell,
    Grow,
    Fade,
    Paper,
    Divider,
} from "@mui/material";
import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
    Fragment,
} from "react";
import shortid from "shortid";
import ScrollIntoViewIfNeeded from "react-scroll-into-view-if-needed";

import {
    DataTable,
    DataTableCell,
    DataTableHead,
    DataTableHeadRow,
    DataTableHeadCell,
    DataTableIndexCell,
    DataTableRow,
    TableContainer,
    DataTableHeadText,
} from "../StyledComponents";
import { IDFUpdatesReview, ReviewType } from "../../interfaces/IApp";
import ColumnHistogram from "./data-panel/ColumnHistogram";

// import dynamic from 'next/dynamic'
// const ColumnHistogramComponentWithNoSSR = dynamic(
//     () => import("./ColumnHistogram"),
//     { ssr: false }
//   )

// redux
import { useSelector, useDispatch } from "react-redux";
import { ifElse, ifElseDict } from "../libs";
import RichOuputViewHeader from "./RichOuputViewHeader";
import SummaryView from "./summary-panel/SummaryView";
import PlotView from "./plot-panel/PlotView";
import { RichOutputViewHeader } from "../../interfaces/IRichOuputViewer";
import ExperimentManager from "./experiment-panel/ExperimentsManager";
import ModelView from "./model-panel/ModelView";
import TableView from "./data-panel/TableView";
import GridView, { GridViewStatus } from "./data-panel/GridView";

const RichOutputView = (props: any) => {
    const tableData = useSelector((state) => state.dataFrames.tableData);
    const [gridViewStatus, setGridViewStatus] = useState<GridViewStatus>(
        GridViewStatus.NONE
    );

    const plotResultUpdate = useSelector(
        (state) => state.codeEditor.plotResultUpdate
    );
    const activeDataFrame = useSelector(
        (state) => state.dataFrames.activeDataFrame
    );
    const [show, setShow] = useState(RichOutputViewHeader.DATA);

    useEffect(() => {
        setShow(RichOutputViewHeader.DATA);
    }, [tableData]);

    useEffect(() => {
        setShow(RichOutputViewHeader.PLOTS);
    }, [plotResultUpdate]);

    useEffect(() => {
        if (show != RichOutputViewHeader.DATA) {
            setGridViewStatus(GridViewStatus.NONE);
        }
        if (
            show == RichOutputViewHeader.DATA &&
            ifElse(tableData, activeDataFrame, null)
        ) {
            setGridViewStatus(GridViewStatus.UNSELECTED);
        }
    }, [show, tableData, activeDataFrame]);

    const handleGridViewBtn = () => {
        gridViewStatus == GridViewStatus.SELECTED
            ? setGridViewStatus(GridViewStatus.UNSELECTED)
            : setGridViewStatus(GridViewStatus.SELECTED);
    };
    //TODO: move all grid view related thing to under DataView
    return (
        <Fragment>
            <RichOuputViewHeader
                show={show}
                setShow={setShow}
                gridViewStatus={gridViewStatus}
                handleGridViewBtn={handleGridViewBtn}
            />
            <Divider />
            {show == RichOutputViewHeader.DATA &&
                ifElse(tableData, activeDataFrame, null) &&
                (gridViewStatus == GridViewStatus.SELECTED ? (
                    <GridView />
                ) : (
                    <TableView />
                ))}
            {show == RichOutputViewHeader.SUMMARY && <SummaryView />}
            {show == RichOutputViewHeader.PLOTS && <PlotView />}
            {show == RichOutputViewHeader.EXPERIMENTS && <ExperimentManager />}
            {show == RichOutputViewHeader.MODEL && <ModelView />}
        </Fragment>
    );
};

export default RichOutputView;
