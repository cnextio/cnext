import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
import { SmallVizContainer, VizContainer } from "./StyledComponents";
// const Plot = require("react-plotly.js");
// import Plot from "react-plotly.js";
import ScrollIntoViewIfNeeded from 'react-scroll-into-view-if-needed';

const PlotWithNoSSR = dynamic(
    () => import("react-plotly.js"),
    { ssr: false }
)
// redux
import { useSelector, useDispatch } from 'react-redux'

// for testing
import {vizData as testVizData} from "./tests/TestVizData"  


export function ColumnHistogram({df_id, col_name, width=80, height=50}) {    
    // const columnHistogram = useSelector((state) => checkColumnHistograms(state));
    const columnHistogram = useSelector((state) => state.dataFrames.metadata[df_id].columns[col_name].histogram_plot);
    
    // function checkColumnHistograms(state) {
    //     if (df_id in state.dataFrames.columnHistogram){
    //         if (col_name in state.dataFrames.columnHistogram[df_id]){
    //             return state.dataFrames.columnHistogram[df_id][col_name];
    //         }
    //     }
    //     return null;
    // }

    function setLayout(width: number = 80, height: number = 50) {
        try {
            /* have to do JSON stringify and parse again to recover the original json string. It won't work without this */
            let plotData = JSON.parse(JSON.stringify(columnHistogram));
            plotData['data'][0]['hovertemplate'] = "%{x}: %{y}";    
            plotData['layout'] = {width: width, height: height, 
                                            margin: {b: 0, l: 0, r: 0, t: 0},
                                            xaxis: {showticklabels: false}, yaxis: {showticklabels: false},
                                            hoverlabel: {bgcolor: 'rgba(0,0,0,0.04)', 
                                                        bordercolor: 'rgba(0,0,0,0.04)',
                                                        font: {color: 'rgba(0,0,0,0.6)',
                                                        size: 12}}};
            plotData['config'] = {displayModeBar: false};
            return plotData;
        } catch {
            return null;
        }
    }

    return (
        (columnHistogram?
        <SmallVizContainer>
            {console.log("Render column histogram for column: ", col_name)}              
            {React.createElement(PlotWithNoSSR, setLayout(width, height))}
        </SmallVizContainer>        
        : null)
    );
};

export default ColumnHistogram;


