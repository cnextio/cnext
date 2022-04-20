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

const DashboardView = React.memo((props: any) => {
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

    const gridRef = useRef();
    const rowHeight = 50; //unit: px
    const screenSize = 2000; //unit: px;
    const resultViewId = "StyledResultViewID";
    const cols = 10; //unit: grid
    const renderResult = () => {
        const state: RootState = store.getState();
        const inViewID = state.projectManager.inViewID;
        if (inViewID && state.codeEditor?.codeLines != null) {
            const codeLines: ICodeLine[] =
                state.codeEditor?.codeLines[inViewID];
            const codeWithResult: ICodeLine[] = codeLines?.filter(
                (code) => code.result?.type === ContentType.RICH_OUTPUT
            );
            console.log("DashboardView render");
            return (
                <StyledResultView id={resultViewId}>
                    <GridLayout
                        ref={gridRef}
                        measureBeforeMount={true}
                        className="layout"
                        rowHeight={rowHeight}
                        width={screenSize}
                        cols={cols}
                        margin={[5, 5]}
                        isResizable={true}
                    >
                        {codeWithResult?.map((codeResult: ICodeLine) => (
                            <SingleResult
                                key={codeResult.lineID}
                                variant="outlined"
                                focused={codeResult.lineID === activeLine}
                            >
                                <ResultContent codeResult={codeResult} />
                            </SingleResult>
                        ))}
                    </GridLayout>
                </StyledResultView>
            );
        } else return null;
    };

    return renderResult();
});

export default DashboardView;
