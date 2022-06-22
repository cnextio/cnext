import { Grid, Paper, styled, Typography } from "@mui/material";
import React from "react";

import {
    StyledGridView,
    DataGridItem,
    DataGridItemMetadata,
    ImageMimeCell,
} from "../../StyledComponents";
import { CNextMimeType, FileMimeType, IDFUpdatesReview } from "../../../interfaces/IApp";
import { useSelector } from "react-redux";
import { ifElse } from "../../libs";
import store from "../../../../redux/store";

const GridView = (props: any) => {
    const tableData = useSelector((state) => state.dataFrames.tableData);

    const activeDataFrame = useSelector((state) => state.dataFrames.activeDataFrame);

    const dfReview: IDFUpdatesReview = useSelector((state) => getReviewRequest(state));

    function getReviewRequest(state): IDFUpdatesReview {
        return ifElse(state.dataFrames.dfUpdatesReview, activeDataFrame, null);
    }

    const Item = styled(Paper)(({ theme }) => ({
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: "center",
        color: theme.palette.text.secondary,
        variant: "outlined",
        square: true,
    }));

    const createMimeElem = (item: object, mimeType: CNextMimeType) => {
        switch (mimeType) {
            case FileMimeType.FILE_PNG:
            case FileMimeType.URL_PNG:
                return <ImageMimeCell src={"data:image/png;base64," + item.binary} />;

            case FileMimeType.FILE_JPG:
            case FileMimeType.URL_JPG:
                return <ImageMimeCell src={"data:image/jpg;base64," + item.binary} />;
        }
    };

    const createMetaElem = (item: object, colName: string) => {
        // FIXME: move the line-height style to StyledComponents. I tried it but it did not work
        return (
            <DataGridItemMetadata style={{ "line-height": "100%" }}>
                <Typography fontSize={12} component='span' variant='caption'>
                    {colName}:{" "}
                </Typography>
                <Typography fontSize={12} component='span'>
                    {item}
                </Typography>
            </DataGridItemMetadata>
        );
    };

    const createGridCell = (colNames: [], rowIndex: any, rowData: any[]) => {
        const metadata = ifElse(store.getState().dataFrames.metadata, activeDataFrame, null);

        // let colsWithMime = colNames.filter(
        //     (colName) =>
        //         metadata &&
        //         metadata.columns[colName] &&
        //         (Object.values(FileMimeType).includes(
        //             metadata.columns[colName].type
        //         ) ||
        //             Object.values(BinaryMimeType).includes(
        //                 metadata.columns[colName].type
        //             ))
        // );
        return (
            /** mime data will be displayed in big format then the metadata */
            <DataGridItem elevation={1} square={true}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                    {rowData.map((item: any, index: number) => {
                        if (
                            metadata &&
                            metadata.columns[colNames[index]] &&
                            Object.values(CNextMimeType).includes(
                                metadata.columns[colNames[index]].type
                            )
                        )
                            return createMimeElem(item, metadata.columns[colNames[index]].type);
                    })}
                </div>
                <div style={{ paddingTop: "5px" }}>
                    {rowData.map((item: any, index: number) => {
                        if (
                            metadata &&
                            metadata.columns[colNames[index]] &&
                            !Object.values(CNextMimeType).includes(
                                metadata.columns[colNames[index]].type
                            )
                        )
                            return createMetaElem(item, colNames[index]);
                    })}
                </div>
            </DataGridItem>
        );
    };

    return (
        <StyledGridView>
            {console.log("Render GridView")}
            <Grid container rowSpacing={1} columnSpacing={1}>
                {tableData[activeDataFrame]?.rows.map((rowData: any[], index: number) => (
                    <Grid item>
                        {createGridCell(
                            tableData[activeDataFrame]?.column_names,
                            tableData[activeDataFrame]?.index.data[index],
                            rowData
                        )}
                    </Grid>
                ))}
            </Grid>
        </StyledGridView>
    );
};

export default GridView;
