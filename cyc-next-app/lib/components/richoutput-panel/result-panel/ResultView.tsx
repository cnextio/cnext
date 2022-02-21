import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
    PlotContainer as SingleResult,
    PlotViewContainer as StyledResultView,
} from "../../StyledComponents";
import ScrollIntoViewIfNeeded from "react-scroll-into-view-if-needed";
import { useSelector } from "react-redux";
import { ICodeLine, IRichOutputResult } from "../../../interfaces/ICodeEditor";
import store from "../../../../redux/store";
import { ContentType, SubContentType } from "../../../interfaces/IApp";

const ResultWithNoSSR = dynamic(() => import("react-plotly.js"), { ssr: false });

const ResultView = (props: any) => {
    const activeLine = useSelector((state) => state.codeEditor.activeLine);
    const [containerMounted, setContainerMounted] = useState(false);

    const setLayout = (
        data: IRichOutputResult,
        width: number | null = null,
        height: number | null = null
    ) => {
        try {
            console.log("dataaaaaaaa", data);
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
    useEffect(() => {
        setContainerMounted(true);
    });

    const resultViewId = "StyledResultViewID";
    const imageHeight = "350px";
    const renderResult = () => {
        const state = store.getState();
        const inViewID = state.projectManager.inViewID;
        if (inViewID) {
            const codeLines: ICodeLine[] = state.codeEditor.codeLines[inViewID];
            const codeWithResult: ICodeLine[] = codeLines.filter(
                (code) => code.result && code.result.type === ContentType.RICH_OUTPUT
            );
            console.log("codeWithResult", codeWithResult);
            return (
                <StyledResultView id={resultViewId}>
                    {containerMounted
                        ? codeWithResult.map((codeResult: ICodeLine) => (
                              <ScrollIntoViewIfNeeded
                                  active={codeResult.lineID == activeLine}
                                  options={{
                                      block: "start",
                                      inline: "center",
                                      behavior: "smooth",
                                      boundary: document.getElementById(resultViewId),
                                  }}
                              >
                                  {codeResult?.result?.subType === SubContentType.PLOTLY_FIG ? (
                                      <SingleResult
                                          key={codeResult.lineID}
                                          variant='outlined'
                                          focused={codeResult.lineID == activeLine}
                                      >
                                          {React.createElement(
                                              ResultWithNoSSR,
                                              setLayout(codeResult?.result?.content, 600, 350)
                                          )}
                                      </SingleResult>
                                  ) : (
                                      <SingleResult
                                          key={codeResult.lineID}
                                          variant='outlined'
                                          focused={codeResult.lineID == activeLine}
                                      >
                                          <img
                                              src={
                                                  "data:" +
                                                  codeResult?.result?.subType +
                                                  ";base64," +
                                                  codeResult?.result?.content
                                              }
                                              height={imageHeight}
                                          />
                                      </SingleResult>
                                  )}
                              </ScrollIntoViewIfNeeded>
                          ))
                        : null}
                </StyledResultView>
            );
        } else return null;
    };

    return renderResult();
};

export default ResultView;
