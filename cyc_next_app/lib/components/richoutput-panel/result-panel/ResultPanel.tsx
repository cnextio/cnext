import React, { useEffect, useRef, useState } from "react";
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
    const activeLine = useSelector(
        (state: RootState) => state.codeEditor.activeLine
    );
    /** this is used to trigger the rerender of this component whenever there is a new result update */
    const resultUpdateCount = useSelector(
        (state: RootState) => state.codeEditor.resultUpdateCount
    );
    /** this will make sure that the output will be updated each time
     * the output is updated from server such as when inViewID changed */
    const serverSynced = useSelector(
        (state: RootState) => state.projectManager.serverSynced
    );

    useEffect(() => {
        setReadyToScroll(true);
    }, []);

    const resultPanelId = "ResultPanel";
    const renderResult = () => {
        const state: RootState = store.getState();
        const inViewID = state.projectManager.inViewID;
        if (inViewID && state.codeEditor?.codeLines != null) {
            const codeLines: ICodeLine[] =
                state.codeEditor?.codeLines[inViewID];
            const codeWithResult: ICodeLine[] = codeLines?.filter(
                (code) => code.result?.type === ContentType.RICH_OUTPUT
            );
            console.log("ResultPanel render");
            if (showDashboard) {
                return <DashboardView />;
            } else {
                return (
                    <StyledResultView id={resultPanelId}>
                        {codeWithResult?.map((codeResult: ICodeLine) => (
                            <ScrollIntoViewIfNeeded
                                active={
                                    codeResult.lineID === activeLine &&
                                    readyToScroll
                                }
                                options={{
                                    block: "start",
                                    inline: "center",
                                    behavior: "smooth",
                                    boundary:
                                        document.getElementById(resultPanelId),
                                }}
                            >
                                <SingleResult
                                    key={codeResult.lineID}
                                    variant="outlined"
                                    focused={codeResult.lineID === activeLine}
                                >
                                    <ResultContent
                                        codeResult={codeResult}
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
