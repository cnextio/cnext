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
import {
    FileMimeType,
    IDFUpdatesReview,
    ReviewType,
} from "../../../interfaces/IApp";
import ColumnHistogram from "./ColumnHistogram";
import { useSelector } from "react-redux";
import { ifElse } from "../../libs";
import CountNA from "./CountNA";
import store from "../../../../redux/store";
import { RootState } from "../../../../redux/store";

const TableView = (props: any) => {
    const tableData = useSelector((state: RootState) => state.dataFrames.tableData);

    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);

    const dfReview: IDFUpdatesReview = useSelector((state: RootState) => getReviewRequest(state));

    function getReviewRequest(state: RootState): IDFUpdatesReview {
        return ifElse(state.dataFrames.dfUpdatesReview, activeDataFrame, null);
    }

    const createCell = (
        colName: string,
        rowIndex: number,
        item: any,
        head: boolean = false,
        indexCell: boolean = false
    ) => {
        let review: boolean = false;
        let state = store.getState();
        let activeDataFrame = state.dataFrames.activeDataFrame;
        let dfReview = state.dataFrames.dfUpdatesReview[activeDataFrame];
        console.log("TableView: ", dfReview);

        const metadata = state.dataFrames.metadata[activeDataFrame];

        if (dfReview) {
            if (dfReview.type === ReviewType.col) {
                review = dfReview.name == colName;
            } else if (dfReview.type === ReviewType.row) {
                review = dfReview.name == rowIndex;
            } else if (dfReview.type === ReviewType.cell) {
                // console.log(dfReview.name);
                let name = dfReview.name as [string, number];
                review = name[0] == colName && name[1] == rowIndex;
                console.log("TableView: ", name, colName, rowIndex);
            }
        }
        // if (review){
        // console.log('dfReview: ', dfReview, dfColName, dfRowIndex, head);
        // }
        // console.log('RichOutputView _createCell: ', dfColName);
        return (
            <Fragment>
                {indexCell ? (
                    <DataTableIndexCell key={shortid.generate()} review={review}>
                        {rowIndex}
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
                ) : (
                    <DataTableCell
                        key={shortid.generate()}
                        align='right'
                        review={review}
                        head={head}
                    >
                        {head ? (
                            <Fragment>
                                {item}
                                {metadata &&
                                metadata.columns[colName] &&
                                !Object.values(FileMimeType).includes(
                                    metadata.columns[colName].type
                                ) ? (
                                    <Fragment>
                                        <ColumnHistogram
                                            df_id={activeDataFrame}
                                            col_name={colName}
                                            smallLayout={true}
                                        />
                                        <CountNA df_id={activeDataFrame} col_name={colName} />
                                    </Fragment>
                                ) : null}
                            </Fragment>
                        ) : metadata &&
                          metadata.columns[colName] &&
                          [FileMimeType.FILE_PNG, FileMimeType.URL_PNG].includes(
                              metadata.columns[colName].type
                          ) ? (
                            <ImageMimeCell src={"data:image/png;base64," + item.binary} />
                        ) : (
                            item
                        )}
                        {dfReview && dfReview.type == ReviewType.col && head && review && (
                            <ScrollIntoViewIfNeeded
                                options={{
                                    active: true,
                                    block: "nearest",
                                    inline: "center",
                                    behavior: "smooth",
                                }}
                            />
                        )}
                        {dfReview && dfReview.type == ReviewType.cell && review && (
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
                )}
            </Fragment>
        );
    };

    const _createRow = (colNames: [], rowIndex: any, rowData: any[]) => {
        return (
            <DataTableRow hover key={shortid.generate()}>
                {createCell(null, rowIndex, null, false, true)}
                {rowData.map((item: any, index: number) =>
                    createCell(colNames[index], rowIndex, item)
                )}
            </DataTableRow>
        );
    };

    return (
        <StyledTableView>
            {/* {console.log("Render TableContainer: ", tableData)} */}
            {console.log("Render TableContainer")}
            {tableData[activeDataFrame] && (
                <DataTable sx={{ minWidth: 650 }} size='small' stickyHeader>
                    {/* {console.log(tableData)} */}

                    <DataTableHead>
                        <DataTableHeadRow>
                            <DataTableHeadCell>
                                <DataTableHeadText>
                                    {tableData[activeDataFrame]?.index.name}
                                </DataTableHeadText>
                            </DataTableHeadCell>
                            {tableData[activeDataFrame]?.column_names.map(
                                (dfColName: string, index: number) =>
                                    createCell(dfColName, 0, dfColName, true)
                            )}
                        </DataTableHeadRow>
                    </DataTableHead>
                    <TableBody>
                        {tableData[activeDataFrame]?.rows.map((rowData: any[], index: number) =>
                            _createRow(
                                tableData[activeDataFrame]?.column_names,
                                tableData[activeDataFrame]?.index.data[index],
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
