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

const RichOutputView = (props: any) => {
    const tableData = useSelector((state) => state.dataFrames.tableData);
    const [gridViewStatus, setGridViewStatus] = useState<GridViewStatus>(GridViewStatus.NONE);

    // const plotResultUpdate = useSelector((state) => state.codeEditor.plotResultUpdate);
    const resultUpdate = useSelector((state) => state.codeEditor.resultUpdate);
    const activeDataFrame = useSelector((state) => state.dataFrames.activeDataFrame);
    const [show, setShow] = useState(RichOutputViewHeader.DATA);

    useEffect(() => {
        setShow(RichOutputViewHeader.DATA);
    }, [tableData]);

    // useEffect(() => {
    //     setShow(RichOutputViewHeader.PLOTS);
    // }, [plotResultUpdate]);

    useEffect(() => {
        setShow(RichOutputViewHeader.RESULTS);
    }, [resultUpdate]);

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
            {/* {show == RichOutputViewHeader.PLOTS && <PlotView />} */}
            {show === RichOutputViewHeader.RESULTS && <ResultView />}
            {show === RichOutputViewHeader.EXPERIMENTS && <ExperimentManager />}
            {show === RichOutputViewHeader.MODEL && <ModelView />}
        </Fragment>
    );
};

export default RichOutputView;
