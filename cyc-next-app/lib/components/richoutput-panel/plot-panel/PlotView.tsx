import React, { Fragment, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
    PlotContainer as SinglePlot,
    PlotViewContainer as StyledPlotView,
} from "../../StyledComponents";
// import ScrollIntoViewIfNeeded from "react-scroll-into-view-if-needed";

// redux
import { useSelector, useDispatch } from "react-redux";
import { update as vizDataUpdate } from "../../../../redux/reducers/vizDataSlice";
import { Box, Paper } from "@mui/material";
import { ICodeLine, IPlotResult } from "../../../interfaces/ICodeEditor";
import store from "../../../../redux/store";
import { ContentType } from "../../../interfaces/IApp";
import { IMetricPlots } from "../../../interfaces/ICodeEditor";
import MetricPlots from "../shared-components/MetricPlots";
import { CONSTANT } from "../../../../constants";

// const PlotWithNoSSR = dynamic(() => import("react-plotly.js"), { ssr: false });

const PlotView = (props: any) => {
    // const vizData = useSelector((state) => state.vizData.data);
    // const plotResults = useSelector((state) => state.codeDoc.plotResults);
    // const plotResultCount = useSelector((state) => state.codeDoc.plotResultCount);
    // FIXME: PlotView render on every codeLines change => poor performance
    // const codeLines = useSelector((state) => state.codeDoc.codeLines);
    // const plotResultUpdate = useSelector((state) => state.codeDoc.plotResultUpdate);
    const activeLine = useSelector((state) => state.codeEditor.activeLine);
    const [containerMounted, setContainerMounted] = useState(false);
    const [plotMetric, setPlotMetric] = useState<IMetricPlots | null>(null);

    const setLayout = (
        plotData: IPlotResult,
        width: number | null = null,
        height: number | null = null
    ) => {
        try {
            /* have to do JSON stringify and parse again to recover the original json string. It won't work without this */
            let inPlotData = JSON.parse(JSON.stringify(plotData.plot));
            console.log("ExperimentView: ", inPlotData);
            inPlotData["data"][0]["hovertemplate"] = "%{x}: %{y}";
            inPlotData.layout.width = width ? width : inPlotData.layout.width;
            inPlotData.layout.height = height ? height : inPlotData.layout.height;
            inPlotData.layout.margin = { b: 10, l: 80, r: 30, t: 30 };
            inPlotData["config"] = { displayModeBar: false };
            return inPlotData;
        } catch {
            return null;
        }
    };

    //FIXME: this still not work as expected
    useEffect(() => {
        setContainerMounted(true);
    });

    const handleContextMenuSelection = () => {};

    const handleTabClose = () => {};

    const plotViewID = "StyledPlotView";
    const renderPlots = () => {
        const state = store.getState();
        const inViewID = state.projectManager.inViewID;
        if (inViewID) {
            const codeLines: ICodeLine[] = state.codeEditor.codeLines[inViewID];
            const codeWithPlots: ICodeLine[] = codeLines.filter(
                (code) => code.result && code.result.type == ContentType.PLOTLY_FIG
            );

            setPlotMetric({ plots: codeWithPlots });

            return (
                <StyledPlotView id={plotViewID}>
                    {containerMounted && plotMetric !== null && plotMetric.plots.length > 0 ? (
                        <MetricPlots
                            metricPlotData={plotMetric}
                            handleContextMenuSelection={handleContextMenuSelection}
                            typePanel={CONSTANT.PLOT_TYPE_PANEL.PLOT}
                        />
                    ) : null}
                </StyledPlotView>
                // <StyledPlotView id={plotViewID}>
                //     {console.log('Render PlotView', containerMounted)}
                //     {containerMounted ? codeWithPlots.map((plot: ICodeLine) => (
                //         <ScrollIntoViewIfNeeded
                //                 active={plot.lineID==activeLine}
                //                 options={{
                //                     block: 'start',
                //                     inline:'center',
                //                     behavior: 'smooth',
                //                     boundary: document.getElementById(plotViewID)}}>
                //             {console.log('Render PlotView', plot.lineID, activeLine)}
                //             {console.log('plotttttttttt', plot)}
                //             <SinglePlot
                //                 key={plot.lineID}
                //                 variant="outlined"
                //                 focused={plot.lineID==activeLine}>
                //                 {React.createElement(PlotWithNoSSR, setLayout(plot.result.content, 600, 350))}
                //                 {console.log('Render PlotView: ', plot.lineID==activeLine)}
                //             </SinglePlot>
                //         </ScrollIntoViewIfNeeded>
                //     )) : null}
                // </StyledPlotView>
            );
        } else return null;
    };

    return renderPlots();
};

export default PlotView;
