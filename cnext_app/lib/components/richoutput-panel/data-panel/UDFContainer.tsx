import React from "react";
import { SmallVizContainer } from "../../StyledComponents";

// redux
import { useSelector } from "react-redux";
import store, { RootState } from "../../../../redux/store";
import { createPlot } from "../../dataframe-manager/udf/libUDF";
import { UDFOutputType } from "../../../interfaces/IDataFrameManager";

export function UDFContainer({ udfName, df_id, col_name, width, height }) {
    const udfData = useSelector((state: RootState) => getUDFData(state));

    function getUDFData(state: RootState) {
        let dfMetadata = state.dataFrames.metadata[df_id];

        if (dfMetadata) {
            let colMetadata = dfMetadata.columns[col_name];
            if (colMetadata && "udfs" in colMetadata) {
                return colMetadata.udfs[udfName];
            }
        }
        return null;
    }

    const renderUDF = () => {
        let registeredUDFs = store.getState().dataFrames.registeredUDFs;
        if (udfData && registeredUDFs) {
            if (registeredUDFs.udfs[udfName].config.type === UDFOutputType.IMAGE) {
                return <SmallVizContainer>{createPlot(udfData, width, height)}</SmallVizContainer>;
            } else {
                // return <SmallVizContainer>{udfData['text/plain']}</SmallVizContainer>;
                return null;
            }
        }
    };

    return renderUDF();
}

export default UDFContainer;
