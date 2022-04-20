import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
import { SmallVizContainer, VizContainer } from "../../StyledComponents";
// const Plot = require("react-plotly.js");
// import Plot from "react-plotly.js";

const PlotWithNoSSR = dynamic(() => import("react-plotly.js"), { ssr: false });
// redux
import { useSelector, useDispatch } from "react-redux";
import { MIMEType, StandardMimeType } from "../../../interfaces/IApp";
import { RootState } from "../../../../redux/store";

export function ColumnHistogram({ df_id, col_name, width = 80, height = 50 }) {
    const columnHistogram = useSelector((state: RootState) =>
        getColumHistogram(state)
    );

    function getColumHistogram(state: RootState) {
        let dfMetaData = state.dataFrames.metadata[df_id];
        // console.log('ColumnHistogram: ', df_id, dfMetaData);
        if (dfMetaData) {
            let colMetadata = dfMetaData.columns[col_name];
            if (colMetadata) return colMetadata.histogram_plot;
        }
        return null;
    }

    const createPlotlyFig = (width: number = 80, height: number = 50) => {
        try {
            /* have to do JSON stringify and parse again to recover the original json string. It won't work without this */
            let plotData = JSON.parse(JSON.stringify(columnHistogram?.data));
            plotData["data"][0]["hovertemplate"] = "%{x}: %{y}";
            plotData["layout"] = {
                showlegend: false,
                width: width,
                height: height,
                margin: { b: 0, l: 0, r: 0, t: 0 },
                xaxis: { showticklabels: false },
                yaxis: { showticklabels: false },
                hoverlabel: {
                    bgcolor: "rgba(0,0,0,0.04)",
                    bordercolor: "rgba(0,0,0,0.04)",
                    font: { color: "rgba(0,0,0,0.6)", size: 12 },
                },
            };
            plotData["config"] = { displayModeBar: false };
            return plotData;
        } catch {
            return null;
        }
    };

    const createBinaryFig = (width: number = 80, height: number = 50) => {
        return (
            <img width={width} height={height}
                src={
                    "data:" +
                    columnHistogram?.mime_type +
                    ";base64," +
                    columnHistogram?.data
                }
            />
        );
    };

    return columnHistogram ? (
        <SmallVizContainer>
            {console.log("Render column histogram for column: ", col_name)}
            {columnHistogram.mime_type === StandardMimeType.IMAGE_PLOTLY
                ? React.createElement(
                      PlotWithNoSSR,
                      createPlotlyFig(width, height)
                  )
                : createBinaryFig(width, height)}
        </SmallVizContainer>
    ) : null;
}

export default ColumnHistogram;
