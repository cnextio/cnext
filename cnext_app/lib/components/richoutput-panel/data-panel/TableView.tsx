import { TableBody } from "@mui/material";
import React, { Fragment } from "react";
import shortid from "shortid";
import ScrollIntoViewIfNeeded from "react-scroll-into-view-if-needed";

import {
    DataTable,
    DataTableCell,
    DataTableHead,
    DataTableHeadRow,
    DataTableHeadCell,
    DataTableIndexCell,
    DataTableRow,
    StyledTableView,
    DataTableHeadText,
    ImageMimeCell,
} from "../../StyledComponents";
import { FileMimeType, IDFUpdatesReview, ReviewType } from "../../../interfaces/IApp";
import ColumnHistogram from "./ColumnHistogram";
import { useSelector } from "react-redux";
import { ifElse } from "../../libs";
import CountNA from "./CountNA";
import store from "../../../../redux/store";
import { RootState } from "../../../../redux/store";
import { UDFLocation } from "../../../interfaces/IDataFrameManager";
import UDFContainer from "./UDFContainer";

const TableView = (props: any) => {
    const tableData = useSelector((state: RootState) => state.dataFrames.tableData);
    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);
    const dfReview: IDFUpdatesReview | null = useSelector((state: RootState) =>
        getReviewRequest(state)
    );
    const udfsConfig = useSelector((state: RootState) =>
        activeDataFrame ? state.dataFrames.udfsSelector[activeDataFrame] : null
    );

    function getReviewRequest(state: RootState): IDFUpdatesReview | null {
        if (state.dataFrames.activeDataFrame) {
            return ifElse(state.dataFrames.dfUpdatesReview, state.dataFrames.activeDataFrame, null);
        } else {
            return null;
        }
    }

    const isReviewingCell = (colName: string, rowIndexData: any, dfReview: {}) => {
        let review = false;
        if (dfReview) {
            if (dfReview.type === ReviewType.col) {
                review = dfReview.name == colName;
            } else if (dfReview.type === ReviewType.row) {
                review = dfReview.name == rowIndexData;
            } else if (dfReview.type === ReviewType.cell) {
                // console.log(dfReview.name);
                let name = dfReview.name as [string, number];
                review = name[0] == colName && name[1] == rowIndexData;
                // console.log("TableView: ", name, colName, rowIndex);
            }
        }
        return review;
    };

    const renderHeadCell = (colName: string, rowIndexData: any) => {
        if (activeDataFrame) {
            let state = store.getState();
            // const dfReview = state.dataFrames.dfUpdatesReview[activeDataFrame];
            const metadata = state.dataFrames.metadata[activeDataFrame];
            let review = isReviewingCell(colName, rowIndexData, dfReview);

            return (
                <DataTableCell key={shortid.generate()} align="right" review={review} head={true}>
                    {colName}
                    {renderUDF(activeDataFrame, metadata, colName)}
                    {dfReview && review && dfReview.type == ReviewType.col && (
                        <ScrollIntoViewIfNeeded
                            options={{
                                active: true,
                                block: "nearest",
                                inline: "center",
                                behavior: "smooth",
                            }}
                        />
                    )}
                </DataTableCell>
            );
        }
    };

    const renderUDF = (activeDataFrame: string, dfMetadata: {}, colName: string) => {
        const registeredUDFs = store.getState().dataFrames.registeredUDFs;
        const showedUDFs = Object.keys(registeredUDFs.udfs).reduce((showedUDFs: any[], key) => {
            // console.log("showedUDFs: ", key, udfsConfig, registeredUDFs[key].config.view_configs);
            if (
                udfsConfig &&
                udfsConfig.udfs[key] &&
                UDFLocation.TABLE_HEAD in registeredUDFs.udfs[key].config.view_configs
            ) {
                showedUDFs.push({ name: key, udf: registeredUDFs.udfs[key] });
            }
            return showedUDFs;
        }, []);

        /** for UDFView.TABLE_HEAD UDFs we only support 1 UDF per row so only sort by row */
        showedUDFs.sort(
            (a, b) =>
                a.udf.config.view_configs[UDFLocation.TABLE_HEAD].position.row -
                b.udf.config.view_configs[UDFLocation.TABLE_HEAD].position.row
        );
        // console.log("showedUDFs: ", showedUDFs);
        return (
            <>
                {dfMetadata &&
                    dfMetadata.columns[colName] &&
                    !Object.values(FileMimeType).includes(dfMetadata.columns[colName].type) && (
                        <>
                            {/* <ColumnHistogram
                                df_id={activeDataFrame}
                                col_name={colName}
                                width={80}
                                height={50}
                            /> */}
                            {showedUDFs.map((data, index) => {
                                let udfConfig =
                                    data.udf.config.view_configs[UDFLocation.TABLE_HEAD];
                                return (
                                    <UDFContainer
                                        key={index}
                                        udfName={data.name}
                                        df_id={activeDataFrame}
                                        col_name={colName}
                                        width={udfConfig.shape ? udfConfig.shape.width : 80}
                                        height={udfConfig.shape ? udfConfig.shape.height : 50}
                                    />
                                );
                            })}

                            <CountNA df_id={activeDataFrame} col_name={colName} />
                        </>
                    )}
            </>
        );
    };

    const renderBodyInnerCell = (
        item: string,
        metadata: {},
        colName: string,
        dfReview: {},
        review: {}
    ) => {
        return (
            <DataTableCell key={shortid.generate()} align="right" review={review} head={false}>
                {metadata &&
                metadata.columns[colName] &&
                [FileMimeType.FILE_PNG, FileMimeType.URL_PNG].includes(
                    metadata.columns[colName].type
                ) ? (
                    <ImageMimeCell src={"data:image/png;base64," + item.binary} />
                ) : (
                    item
                )}
                {dfReview && review && dfReview.type == ReviewType.cell && (
                    <ScrollIntoViewIfNeeded
                        options={{
                            active: true,
                            block: "nearest",
                            inline: "center",
                            behavior: "smooth",
                        }}
                    />
                )}
            </DataTableCell>
        );
    };

    const renderBodyIndexCell = (rowIndexData: any, dfReview: {}, review: {}) => {
        return (
            <DataTableIndexCell key={shortid.generate()} review={review}>
                {rowIndexData}
                {dfReview && dfReview.type == ReviewType.row && review && (
                    <ScrollIntoViewIfNeeded
                        options={{
                            active: true,
                            block: "nearest",
                            inline: "center",
                        }}
                    />
                )}
            </DataTableIndexCell>
        );
    };

    const renderBodyCell = (
        colName: string | number | null,
        rowIndexData: any,
        rowCellData: any,
        indexCell: boolean = false
    ) => {
        let state = store.getState();
        if (activeDataFrame && colName != null) {
            const dfReview = state.dataFrames.dfUpdatesReview[activeDataFrame];
            const metadata = state.dataFrames.metadata[activeDataFrame];
            let review = isReviewingCell(colName, rowIndexData, dfReview);
            return (
                <>
                    {indexCell
                        ? renderBodyIndexCell(rowIndexData, dfReview, review)
                        : renderBodyInnerCell(rowCellData, metadata, colName, dfReview, review)}
                </>
            );
        }
    };

    const renderBodyRow = (colNames: string[], rowIndexData: any, rowData: any[]) => {
        return (
            <DataTableRow hover key={shortid.generate()}>
                {/** render index cell */}
                {renderBodyCell(rowIndexData, rowIndexData, null, true)}
                {/** render data cell */}
                {rowData.map((rowCellData: any, index: number) =>
                    renderBodyCell(colNames[index], rowIndexData, rowCellData)
                )}
            </DataTableRow>
        );
    };

    return (
        <StyledTableView>
            {/* {console.log("Render TableContainer: ", tableData)} */}
            {console.log("Render TableContainer")}
            {activeDataFrame && tableData[activeDataFrame] && (
                <DataTable sx={{ minWidth: 650 }} size="small" stickyHeader>
                    {/* {console.log(tableData)} */}
                    <DataTableHead>
                        <DataTableHeadRow>
                            {renderHeadCell(tableData[activeDataFrame]?.index.name, 0)}
                            {tableData[activeDataFrame]?.column_names.map(
                                (colName: string, index: number) => renderHeadCell(colName, 0)
                            )}
                        </DataTableHeadRow>
                    </DataTableHead>
                    <TableBody>
                        {tableData[activeDataFrame]?.rows.map((rowData: any[], rowNumber: number) =>
                            renderBodyRow(
                                tableData[activeDataFrame]?.column_names,
                                tableData[activeDataFrame]?.index.data[rowNumber],
                                rowData
                            )
                        )}
                    </TableBody>
                </DataTable>
            )}
        </StyledTableView>
    );
};

export default TableView;
