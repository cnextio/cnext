import React, { Fragment, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { PlotContainer as SinglePlot, PlotViewContainer as StyledPlotView } from "../StyledComponents";
import ScrollIntoViewIfNeeded from 'react-scroll-into-view-if-needed';

// redux
import { useSelector, useDispatch } from 'react-redux'
import { update as vizDataUpdate } from "../../../redux/reducers/vizDataSlice";
import { Box, Paper } from "@mui/material";
import { ICodeLine, IPlotResult } from "../../interfaces/ICodeEditor";
import store from "../../../redux/store";
import { ContentType } from "../../interfaces/IApp";


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
    // const plotResultUpdate = useSelector((state) => state.codeDoc.plotResultUpdate);    
    const activeLine = useSelector((state) => state.codeEditor.activeLine);
    const [containerMounted, setContainerMounted] = useState(false);

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
    
    //FIXME: this still not work as expected
    useEffect(() => {
        setContainerMounted(true);
        // return function cleanup () {
        //     setContainerMounted(false);
        // }
    })

    const plotViewID = 'StyledPlotView';
    function renderPlots(){
        const state = store.getState();
        const codeLines: ICodeLine[] = state.codeEditor.codeLines;
        const codeWithPlots: ICodeLine[] = codeLines
            .filter(code => (code.result && code.result.type==ContentType.PLOTLY_FIG));        
        // console.log(document.getElementById(plotContainerID));
        return (
            <StyledPlotView id={plotViewID}>                
                {console.log('Render PlotView', containerMounted)}
                {containerMounted ? codeWithPlots.map((plot: ICodeLine) => (                    
                    <ScrollIntoViewIfNeeded 
                            active={plot.lineID==activeLine}
                            options={{
                                block: 'start', 
                                inline:'center', 
                                behavior: 'smooth',
                                boundary: document.getElementById(plotViewID)}}>
                        <SinglePlot 
                            key={plot.lineID} 
                            variant="outlined" 
                            focused={plot.lineID==activeLine}>                                            
                            {React.createElement(PlotWithNoSSR, setLayout(plot.result.content))}
                            {console.log('Render PlotView: ', plot.lineID==activeLine)}
                        </SinglePlot>          
                    </ScrollIntoViewIfNeeded> 
                )) : null}
            </StyledPlotView>
        )         
    }

    return renderPlots();
}

export default PlotView;


