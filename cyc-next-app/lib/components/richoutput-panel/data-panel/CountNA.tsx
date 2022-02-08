import React, { Fragment } from "react";

// redux
import { useSelector } from 'react-redux'
import { CountNAContainer } from "../../StyledComponents";

const CountNA = ({df_id, col_name}) => {
    const countna = useSelector((state) => _getCountNA(state));
    console.log("CountNa", df_id);
    const shape = useSelector((state) => state.dataFrames.metadata[df_id].shape);
    const naPct = (shape) ? countna/shape[0]*100 : 0.;    
    
    function _getCountNA(state){
        if (state.dataFrames.metadata[df_id]){
            let colMetadata = state.dataFrames.metadata[df_id].columns[col_name];
            if (colMetadata){
                return colMetadata.countna;
            } 
            console.log('CountNA: failed _getCountNA', col_name);
            return null;
        }
    }

    return (
        (countna!==null && shape!==null) ?
        <CountNAContainer nonZeroNA={naPct>0}>
            {(naPct>0 && naPct.toFixed(1)==="0.0") 
                ? <Fragment>NA &gt; 0.0%</Fragment>
                : <Fragment>NA: {naPct.toFixed(1)}%</Fragment>}
        </CountNAContainer>
        :null
    )
}

export default CountNA;


