import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
import { SmallVizContainer, VizContainer } from "../StyledComponents";
// const Plot = require("react-plotly.js");
// import Plot from "react-plotly.js";

const PlotWithNoSSR = dynamic(
    () => import("react-plotly.js"),
    { ssr: false }
)
// redux
import { useSelector, useDispatch } from 'react-redux'

export function ColumnHistogram({df_id, col_name, width=80, height=50}) {    
    const columnHistogram = useSelector((state) => _getColumHistogram(state));

    function _getColumHistogram(state) {
        let dfMetaData = state.dataFrames.metadata[df_id];
        // console.log('ColumnHistogram: ', df_id, dfMetaData);
        if (dfMetaData){
            let colMetadata = dfMetaData.columns[col_name];
            if (colMetadata)
                return colMetadata.histogram_plot;
        }
        return null;        
    }

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


