import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MetricPlots, PlotContainer as SinglePlot } from "../../StyledComponents";
import { IPlotResult } from "../../../interfaces/ICodeEditor";
import { Layout } from "react-grid-layout";

const PlotWithNoSSR = dynamic(() => import("react-plotly.js"), { ssr: false });

import GridLayout from "react-grid-layout";
import {
    IContextMenu,
    IMenuItem,
    IMenuPosision,
    MetricPlotContextMenuItems,
} from "../../../interfaces/IContextMenu";
import ContextMenu from "../../libs/ContextMenu";

export const MetricPlot = ({ handleContextMenuSelection: parentHandler, metricPlotData }) => {
    // const [containerMounted, setContainerMounted] = useState(false);
    // const {winWidth, winHeight} = useWindowDims();
    const [plotSize, setPlotSize] = useState({ width: 500, height: 300 });
    const [openContextMenu, setOpenContextMenu] = useState(false);
    const [contextMenu, setContextMenu] = useState<IContextMenu | undefined>();
    

    const setLayout = (
        plotData: IPlotResult,
        width: number | null = null,
        height: number | null = null
    ) => {
        try {
            /* have to do JSON stringify and parse again to recover the original json string. It won't work without this */
            let inPlotData = JSON.parse(JSON.stringify(JSON.parse(plotData)));
            // console.log('ExperimentView: ', inPlotData);
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

    const handleLayoutChange = (layout: Layout) => {
        // dispatch({setRunDict()});
        // console.log('Metric layout ', layout[0], gridRef.current?gridRef.current.cols: null, gridRef.current?gridRef.current.width: null);
    };

    const handleOpenContextMenu = (event) => {
        let mouseEvent = event.event;
        let index = event.points[0].pointIndex;
        let run_name = event.points[0].data.name;
        let checkpoint = metricPlotData._cnext_metadata.checkpoints[run_name][index];
        let run_id = metricPlotData._cnext_metadata.name_to_run_ids[run_name];
        let pos: IMenuPosision = { mouseX: mouseEvent.x, mouseY: mouseEvent.y };
        let menu: IMenuItem[] = [];
        for (const item of Object.values(MetricPlotContextMenuItems)) {
            menu.push({
                name: item,
                text: item,
                disable: false,
                metadata: { checkpoint: checkpoint, run_id: run_id },
            });
        }
        let contextMenu: IContextMenu = { menu: menu, pos: pos };
        setContextMenu(contextMenu);
        setOpenContextMenu(true);
    };

    const handleContextMenuSelection = (item: IMenuItem) => {
        setOpenContextMenu(false);
        parentHandler(item);
    };

    const gridRef = useRef();
    const plotViewID = "MetricPlots";
    const rowHeight = 50; //unit: px
    const screenSize = 1200; //unit: px;
    const cols = 2; //unit: grid
    return (
        <MetricPlots id={plotViewID}>
            {/* {console.log('Render PlotView', containerMounted)} */}
            <GridLayout
                ref={gridRef}
                measureBeforeMount={false}
                className='layout'
                rowHeight={rowHeight}
                width={screenSize}
                cols={cols}
                margin={[0, 0]}
                isResizable={true}
                onLayoutChange={(layout) => handleLayoutChange(layout)}
            >
                {metricPlotData
                    ? Object.keys(metricPlotData["plots"]).map((key: string, index: number) => (
                          <SinglePlot
                              key={index}
                              variant='outlined'
                              data-grid={{
                                  x: 0,
                                  y: index,
                                  w: Math.round(plotSize.width / (screenSize / cols)),
                                  h: Math.round(plotSize.height / rowHeight),
                              }}
                          >
                              {/* {React.createElement(PlotWithNoSSR, setLayout(metricPlotData[key], plotSize.width, plotSize.height))} */}
                              <PlotWithNoSSR
                                  {...setLayout(
                                      metricPlotData["plots"][key],
                                      plotSize.width,
                                      plotSize.height
                                  )}
                                  onClick={(event) => handleOpenContextMenu(event)}
                                  // onContextMenu = {(event) => {handleOpenContextMenu(event)}}
                              />
                              <ContextMenu
                                  open={openContextMenu}
                                  contextMenu={contextMenu}
                                  handleClose={handleContextMenuSelection}
                                  handleSelection={handleContextMenuSelection}
                              />
                          </SinglePlot>
                      ))
                    : null}
            </GridLayout>
        </MetricPlots>
    );
};

export default MetricPlot;
