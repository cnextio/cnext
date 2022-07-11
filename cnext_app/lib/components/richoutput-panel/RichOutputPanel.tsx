import React, { useState, useEffect } from "react";
import { StyledRichOutputPanel } from "../StyledComponents";
import RichOuputPanelHeader from "./RichOuputPanelHeader";
import ResultPanel from "./result-panel/ResultPanel";
import { RichOutputPanelToolbarItems } from "../../interfaces/IRichOuputViewer";
import ExperimentManager from "./experiment-panel/ExperimentsManager";
import ModelPanel from "./model-panel/ModelManager";
import DataPanel from "./data-panel/DataPanel";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { MarkdownProcessor } from "./result-panel/MarkdownProcessor";

const RichOutputPanel = ({ stopMouseEvent }) => {
    const [show, setShow] = useState(RichOutputPanelToolbarItems.DATA);

    const resultUpdateCount = useSelector((state: RootState) => state.codeEditor.resultUpdateCount);
    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);
    const tableData = useSelector((state: RootState) => state.dataFrames.tableData);
    const showMarkdown = useSelector(
        (state: RootState) => state.projectManager?.settings?.rich_output?.show_markdown
    );

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
            <RichOuputPanelHeader show={show} setShow={setShow} />
            {show === RichOutputPanelToolbarItems.DATA && <DataPanel />}
            {show === RichOutputPanelToolbarItems.RESULTS && (
                <ResultPanel stopMouseEvent={stopMouseEvent} />
            )}
            {show === RichOutputPanelToolbarItems.EXPERIMENTS && <ExperimentManager />}
            {show === RichOutputPanelToolbarItems.MODEL && (
                <ModelPanel stopMouseEvent={stopMouseEvent} />
            )}
            {showMarkdown && <MarkdownProcessor />}
        </StyledRichOutputPanel>
    );
};

export default RichOutputPanel;
