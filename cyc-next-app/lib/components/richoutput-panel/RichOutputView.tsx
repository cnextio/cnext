import { Divider } from "@mui/material";
import React, { useEffect, useState, Fragment } from "react";

// import dynamic from 'next/dynamic'
// const ColumnHistogramComponentWithNoSSR = dynamic(
//     () => import("./ColumnHistogram"),
//     { ssr: false }
//   )

// redux
import { useSelector } from "react-redux";
import { ifElse } from "../libs";
import RichOuputViewHeader from "./RichOuputViewHeader";
import SummaryView from "./summary-panel/SummaryView";
import ResultView from "./result-panel/ResultView";
import { RichOutputViewHeader } from "../../interfaces/IRichOuputViewer";
import ExperimentManager from "./experiment-panel/ExperimentsManager";
import ModelView from "./model-panel/ModelView";
import TableView from "./data-panel/TableView";
import GridView, { GridViewStatus } from "./data-panel/GridView";
import { RootState } from "../../../redux/store";

const RichOutputView = (props: any) => {
    const tableData = useSelector((state: RootState) => state.dataFrames.tableData);
    const [gridViewStatus, setGridViewStatus] = useState<GridViewStatus>(GridViewStatus.NONE);
    const resultUpdateCount = useSelector(
        (state: RootState) => state.codeEditor.resultUpdateCount
    );
    const activeDataFrame = useSelector(
        (state: RootState) => state.dataFrames.activeDataFrame
    );
    const [show, setShow] = useState(RichOutputViewHeader.DATA);

    useEffect(() => {
        setShow(RichOutputViewHeader.DATA);
    }, [activeDataFrame, tableData]);

    useEffect(() => {
        setShow(RichOutputViewHeader.RESULTS);
    }, [resultUpdateCount]);

    useEffect(() => {
        if (show != RichOutputViewHeader.DATA) {
            setGridViewStatus(GridViewStatus.NONE);
        }
        if (show == RichOutputViewHeader.DATA && ifElse(tableData, activeDataFrame, null)) {
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
            {show === RichOutputViewHeader.DATA &&
                ifElse(tableData, activeDataFrame, null) &&
                (gridViewStatus === GridViewStatus.SELECTED ? <GridView /> : <TableView />)}
            {show == RichOutputViewHeader.SUMMARY && <SummaryView />}
            {show === RichOutputViewHeader.RESULTS && <ResultView />}
            {show === RichOutputViewHeader.EXPERIMENTS && <ExperimentManager />}
            {show === RichOutputViewHeader.MODEL && <ModelView />}
        </Fragment>
    );
};

export default RichOutputView;
