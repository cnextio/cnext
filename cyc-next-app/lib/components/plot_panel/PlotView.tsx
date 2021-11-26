import React, { Fragment, useEffect } from "react";
import dynamic from "next/dynamic";
import { PlotContainer } from "../StyledComponents";

// redux
import { useSelector, useDispatch } from 'react-redux'
import { update as vizDataUpdate } from "../../../redux/reducers/vizDataSlice";
import { Paper } from "@mui/material";
import { IPlotResult } from "../../interfaces/ICodeEditor";


const PlotWithNoSSR = dynamic(
    () => import("react-plotly.js"),
    { ssr: false }
)

export function PlotView(props: any) {    
    // const vizData = useSelector((state) => state.vizData.data);
    const plotResults = useSelector((state) => state.codeDoc.plotResults);

    function setLayout(plotData: IPlotResult, width: number|null = null, height: number|null = null) {
        try {
            /* have to do JSON stringify and parse again to recover the original json string. It won't work without this */
            let inPlotData = JSON.parse(JSON.stringify(plotData.plot));
            inPlotData['data'][0]['hovertemplate'] = "%{x}: %{y}";  
            inPlotData.layout.width = width ? width : inPlotData.layout.width;
            inPlotData.layout.height = height ? height : inPlotData.layout.height;  
            inPlotData.layout.margin = {b: 10, l: 80, r: 40, t: 40}
            inPlotData['config'] = {displayModeBar: false};
            return inPlotData;
        } catch {
            return null;
        }
    }

    try {
        return (
            (plotResults?
            <Fragment>
                {console.log("Redering PlotView: ")}
                {Object.keys(plotResults).map((key)=>(
                <PlotContainer key={key}>                    
                    <Paper elevation={1}>                    
                        {/* have to do JSON stringify and parse again to recover the original json string. It won't work without this */}
                        {React.createElement(PlotWithNoSSR, setLayout(plotResults[key]))}
                        {/* {React.createElement(Plot, vizData['application/json'])} */}
                    </Paper>                
                </PlotContainer>
                ))}                
            </Fragment>
            :null)
        );
    } catch(error) {
        console.log(error);
        return null;
    }
}

export default PlotView;


