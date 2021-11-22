import React, { Fragment } from "react";

// redux
import { useSelector } from 'react-redux'
import { CountNAContainer } from "./StyledComponents";

const CountNAComponent = ({df_id, col_name}) => {
    const columnDataSummary = useSelector((state) => state.dataFrames.columnDataSummary);
    const naPct = ('countna' in columnDataSummary[df_id]) && (col_name in columnDataSummary[df_id]['countna'])
                    ? columnDataSummary[df_id]['countna'][col_name]['na']
                        /columnDataSummary[df_id]['countna'][col_name]['len']*100
                    : 0.;    
    return (
        ('countna' in columnDataSummary[df_id]) 
        && (col_name in columnDataSummary[df_id]['countna'])?
        <CountNAContainer nonZeroNA={naPct>0}>
            {(naPct>0 && naPct.toFixed(1)==="0.0") 
                ? <Fragment>NA &gt; 0.0%</Fragment>
                : <Fragment>NA: {naPct.toFixed(1)}%</Fragment>}
        </CountNAContainer>
        :null
    )
}

export default CountNAComponent;


