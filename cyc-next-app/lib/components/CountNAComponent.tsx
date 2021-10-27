import React from "react";

// redux
import { useSelector } from 'react-redux'
import { CountNAContainer } from "./StyledComponents";

const CountNAComponent = ({df_id, col_name}) => {
    const columnDataSummary = useSelector((state) => state.dataFrames.columnDataSummary);
    return (
        columnDataSummary[df_id]['countna']?
        <CountNAContainer>
            NA: {(columnDataSummary[df_id]['countna'][col_name]['na']
                /columnDataSummary[df_id]['countna'][col_name]['len']*100).toFixed(1)}%
        </CountNAContainer>
        :null
    )
}

export default CountNAComponent;


