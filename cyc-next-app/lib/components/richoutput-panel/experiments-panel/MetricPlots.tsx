import React, { Fragment, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { PlotContainer as SinglePlot, PlotViewContainer as StyledPlotView } from "../../StyledComponents";
import ScrollIntoViewIfNeeded from 'react-scroll-into-view-if-needed';

// redux
import { useSelector, useDispatch } from 'react-redux'
import { update as vizDataUpdate } from "../../../../redux/reducers/vizDataSlice";
import { Box, Paper } from "@mui/material";
import { ICodeLine, IPlotResult } from "../../../interfaces/ICodeEditor";
import store from "../../../../redux/store";
import { ContentType } from "../../../interfaces/IApp";
import { ConstructionOutlined } from "@mui/icons-material";


const PlotWithNoSSR = dynamic(
    () => import("react-plotly.js"),
    { ssr: false }
)

export const MetricPlot = ({ metricPlotData }) => {      
    const [containerMounted, setContainerMounted] = useState(false);

    const setLayout = (plotData: IPlotResult, width: number|null = null, height: number|null = null) => {
        try {
            /* have to do JSON stringify and parse again to recover the original json string. It won't work without this */
            let inPlotData = JSON.parse(JSON.stringify(JSON.parse(plotData)));
            // console.log('ExperimentView: ', inPlotData);
            inPlotData['data'][0]['hovertemplate'] = "%{x}: %{y}";  
            inPlotData.layout.width = width ? width : inPlotData.layout.width;
            inPlotData.layout.height = height ? height : inPlotData.layout.height;  
            inPlotData.layout.margin = {b: 10, l: 80, r: 30, t: 30}
            inPlotData['config'] = {displayModeBar: false};
            return inPlotData;
        } catch {
            return null;
        }
    }
    
    //FIXME: this still not work as expected
    useEffect(() => {
        setContainerMounted(true);
    })

    const plotViewID = 'StyledPlotView';
    const renderPlots = () => {
        return (
            <StyledPlotView id={plotViewID}>                
                {console.log('Render PlotView', containerMounted)}
                {containerMounted && metricPlotData ? Object.keys(metricPlotData).map((key: string) => (                    
                    <SinglePlot variant="outlined">
                        {React.createElement(PlotWithNoSSR, setLayout(metricPlotData[key], 500, 300))}
                    </SinglePlot>  
                )) : null}
            </StyledPlotView>
        )         
    }

    return renderPlots();
}

export default MetricPlot;


