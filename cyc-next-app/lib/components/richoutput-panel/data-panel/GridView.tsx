import { Grid, Paper, styled, TableBody, Typography } from "@mui/material";
import React, { Fragment } from "react";

import {
    DataGridContainer,
    DataGridItem,
    DataGridItemMetadata,
} from "../../StyledComponents";
import {
    CNextMimeType,
    FileMimeType,
    IDFUpdatesReview,
} from "../../../interfaces/IApp";
import { useSelector } from "react-redux";
import { ifElse, ifElseDict } from "../../libs";
import store from "../../../../redux/store";

export enum GridViewStatus {
    NONE, UNSELECTED, SELECTED
}

const GridView = (props: any) => {
    const tableData = useSelector((state) => state.dataFrames.tableData);

    const activeDataFrame = useSelector(
        (state) => state.dataFrames.activeDataFrame
    );

    const dfReview: IDFUpdatesReview = useSelector((state) =>
        getReviewRequest(state)
    );

    function getReviewRequest(state): IDFUpdatesReview {
        return ifElse(state.dataFrames.dfUpdatesReview, activeDataFrame, null);
    }

    // const createCell = (
    //     colName: string,
    //     rowIndex: number,
    //     item: any,
    //     head: boolean = false,
    //     indexCell: boolean = false
    // ) => {
    //     let review: boolean = false;
    //     const metadata = ifElse(
    //         store.getState().dataFrames.metadata,
    //         activeDataFrame,
    //         null
    //     );

    //     if (dfReview) {
    //         if (dfReview.type == ReviewType.col) {
    //             review = dfReview.name == colName;
    //         } else if (dfReview.type == ReviewType.row) {
    //             review = dfReview.name == rowIndex;
    //         } else if (dfReview.type == ReviewType.cell) {
    //             // console.log(dfReview.name);
    //             let name = dfReview.name as [string, number];
    //             review = name[0] == colName && name[1] == rowIndex;
    //         }
    //     }
    //     // if (review){
    //     // console.log('dfReview: ', dfReview, dfColName, dfRowIndex, head);
    //     // }
    //     // console.log('RichOutputView _createCell: ', dfColName);
    //     return (
    //         <Fragment>
    //             {indexCell ? (
    //                 <DataTableIndexCell
    //                     key={shortid.generate()}
    //                     review={review}
    //                 >
    //                     {rowIndex}
    //                     {dfReview && dfReview.type == ReviewType.row && review && (
    //                         <ScrollIntoViewIfNeeded
    //                             options={{
    //                                 active: true,
    //                                 block: "nearest",
    //                                 inline: "center",
    //                             }}
    //                         />
    //                     )}
    //                 </DataTableIndexCell>
    //             ) : (
    //                 <DataTableCell
    //                     key={shortid.generate()}
    //                     align="right"
    //                     review={review}
    //                     head={head}
    //                 >
    //                     {head ? (
    //                         <Fragment>
    //                             {item}
    //                             {metadata &&
    //                             metadata.columns[colName] &&
    //                             !Object.values(FileMimeType).includes(
    //                                 metadata.columns[colName].type
    //                             ) ? (
    //                                 <Fragment>
    //                                     <ColumnHistogram
    //                                         df_id={activeDataFrame}
    //                                         col_name={colName}
    //                                         smallLayout={true}
    //                                     />
    //                                     <CountNA
    //                                         df_id={activeDataFrame}
    //                                         col_name={colName}
    //                                     />
    //                                 </Fragment>
    //                             ) : null}
    //                         </Fragment>
    //                     ) : metadata &&
    //                       metadata.columns[colName] &&
    //                       metadata.columns[colName].type ===
    //                           FileMimeType.FILEPNG ? (
    //                         <img src={"data:image/png;base64," + item.binary} />
    //                     ) : (
    //                         item
    //                     )}
    //                     {dfReview &&
    //                         dfReview.type == ReviewType.col &&
    //                         head &&
    //                         review && (
    //                             <ScrollIntoViewIfNeeded
    //                                 options={{
    //                                     active: true,
    //                                     block: "nearest",
    //                                     inline: "center",
    //                                     behavior: "smooth",
    //                                 }}
    //                             />
    //                         )}
    //                     {dfReview &&
    //                         dfReview.type == ReviewType.cell &&
    //                         review && (
    //                             <ScrollIntoViewIfNeeded
    //                                 options={{
    //                                     active: true,
    //                                     block: "nearest",
    //                                     inline: "center",
    //                                     behavior: "smooth",
    //                                 }}
    //                             />
    //                         )}
    //                 </DataTableCell>
    //             )}
    //         </Fragment>
    //     );
    // };

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
            case FileMimeType.FILEPNG:
                return <img src={"data:image/png;base64," + item.binary} />;
            case FileMimeType.FILEJPG:
                return <img src={"data:image/jpg;base64," + item.binary} />;
        }
    };

    const createMetaElem = (item: object, colName: string) => {
        // FIXME: move the line-height style to StyledComponents. I tried it but it did not work
        return (
            <DataGridItemMetadata style={{ "line-height": "100%" }}>
                <Typography fontSize={12} component="span" variant="caption">
                    {colName}:{" "}
                </Typography>
                <Typography fontSize={12} component="span">
                    {item}
                </Typography>
            </DataGridItemMetadata>
        );
    };

    const createGridCell = (colNames: [], rowIndex: any, rowData: any[]) => {
        const metadata = ifElse(
            store.getState().dataFrames.metadata,
            activeDataFrame,
            null
        );

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
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {rowData.map((item: any, index: number) => {
                        if (
                            metadata &&
                            metadata.columns[colNames[index]] &&
                            Object.values(CNextMimeType).includes(
                                metadata.columns[colNames[index]].type
                            )
                        )
                            return createMimeElem(
                                item,
                                metadata.columns[colNames[index]].type
                            );
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
        <DataGridContainer>
            {console.log("Render GridView")}
            <Grid container rowSpacing={1} columnSpacing={1}>
                {tableData[activeDataFrame].rows.map(
                    (rowData: any[], index: number) => (
                        <Grid item>
                            {createGridCell(
                                tableData[activeDataFrame].column_names,
                                tableData[activeDataFrame].index.data[index],
                                rowData
                            )}
                        </Grid>
                    )
                )}
            </Grid>
        </DataGridContainer>
    );
};

export default GridView;
