import React, { useState, useEffect } from "react";
import { StyledRichOutputPanel } from "../StyledComponents";
// import RichOutputView from "./RichOutputView";
import RichOuputPanelHeader from "./RichOuputPanelHeader";
import SummaryView from "./summary-panel/SummaryView";
import ResultPanel from "./result-panel/ResultPanel";
import { RichOutputPanelToolbarItems } from "../../interfaces/IRichOuputViewer";
import ExperimentManager from "./experiment-panel/ExperimentsManager";
import ModelPanel from "./model-panel/ModelPanel";
import DataPanel from "./data-panel/DataPanel";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/store";

const RichOutputPanel = (props: any) => {
    const [show, setShow] = useState(RichOutputPanelToolbarItems.DATA);

    const resultUpdateCount = useSelector((state: RootState) => state.codeEditor.resultUpdateCount);
    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);
    const tableData = useSelector((state: RootState) => state.dataFrames.tableData);

    useEffect(() => {
        if (resultUpdateCount > 0) {
            setShow(RichOutputPanelToolbarItems.RESULTS);
        }
    }, [resultUpdateCount]);

    useEffect(() => {
        if (activeDataFrame != null && tableData != {}) {
            setShow(RichOutputPanelToolbarItems.DATA);
        }
    }, [activeDataFrame, tableData]);

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
