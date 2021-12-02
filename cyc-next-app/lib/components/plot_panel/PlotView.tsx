import React, { Fragment, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { PlotContainer, PlotViewContainer } from "../StyledComponents";
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
    const plotResultUpdate = useSelector((state) => state.codeDoc.plotResultUpdate);    
    const activeLine = useSelector((state) => state.codeDoc.activeLine);
    const [plotRendered, setPlotRendered] = useState(false);
    const scrollRef = useRef();
    const noscrollRef = useRef();

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

    function plotWithNoScroll(props){
        return (
            <Fragment>
                <PlotWithNoSSR {...props}></PlotWithNoSSR>
            </Fragment>
        )
    }

    function plotWithScroll(layout, active){
        return (    
            // <div 
            //     ref={active ? scrollRef : noscrollRef}
            // >
                <PlotWithNoSSR {...layout} ></PlotWithNoSSR>
            // </div>              
        )
    }
    
    const plotContainerID = 'plotContainerID';

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
                boundary: document.getElementById(plotContainerID)
            });
        }
    }, [scrollRef.current])

    function renderPlots(){
        const state = store.getState();
        const codeLines: ICodeLine[] = state.codeDoc.codeLines;
        const codeWithPlots: ICodeLine[] = codeLines
            .filter(code => (code.result && code.result.type==ContentType.PLOTLY_FIG));        
        return (
            <PlotViewContainer id={plotContainerID}>                
                {console.log('Render PlotView')}
                {codeWithPlots.map((plot: ICodeLine) => (                    
                    <ScrollIntoViewIfNeeded 
                            active={plot.lineID==activeLine}
                            options={{
                                block: 'start', 
                                inline:'center', 
                                behavior: 'smooth',
                                boundary: document.getElementById(plotContainerID)}}>
                    {/* <Box ref={plot.lineID==activeLine ? scrollRef : null} > */}
                    <PlotContainer 
                        // ref={plot.lineID==activeLine ? scrollRef : null} 
                        key={plot.lineID} 
                        variant="outlined" 
                        focused={plot.lineID==activeLine}>                                            
                        {React.createElement(PlotWithNoSSR, setLayout(plot.result.content))}
                        {console.log('Render PlotView: ', plot.lineID==activeLine)}
                        {/* </Box> */}
                        {/* {React.createElement(plotWithScroll, setLayout(plot.result.content), plot.lineID==activeLine)}                         */}
                    </PlotContainer>
                    {/* </Box> */}                        
                    </ScrollIntoViewIfNeeded> 
                ))}
            </PlotViewContainer>
        )         
    }

    return renderPlots();
}

export default PlotView;


