import React, { useState } from "react";
import { StyledRichOutputPanel } from "../StyledComponents";
// import RichOutputView from "./RichOutputView";
import RichOuputPanelHeader from "./RichOuputPanelHeader";
import SummaryView from "./summary-panel/SummaryView";
import ResultPanel from "./result-panel/ResultPanel";
import { RichOutputPanelToolbarItems } from "../../interfaces/IRichOuputViewer";
import ExperimentManager from "./experiment-panel/ExperimentsManager";
import ModelPanel from "./model-panel/ModelPanel";
import DataPanel from "./data-panel/DataPanel";

const RichOutputPanel = (props: any) => {
    const [show, setShow] = useState(RichOutputPanelToolbarItems.DATA);
    
    return (
        <StyledRichOutputPanel>
            {/* <RichOutputView {...props} /> */}
            <RichOuputPanelHeader show={show} setShow={setShow} />
            {show === RichOutputPanelToolbarItems.DATA && <DataPanel />}
            {show == RichOutputPanelToolbarItems.SUMMARY && <SummaryView />}
            {show === RichOutputPanelToolbarItems.RESULTS && <ResultPanel />}
            {show === RichOutputPanelToolbarItems.EXPERIMENTS && <ExperimentManager />}
            {show === RichOutputPanelToolbarItems.MODEL && <ModelPanel />}
        </StyledRichOutputPanel>
    );
};

export default RichOutputPanel;
