import React, { Fragment, useEffect, useRef, useState } from "react";
import {
    PlotContainer as SingleResult,
    ResultViewContainer as StyledResultView,
} from "../../StyledComponents";
import ScrollIntoViewIfNeeded from "react-scroll-into-view-if-needed";
import { useSelector } from "react-redux";
import { ICodeLine } from "../../../interfaces/ICodeEditor";
import store, { RootState } from "../../../../redux/store";
import { ContentType } from "../../../interfaces/IApp";
import GridLayout from "react-grid-layout";
import ResultContent from "./ResultContent";
import DashboardView from "./DashboardView";

const ResultPanel = React.memo((props: any) => {
    const [readyToScroll, setReadyToScroll] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);
    const activeLine = useSelector((state: RootState) => state.codeEditor.activeLine);
    const activeGroup = useSelector((state: RootState) => state.codeEditor.activeGroup);
    /** this is used to trigger the rerender of this component whenever there is a new result update */
    const resultUpdateCount = useSelector((state: RootState) => state.codeEditor.resultUpdateCount);
    /** this will make sure that the output will be updated each time
     * the output is updated from server such as when inViewID changed */
    const serverSynced = useSelector((state: RootState) => state.projectManager.serverSynced);

    useEffect(() => {
        setReadyToScroll(true);
    }, []);

    const isActiveLineOrGroup = (codeLine: ICodeLine) => {
        return (
            codeLine.lineID === activeLine ||
            (codeLine.groupID != null && codeLine.groupID === activeGroup)
        );
    };

    const resultPanelId = "ResultPanel";
    const renderResult = () => {
        const state: RootState = store.getState();
        const inViewID = state.projectManager.inViewID;
        const groupIDSet = new Set();
        if (inViewID && state.codeEditor?.codeLines != null) {
            const codeLines: ICodeLine[] = state.codeEditor?.codeLines[inViewID];
            const codeWithResult: ICodeLine[] = codeLines?.filter((codeLine) => {
                /** only display one result in a group */
                if (codeLine.groupID == null) {
                    return codeLine.result?.type === ContentType.RICH_OUTPUT;
                } else if (!groupIDSet.has(codeLine.groupID)) {
                    groupIDSet.add(codeLine.groupID);
                    return codeLine.result?.type === ContentType.RICH_OUTPUT;
                } else {
                    return false;
                }
            });
            console.log("ResultPanel render");
            if (showDashboard) {
                return <DashboardView />;
            } else {
                return (
                    <StyledResultView id={resultPanelId}>
                        {codeWithResult?.map((codeLine: ICodeLine) => (
                            <ScrollIntoViewIfNeeded
                                active={isActiveLineOrGroup(codeLine) && readyToScroll}
                                options={{
                                    block: "start",
                                    inline: "center",
                                    behavior: "smooth",
                                    boundary: document.getElementById(resultPanelId),
                                }}
                            >
                                <SingleResult
                                    key={codeLine.lineID}
                                    variant="outlined"
                                    focused={isActiveLineOrGroup(codeLine)}
                                >
                                    <ResultContent
                                        codeResult={codeLine}
                                        // activeLine={activeLine}
                                        // resultPanelId={resultPanelId}
                                    />
                                </SingleResult>
                            </ScrollIntoViewIfNeeded>
                        ))}
                    </StyledResultView>
                );
            }
        } else return null;
    };
    return renderResult();
});

export default ResultPanel;
