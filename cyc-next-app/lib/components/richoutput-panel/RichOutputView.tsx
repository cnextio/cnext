import { Divider } from "@mui/material";
import React, { useEffect, useState, Fragment } from "react";

// import dynamic from 'next/dynamic'
// const ColumnHistogramComponentWithNoSSR = dynamic(
//     () => import("./ColumnHistogram"),
//     { ssr: false }
//   )

// redux
import RichOuputPanelHeader from "./RichOuputPanelHeader";
import SummaryView from "./summary-panel/SummaryView";
import ResultPanel from "./result-panel/ResultPanel";
import { RichOutputPanelToolbarItems } from "../../interfaces/IRichOuputViewer";
import ExperimentManager from "./experiment-panel/ExperimentsManager";
import ModelPanel from "./model-panel/ModelPanel";
import DataPanel from "./data-panel/DataPanel";

const RichOutputView = (props: any) => {
    const [show, setShow] = useState(RichOutputPanelToolbarItems.DATA);

    return (
        <Fragment>
            <RichOuputPanelHeader
                show={show}
                setShow={setShow}
            />
            {show === RichOutputPanelToolbarItems.DATA && <DataPanel />}
            {show == RichOutputPanelToolbarItems.SUMMARY && <SummaryView />}
            {show === RichOutputPanelToolbarItems.RESULTS && <ResultPanel />}
            {show === RichOutputPanelToolbarItems.EXPERIMENTS && <ExperimentManager />}
            {show === RichOutputPanelToolbarItems.MODEL && <ModelPanel />}
        </Fragment>
    );
};

export default RichOutputView;
