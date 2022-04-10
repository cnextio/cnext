import React, { Fragment, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
    PlotContainer as SingleResult,
    ResultViewContainer as StyledResultView,
} from "../../StyledComponents";
import ScrollIntoViewIfNeeded from "react-scroll-into-view-if-needed";
import ReactHtmlParser from "html-react-parser";
import { useSelector } from "react-redux";
import { ICodeLine } from "../../../interfaces/ICodeEditor";
import store, { RootState } from "../../../../redux/store";
import { ContentType, SubContentType } from "../../../interfaces/IApp";
import GridLayout from "react-grid-layout";
const PlotlyWithNoSSR = dynamic(() => import("react-plotly.js"), {
    ssr: false,
});

const ResultContent = React.memo(({ codeResult }) => {
    // const ResultContent = ({ codeResult }) => {
    const setLayout = (
        data: object | string | any,
        width: number | null = null,
        height: number | null = null
    ) => {
        try {
            /* have to do JSON stringify and parse again to recover the original json string. It won't work without this */
            let inResultData = JSON.parse(JSON.stringify(data));
            inResultData["data"][0]["hovertemplate"] = "%{x}: %{y}";
            inResultData.layout.width = width
                ? width
                : inResultData.layout.width;
            inResultData.layout.height = height
                ? height
                : inResultData.layout.height;
            inResultData.layout.margin = { b: 10, l: 80, r: 30, t: 30 };
            inResultData["config"] = { displayModeBar: false };
            return inResultData;
        } catch {
            return null;
        }
    };

    const getMimeWithImage = (mimeTypes: string[]) => {
        for (let i = 0; i < mimeTypes.length; i++) {
            if (mimeTypes[i].includes("image/")) {
                return mimeTypes[i];
            }
        }
        return null;
    };

    const createResultContent = () => {
        const imageMime = getMimeWithImage(
            Object.keys(codeResult?.result?.content)
        );

        if (SubContentType.APPLICATION_PLOTLY in codeResult?.result?.content) {
            return React.createElement(
                PlotlyWithNoSSR,
                setLayout(
                    codeResult?.result?.content[
                        SubContentType.APPLICATION_PLOTLY
                    ]
                )
            );
        } else if (
            SubContentType.APPLICATION_JSON in codeResult?.result?.content
        ) {
            return JSON.stringify(
                codeResult?.result?.content[SubContentType.APPLICATION_JSON]
            );
        } else if (imageMime !== null) {
            console.log(
                "ResultView ",
                imageMime,
                codeResult?.result?.content[imageMime]
            );
            return (
                <img
                    src={
                        "data:" +
                        imageMime +
                        ";base64," +
                        codeResult?.result?.content[imageMime]
                    }
                />
            );
        } else if (SubContentType.TEXT_HTML in codeResult?.result?.content) {
            return ReactHtmlParser(
                codeResult?.result?.content[SubContentType.TEXT_HTML].toString(
                    "base64"
                )
            );
        }

        return null;
    };

    return createResultContent();
});

const ResultPanel = React.memo((props: any) => {
    const [readyToScroll, setReadyToScroll] = useState(false);
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
            console.log("codeWithResult", codeWithResult);
            return (
                <StyledResultView id={resultViewId}>
                    {/* <GridLayout
                        // ref={gridRef}
                        measureBeforeMount={true}
                        className="layout"
                        rowHeight={rowHeight}
                        width={screenSize}
                        cols={cols}
                        margin={[5, 5]}
                        isResizable={true}
                    > */}
                    {codeWithResult?.map((codeResult: ICodeLine) => (
                        <ScrollIntoViewIfNeeded
                            active={codeResult.lineID === activeLine && readyToScroll}
                            options={{
                                block: "start",
                                inline: "center",
                                behavior: "smooth",
                                boundary: document.getElementById(resultViewId),
                            }}
                        >
                            <SingleResult
                                key={codeResult.lineID}
                                variant="outlined"
                                focused={codeResult.lineID === activeLine}
                            >
                                <ResultContent codeResult={codeResult} />
                            </SingleResult>
                        </ScrollIntoViewIfNeeded>
                    ))}
                    {/* </GridLayout> */}
                </StyledResultView>
            );
        } else return null;
    };

    return renderResult();
});

export default ResultPanel;
