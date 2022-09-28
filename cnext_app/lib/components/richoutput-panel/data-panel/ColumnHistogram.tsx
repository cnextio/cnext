import React from "react";
import { SmallVizContainer} from "../../StyledComponents";

// redux
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { createPlot } from "../../dataframe-manager/udf/libUDF";

export function ColumnHistogram({ df_id, col_name, width, height }) {
    const columnHistogram = useSelector((state: RootState) =>
        getColumHistogram(state)
    );

    function getColumHistogram(state: RootState) {
        let dfMetadata = state.dataFrames.metadata[df_id];
        // console.log('ColumnHistogram: ', df_id, dfMetadata);
        if (dfMetadata) {
            let colMetadata = dfMetadata.columns[col_name];
            if (colMetadata) return colMetadata.histogram_plot;
        }
        return null;
    }

    return columnHistogram ? (
        <SmallVizContainer>{createPlot(columnHistogram, width, height)}</SmallVizContainer>
    ) : null;
}

export default ColumnHistogram;
