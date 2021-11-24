import React, { useEffect } from "react";
import { VizContainer } from "./StyledComponents";
import Plot from "react-plotly.js";

// redux
import { useSelector, useDispatch } from 'react-redux'
import { update as vizDataUpdate } from "../../redux/reducers/vizDataSlice";
// for testing
import {vizData as testVizData} from "./tests/TestVizData"  

export function VizComponent(props: any) {    
    const vizData = useSelector((state) => state.vizData.data)

    useEffect(() => {
        
    }, []);

    try {
        return (
            (vizData?
            <VizContainer>
                {console.log("Redering VizContainer: ")}
                {/* have to do JSON stringify and parse again to recover the original json string. It won't work without this */}
                {React.createElement(Plot, JSON.parse(JSON.stringify(vizData)))}
                {/* {React.createElement(Plot, vizData['application/json'])} */}
            </VizContainer>
            :null)
        );
    } catch(error) {
        console.log(error);
        return null;
    }
}

export default VizComponent;


