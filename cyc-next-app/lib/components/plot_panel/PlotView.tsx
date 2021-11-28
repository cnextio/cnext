import React, { Fragment, useEffect } from "react";
import dynamic from "next/dynamic";
import { PlotContainer } from "../StyledComponents";

// redux
import { useSelector, useDispatch } from 'react-redux'
import { update as vizDataUpdate } from "../../../redux/reducers/vizDataSlice";
import { Paper } from "@mui/material";
import { ICodeLine, IPlotResult } from "../../interfaces/ICodeEditor";
import store from "../../../redux/store";
import { ContentType } from "../AppInterfaces";


const PlotWithNoSSR = dynamic(
    () => import("react-plotly.js"),
    { ssr: false }
)

export function PlotView(props: any) {    
    // const vizData = useSelector((state) => state.vizData.data);
    // const plotResults = useSelector((state) => state.codeDoc.plotResults);
    // const plotResultCount = useSelector((state) => state.codeDoc.plotResultCount);
    // FIXME: PlotView render on every codeLines change => poor performance
    // const codeLines = useSelector((state) => state.codeDoc.codeLines);
    const plotResultUpdate = useSelector((state) => state.codeDoc.plotResultUpdate);    
    const activeLine = useSelector((state) => state.codeDoc.activeLine);

    function setLayout(plotData: IPlotResult, width: number|null = null, height: number|null = null) {
        try {
            /* have to do JSON stringify and parse again to recover the original json string. It won't work without this */
            let inPlotData = JSON.parse(JSON.stringify(plotData.plot));
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

    function renderPlots(){
        const state = store.getState();
        const codeLines: ICodeLine[] = state.codeDoc.codeLines;
        const codeWithPlots: ICodeLine[] = codeLines
            .filter(code => (code.result && code.result.type==ContentType.PLOTLY_FIG));
        return (
            <Fragment>
                {codeWithPlots.map((plot: ICodeLine) => (
                    <PlotContainer key={plot.lineID} variant="outlined" focused={plot.lineID==activeLine}>                    
                        {/* <Paper elevation={0} variant="outlined" sx={{borderColor: {props => props.theme.palette.primary.light}}}>                     */}
                            {/* have to do JSON stringify and parse again to recover the original json string. It won't work without this */}
                            {React.createElement(PlotWithNoSSR, setLayout(plot.result.content))}
                            {/* {React.createElement(Plot, vizData['application/json'])} */}
                        {/* </Paper>                 */}
                    </PlotContainer>
                ))}
            </Fragment>
        )         
    }

    return renderPlots();
    // (
        
        // (plotResultCount?
        //     <Fragment>
        //         {console.log("Redering PlotView: ")}
        //         {Object.keys(plotResults).map((key)=>(
        //         <PlotContainer key={key}>                    
        //             <Paper elevation={1}>                    
        //                 {/* have to do JSON stringify and parse again to recover the original json string. It won't work without this */}
        //                 {React.createElement(PlotWithNoSSR, setLayout(plotResults[key]))}
        //                 {/* {React.createElement(Plot, vizData['application/json'])} */}
        //             </Paper>                
        //         </PlotContainer>
        //         ))}                
        //     </Fragment>
        //     :null)
        // (plotResults?
        // <Fragment>
        //     {console.log("Redering PlotView: ")}
        //     {Object.keys(plotResults).map((key)=>(
        //     <PlotContainer key={key}>                    
        //         <Paper elevation={1}>                    
        //             {/* have to do JSON stringify and parse again to recover the original json string. It won't work without this */}
        //             {React.createElement(PlotWithNoSSR, setLayout(plotResults[key]))}
        //             {/* {React.createElement(Plot, vizData['application/json'])} */}
        //         </Paper>                
        //     </PlotContainer>
        //     ))}                
        // </Fragment>
        // :null)
    // );
}

export default PlotView;


