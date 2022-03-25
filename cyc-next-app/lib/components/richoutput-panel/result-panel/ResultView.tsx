import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
    PlotContainer as SingleResult,
    ResultViewContainer as StyledResultView,
} from "../../StyledComponents";
// import ScrollIntoViewIfNeeded from "react-scroll-into-view-if-needed";
import ReactHtmlParser from "html-react-parser";
import { useSelector } from "react-redux";
import { ICodeLine } from "../../../interfaces/ICodeEditor";
import store, { RootState } from "../../../../redux/store";
import { ContentType, SubContentType } from "../../../interfaces/IApp";
import GridLayout from "react-grid-layout";
const PlotlyWithNoSSR = dynamic(() => import("react-plotly.js"), {
    ssr: false,
});

const ResultView = (props: any) => {
    const activeLine = useSelector((state: RootState) => state.codeEditor.activeLine);
    const resultUpdateCount = useSelector(
        (state: RootState) => state.codeEditor.resultUpdateCount
    );
    // const [containerMounted, setContainerMounted] = useState(false);

    const setLayout = (
        data: object | string | any,
        width: number | null = null,
        height: number | null = null
    ) => {
        try {
            /* have to do JSON stringify and parse again to recover the original json string. It won't work without this */
            let inResultData = JSON.parse(JSON.stringify(data));
            inResultData["data"][0]["hovertemplate"] = "%{x}: %{y}";
            inResultData.layout.width = width ? width : inResultData.layout.width;
            inResultData.layout.height = height ? height : inResultData.layout.height;
            inResultData.layout.margin = { b: 10, l: 80, r: 30, t: 30 };
            inResultData["config"] = { displayModeBar: false };
            return inResultData;
        } catch {
            return null;
        }
    };

    //FIXME: this still not work as expected
    // useEffect(() => {
    // setContainerMounted(true);
    // });

    const rowHeight = 50; //unit: px
    const screenSize = 2000; //unit: px;
    const resultViewId = "StyledResultViewID";
    const cols = 10; //unit: grid
    const renderResult = () => {
        const state: RootState = store.getState();
        const inViewID = state.projectManager.inViewID;
        if (inViewID && state.codeEditor?.codeLines != null) {
            const codeLines: ICodeLine[] = state.codeEditor?.codeLines[inViewID];
            const codeWithResult: ICodeLine[] = codeLines.filter(
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
                    {codeWithResult.map((codeResult: ICodeLine) => (
                        //   <ScrollIntoViewIfNeeded
                        //       active={codeResult.lineID == activeLine}
                        //       options={{
                        //           block: "start",
                        //           inline: "center",
                        //           behavior: "smooth",
                        //           boundary: document.getElementById(resultViewId),
                        //       }}
                        //   >
                        <SingleResult
                            key={codeResult.lineID}
                            variant='outlined'
                            focused={codeResult.lineID == activeLine}
                        >
                            {codeResult?.result?.subType === SubContentType.PLOTLY_FIG &&
                                React.createElement(
                                    PlotlyWithNoSSR,
                                    setLayout(codeResult?.result?.content)
                                )}
                            {codeResult?.result?.subType ===
                                SubContentType.APPLICATION_JSON &&
                                JSON.stringify(codeResult?.result?.content)}
                            {codeResult?.result?.subType?.includes("image") && (
                                <img
                                    src={
                                        "data:" +
                                        codeResult?.result?.subType +
                                        ";base64," +
                                        codeResult?.result?.content
                                    }
                                />
                            )}
                            {/* Display video/ audio */}
                            {codeResult?.result?.subType === SubContentType.TEXT_HTML &&
                                ReactHtmlParser(codeResult?.result?.content)}
                        </SingleResult>
                        //   </ScrollIntoViewIfNeeded>
                    ))}
                    {/* </GridLayout> */}
                </StyledResultView>
            );
        } else return null;
    };

    return renderResult();
};

export default ResultView;
