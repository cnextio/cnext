import React from "react";
import { SmallVizContainer } from "../../StyledComponents";

// redux
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { createPlot } from "../../dataframe-manager/udf/libUDF";

export function UDFContainer({ udfName, df_id, col_name, width, height }) {
    const udfData = useSelector((state: RootState) => getUDFData(state));

    function getUDFData(state: RootState) {
        let dfMetadata = state.dataFrames.metadata[df_id];
        console.log('UDFContainer: ', df_id, dfMetadata);
        if (dfMetadata) {
            let colMetadata = dfMetadata.columns[col_name];
            console.log("UDFContainer: ", colMetadata, udfName);
            if (colMetadata && "udfs" in colMetadata) {
                console.log("UDFContainer: ", colMetadata.udfs);
                return colMetadata.udfs[udfName];
            }
        }
        return null;
    }

    return udfData ? (
        <SmallVizContainer>{createPlot(udfData, width, height)}</SmallVizContainer>
    ) : null;
}

export default UDFContainer;
