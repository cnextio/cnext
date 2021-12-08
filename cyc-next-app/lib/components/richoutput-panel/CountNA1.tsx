import React, { Fragment } from "react";

// redux
import { useSelector } from 'react-redux'
import { CountNAContainer } from "../StyledComponents";

const CountNAComponent = ({df_id, col_name}) => {
    const countna = useSelector((state) => state.dataFrames.metadata[df_id].columns[col_name].countna);
    const shape = useSelector((state) => state.dataFrames.metadata[df_id].shape);
    const naPct = (shape) ? countna/shape[0]*100 : 0.;    
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

export default CountNAComponent;


