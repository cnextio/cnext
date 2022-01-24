import React, {useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ExperimentMetricPlots, PlotContainer as SinglePlot } from "../../StyledComponents";
import { IPlotResult } from "../../../interfaces/ICodeEditor";
// import useWindowDims from "./WindowDims";

const PlotWithNoSSR = dynamic(
    () => import("react-plotly.js"),
    { ssr: false }
)

import GridLayout from "react-grid-layout";
import { IContextMenu } from "../../../interfaces/IContextMenu";

export const MetricPlot = ({ metricPlotData }) => {      
    // const [containerMounted, setContainerMounted] = useState(false);
    // const {winWidth, winHeight} = useWindowDims();
    const [plotSize, setPlotSize] = useState({width: 600, height: 350});
    const [openContextMenu, setOpenContextMenu] = useState(false);
    const [contextMenu, setContextMenu] = useState<IContextMenu|undefined>();
    
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

    const handleLayoutChange = (layout, layouts) => {
        // console.log('Metric layout ', layout[0], gridRef.current?gridRef.current.cols: null, gridRef.current?gridRef.current.width: null);
    }

    const handleClick = (event) => {
        console.log(event);
    }

    const gridRef = useRef();
    const plotViewID = 'MetricPlots';
    const rowHeight = 50; //unit: px
    const screenSize = 1200; //unit: px;
    const cols = 100; //unit: grid 
    return (
        <ExperimentMetricPlots id={plotViewID}>                
            {/* {console.log('Render PlotView', containerMounted)} */}
            <GridLayout 
                ref={gridRef}
                measureBeforeMount={false}
                className="layout" 
                rowHeight={rowHeight}
                width={screenSize}
                cols={cols}
                margin={[0,0]}
                isResizable={true}
                onLayoutChange={(layout, layouts) =>
                    handleLayoutChange(layout, layouts)
                }
            >                
                {metricPlotData ? Object.keys(metricPlotData).map((key: string, index: number) => (
                    <SinglePlot 
                        key={index} 
                        variant="outlined" 
                        data-grid={{
                            x: 0, 
                            y: index, 
                            w: Math.round(plotSize.width/(screenSize/cols)), 
                            h: Math.round(plotSize.height/rowHeight)}}
                        >
                        {/* {React.createElement(PlotWithNoSSR, setLayout(metricPlotData[key], plotSize.width, plotSize.height))} */}
                        <PlotWithNoSSR 
                            {...setLayout(metricPlotData[key], plotSize.width, plotSize.height)}
                            onClick = {(event) => handleClick(event)}
                        />
                    </SinglePlot> 
                )) : null}
            </GridLayout>
        </ExperimentMetricPlots>
    )
}

export default MetricPlot;


