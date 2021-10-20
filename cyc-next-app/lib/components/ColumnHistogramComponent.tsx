import React, { useEffect, useRef, useState } from "react";
import { SmallVizContainer, VizContainer } from "./StyledComponents";
import Plot from "react-plotly.js";

// redux
import { useSelector, useDispatch } from 'react-redux'
import { update as vizDataUpdate } from "../../redux/reducers/vizDataSlice";
// for testing
import {vizData as testVizData} from "./tests/TestVizData"  

// function useTraceUpdate(props) {
//     const prev = useRef(props);
//     useEffect(() => {
//       const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
//         if (prev.current[k] !== v) {
//           ps[k] = [prev.current[k], v];
//         }
//         return ps;
//       }, {});
//       if (Object.keys(changedProps).length > 0) {
//         console.log('Changed props:', changedProps);
//       }
//       prev.current = props;
//     });
//   }

export function ColumnHistogramComponent({df_id, col_name, smallLayout}) {    
    const columnHistogram = useSelector((state) => compareColumnHistograms(state));
    // const [plotData, setPlotData] = useState(null);
    // useTraceUpdate(columnHistogram);
    // useTraceUpdate(plotData);
    function compareColumnHistograms(state) {
        if (df_id in state.dataFrames.columnHistogram){
            if (col_name in state.dataFrames.columnHistogram[df_id]){
                return state.dataFrames.columnHistogram[df_id][col_name];
            }
        }
        return null;
    }

    // useEffect(() => {
    //     if(smallLayout){
    //         console.log("setting the plot data for col ", col_name);
    //         setSmallLayout();
    //     } else {
    //         console.log("setting the plot data for col with normal layout ", col_name);
    //         setPlotData(JSON.parse(JSON.stringify(columnHistogram)));
    //     }

    // }, [columnHistogram]);
    
    const setSmallLayout = () => {
        try {
            /* have to do JSON stringify and parse again to recover the original json string. It won't work without this */
            // let smallLayoutPlotData = JSON.parse(JSON.stringify(columnHistogram[df_id][col_name]));
            let smallLayoutPlotData = JSON.parse(JSON.stringify(columnHistogram));
            console.log(columnHistogram);
            smallLayoutPlotData['data'][0]['hoverinfo'] = "none";
            smallLayoutPlotData['data'][0]['hovertemplate'] = "";
            smallLayoutPlotData['layout'] = {width: 80, height: 50, 
                                            margin: {b: 0, l: 0, r: 0, t: 0},
                                            xaxis: {showticklabels: false}, yaxis: {showticklabels: false}};
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


