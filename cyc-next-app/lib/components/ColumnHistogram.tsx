import React, { useEffect, useRef, useState } from "react";
import { SmallVizContainer, VizContainer } from "./StyledComponents";
// const Plot = require("react-plotly.js");
import Plot from "react-plotly.js";
import ScrollIntoViewIfNeeded from 'react-scroll-into-view-if-needed';

// redux
import { useSelector, useDispatch } from 'react-redux'

// for testing
import {vizData as testVizData} from "./tests/TestVizData"  

export function ColumnHistogramComponent({df_id, col_name, smallLayout}) {    
    const columnHistogram = useSelector((state) => checkColumnHistograms(state));
    
    function checkColumnHistograms(state) {
        if (df_id in state.dataFrames.columnHistogram){
            if (col_name in state.dataFrames.columnHistogram[df_id]){
                return state.dataFrames.columnHistogram[df_id][col_name];
            }
        }
        return null;
    }

    const setSmallLayout = () => {
        try {
            /* have to do JSON stringify and parse again to recover the original json string. It won't work without this */
            // let smallLayoutPlotData = JSON.parse(JSON.stringify(columnHistogram[df_id][col_name]));
            let smallLayoutPlotData = JSON.parse(JSON.stringify(columnHistogram));
            // console.log(columnHistogram);
            // smallLayoutPlotData['data'][0]['hoverinfo'] = "none";
            smallLayoutPlotData['data'][0]['hovertemplate'] = "%{x}: %{y}";
            // smallLayoutPlotData['data'][0]['hoverlabel']['bgcolor'] = ['rgb(252,141,89)'];           
            smallLayoutPlotData['layout'] = {width: 80, height: 50, 
                                            margin: {b: 0, l: 0, r: 0, t: 0},
                                            xaxis: {showticklabels: false}, yaxis: {showticklabels: false},
                                            hoverlabel: {bgcolor: 'rgba(0,0,0,0.04)', 
                                                        bordercolor: 'rgba(0,0,0,0.04)',
                                                        font: {color: 'rgba(0,0,0,0.6)',
                                                        size: 12}}};
            smallLayoutPlotData['config'] = {displayModeBar: false};
            // setPlotData(smallLayoutPlotData);
            return smallLayoutPlotData;
        } catch {
            return null;
        }
    }

    return (
        (columnHistogram?
        <SmallVizContainer>
            {console.log("Render column histogram for column: ", col_name)}              
            {React.createElement(Plot, setSmallLayout(smallLayout))}
        </SmallVizContainer>        
        : null)
    );
};

export default ColumnHistogramComponent;


