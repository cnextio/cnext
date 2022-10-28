import React, { useCallback } from "react";
import CountNA from "./CountNA";

//3 TanStack Libraries!!!
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    Row,
    useReactTable,
    ColumnResizeMode,
} from "@tanstack/react-table";
import { useVirtual } from "../../../react-virtual";
import ScrollIntoViewIfNeeded from "react-scroll-into-view-if-needed";

import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { SpecialMimeType, IDFUpdatesReview, ReviewType } from "../../../interfaces/IApp";
import { ifElse } from "../../libs";
import {
    DataTableHead,
    DataTableHeadRow,
    DataTableIndexCell,
    DataTableRow,
    StyledTableView,
    ImageMimeCell,
} from "../../StyledComponents";
import store from "../../../../redux/store";
import { TableBody } from "@mui/material";
import { UDFLocation } from "../../../interfaces/IDataFrameManager";
import UDFContainer from "./UDFContainer";
import InputComponent from "./InputComponent";
import { DataTable, DataTableCell } from "./styles";
import { useLoadTableData } from "./useLoadTableData";

/** data page size */
const DF_PAGE_SIZE = 50;
/** number of rows that will be rendered outside of the view */
const OVER_SCAN = 10;
/** number of pages to be retained */
const NUM_KEEP_PAGE = 3;
/** the difference between the rendered row and what is stored in the memory below which new data need to be loaded */
const FETCH_THRESHOLD = 10;

const TableViewVirtual = () => {
    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);
    const columnSelector = useSelector((state: RootState) =>
        activeDataFrame ? state.dataFrames.columnSelector[activeDataFrame].columns : {}
    );
    // const dfReview: IDFUpdatesReview | null = useSelector((state: RootState) =>
    //     getReviewRequest(state)
    // );
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

    const renderHeaderCell = (
        header: any,
        rowIndexData: string | number,
        indexCell: boolean = false
    ) => {
        if (activeDataFrame) {
            const state = store.getState();
            const dfReview = state.dataFrames.dfUpdatesReview[activeDataFrame];
            const metadata = state.dataFrames.metadata[activeDataFrame];
            const renderReviewer = (review) => {
                return (
                    <>
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
                    </>
                );
            };

            if (indexCell && pagedTableData) {
                // const indexName = state.dataFrames.tableData[activeDataFrame]?.index.name;
                const indexName = pagedTableData[0]?.index.name;
                const review = isReviewingCell(indexName, rowIndexData, dfReview);
                return (
                    <DataTableCell key={indexName} align="right" review={review} head={true}>
                        {indexName}
                        {renderUDF(activeDataFrame, metadata, indexName)}
                        {renderReviewer(review)}
                    </DataTableCell>
                );
            } else if (header) {
                const colName = header.column.columnDef.header;
                const review = isReviewingCell(colName, rowIndexData, dfReview);
                // console.log('render special header: ', header)
                const renderResizer = () => {
                    return (
                        <div
                            {...{
                                onMouseDown: header.getResizeHandler(),
                                onTouchStart: header.getResizeHandler(),
                                className: `resizer ${
                                    header.column.getIsResizing() ? "isResizing" : ""
                                }`,
                                style: {
                                    transform:
                                        columnResizeMode === "onEnd" &&
                                        header.column.getIsResizing()
                                            ? `translateX(${
                                                  table.getState().columnSizingInfo.deltaOffset
                                              }px)`
                                            : "",
                                },
                            }}
                        />
                    );
                };

                return (
                    <DataTableCell key={header.id} align="right" review={review} head={true}>
                        {header.isPlaceholder ? null : (
                            <div>
                                {flexRender(header.column.columnDef.header, header.getContext())}
                            </div>
                        )}
                        {renderUDF(activeDataFrame, metadata, colName)}
                        {renderReviewer(review)}
                        {renderResizer()}
                    </DataTableCell>
                );
            }
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
                    !Object.values(SpecialMimeType).includes(dfMetadata.columns[colName].type) && (
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

    const renderSpecialMimeInnerCell = (
        rowNumber: number,
        rowIndexData: string,
        cell: any,
        type: SpecialMimeType
    ) => {
        if (activeDataFrame) {
            const cellContent = cell.getValue();
            const colName = cell.column.id;
            // console.log("Render special mimetype: ", cellContent, cell);
            if ([SpecialMimeType.FILE_PNG, SpecialMimeType.URL_PNG].includes(type)) {
                return (
                    <>
                        <ImageMimeCell
                            src={
                                // "data:image/png;base64," + (cellContent as ICellDataURLImage).binary
                                cellContent?.url
                            }
                        />
                        {flexRender("", cell.getContext())}
                    </>
                );
            } else if ([SpecialMimeType.FILE_JPG, SpecialMimeType.URL_JPG].includes(type)) {
                return (
                    <>
                        <ImageMimeCell
                            src={
                                // "data:image/jpg;base64," + (cellContent as ICellDataURLImage).binary
                                cellContent?.url
                            }
                        />
                        {flexRender("", cell.getContext())}
                    </>
                );
            } else if (
                [
                    SpecialMimeType.INPUT_SELECTION,
                    SpecialMimeType.INPUT_CHECKBOX,
                    SpecialMimeType.INPUT_TEXT,
                ].includes(type)
            ) {
                return (
                    <>
                        <InputComponent
                            df_id={activeDataFrame}
                            rowNumber={rowNumber}
                            colName={colName}
                            index={rowIndexData}
                            item={cellContent}
                            type={type}
                        />
                        {flexRender("", cell.getContext())}
                    </>
                );
            }
        }
    };

    const renderBodyCell = (
        rowNumber: number,
        cell: any,
        rowIndex: any,
        indexCell: boolean = false
    ) => {
        let state = store.getState();
        if (activeDataFrame && pagedTableData) {
            const dfReview = state.dataFrames.dfUpdatesReview[activeDataFrame];
            const metadata = state.dataFrames.metadata[activeDataFrame];
            const renderReviewer = (review) => {
                return (
                    <>
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
                    </>
                );
            };
            if (indexCell) {
                const review = isReviewingCell(rowIndex, rowIndex, dfReview);
                return (
                    <DataTableIndexCell
                        key="index"
                        review={review}
                        style={{ height: "max-content" }}
                    >
                        {rowIndex}
                        {renderReviewer(review)}
                    </DataTableIndexCell>
                );
            } else if (cell) {
                const colName = cell.column.id;
                const review = isReviewingCell(colName, rowIndex, dfReview);
                // console.log("DataViewer metadata cell", metadata, cell);
                const type = metadata.columns[cell.column.id].type;
                return (
                    <DataTableCell
                        key={cell.id}
                        align="right"
                        review={review}
                        head={false}
                        style={{
                            width: cell.column.getSize(),
                            height: "max-content",
                        }}
                    >
                        {metadata && Object.values(SpecialMimeType).includes(type)
                            ? renderSpecialMimeInnerCell(rowNumber, rowIndex, cell, type)
                            : flexRender(cell.column.columnDef.cell, cell.getContext())}
                        {/* tableData[activeDataFrame]?.rows[rowNumber][cellIndex]} */}
                        {renderReviewer(review)}
                    </DataTableCell>
                );
            }
        }
    };

    const renderBodyRow = (virtualRow: any) => {
        if (fromPage != null) {
            const startIndex = fromPage * DF_PAGE_SIZE;
            /** since we only store a subset of data in pagedTableData therefore the rows, we have to map the index
             * virtualRow.index to rows index with `virtualRow.index - startIndex` */
            const shiftedIndex = virtualRow.index - startIndex;
            if (shiftedIndex >= 0 && shiftedIndex < rows.length) {
                const row = rows[shiftedIndex] as Row;
                return (
                    <DataTableRow
                        hover
                        key={row?.id}
                        ref={virtualRow.measureRef}
                        // className={row?.index % 2 ? "even-row" : "odd-row"}
                    >
                        {/** render index cell */}
                        {renderBodyCell(row?.id, null, flatIndexData[row?.id], true)}
                        {/** render data cell */}
                        {row
                            ?.getVisibleCells()
                            .map((cell: any) =>
                                renderBodyCell(row?.id, cell, flatIndexData[row?.id])
                            )}
                    </DataTableRow>
                );
            }
        }
    };

    const tableContainerRef = React.useRef<HTMLDivElement>(null);

    const dfFilter = useSelector((state: RootState) =>
        activeDataFrame ? state.dataFrames.dfFilter[activeDataFrame] : null
    );

    /** Note: the numKeepPage can be sensitive with DF_PAGE_SIZE and overscan */
    const {
        pagedTableData,
        getTableData,
        fromPage,
        toPage,
        totalSize: pagedDataTotalSize,
        isLoading,
        isError,
    } = useLoadTableData(activeDataFrame, dfFilter?.query, NUM_KEEP_PAGE);

    /** convert data to dictionary type to make it compatible with react-table */
    const [flatIndexData, flatRowsData] = React.useMemo((): [any[], { [key: string]: any }[]] => {
        const rowsData = [];
        let indexData = [];
        if (pagedTableData && pagedTableData.length > 0) {
            indexData = pagedTableData.flatMap((data) => data.index.data);
            let tableCols = pagedTableData[0].column_names;
            let tableRows = pagedTableData.flatMap((data) => data.rows);
            for (let i = 0; i < tableRows.length; i++) {
                const rowDict: { [key: string]: any } = {};
                for (let c = 0; c < tableRows[i].length; c++) {
                    rowDict[tableCols[c]] = tableRows[i][c];
                }
                rowsData.push(rowDict);
            }
        }
        // console.log("virtual table data: ", newData);
        return [indexData, rowsData];
    }, [pagedTableData]);

    const [columnResizeMode, setColumnResizeMode] = React.useState<ColumnResizeMode>("onChange");

    const columns = React.useMemo<ColumnDef<any>[]>(() => {
        const state = store.getState();
        if (activeDataFrame) {
            const metadata = state.dataFrames.metadata[activeDataFrame];
            const columns = Object.keys(metadata.columns).map((item: any, index: any) => {
                return { accessorKey: item, header: item };
            });
            // console.log("DataViewer columns: ", columns);
            return columns;
        } else return [];
    }, [activeDataFrame]);

    const table = useReactTable({
        data: flatRowsData,
        columns,
        columnResizeMode,
        state: {
            columnVisibility: columnSelector,
        },
        getCoreRowModel: getCoreRowModel(),
        debugTable: true,
        debugHeaders: true,
        debugColumns: true,
    });

    const { rows } = table.getRowModel();

    const { virtualItems: virtualRows, totalSize: virtualRowsTotalSize } = useVirtual({
        parentRef: tableContainerRef,
        size: pagedDataTotalSize,
        overscan: OVER_SCAN,
    });

    const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
    const paddingBottom =
        virtualRows.length > 0
            ? virtualRowsTotalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
            : 0;

    const fetchMore = useCallback(
        (containerRefElement: HTMLDivElement | null) => {
            if (containerRefElement && !isLoading && !isError) {
                // const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
                // console.log(
                //     "DataViewer fetchMoreOnBottomReached pagedTableData, toPage, fromPage, scrollHeight, scrollTop, clientHeight, virtualRow.length: ",
                //     pagedTableData,
                //     toPage,
                //     fromPage,
                //     scrollHeight,
                //     scrollTop,
                //     clientHeight,
                //     virtualRows.length,
                //     activeDataFrame
                // );
                // if (scrollHeight - scrollTop - clientHeight < 50 && !isLoading) {
                if (toPage == null && fromPage == null) {
                    getTableData(0, DF_PAGE_SIZE);
                } else if (
                    toPage != null &&
                    (toPage + 1) * DF_PAGE_SIZE - virtualRows[virtualRows.length - 1].index <
                        FETCH_THRESHOLD
                ) {
                    getTableData(toPage + 1, DF_PAGE_SIZE);
                } else if (
                    fromPage != null &&
                    fromPage > 0 &&
                    virtualRows[0].index - fromPage * DF_PAGE_SIZE < FETCH_THRESHOLD
                ) {
                    getTableData(fromPage - 1, DF_PAGE_SIZE);
                }
            }
        },
        [toPage, fromPage, virtualRows, getTableData, isError, isLoading]
    );

    /** a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data */
    React.useEffect(() => {
        if (activeDataFrame && fromPage == null) {
            fetchMore(tableContainerRef.current);
        }
    }, [fetchMore]);

    return (
        <StyledTableView
            ref={tableContainerRef}
            onScroll={(e) => {
                /** this is hacky but we need to do this here to make sure fetchMore won't be call twice.
                 * fetchMore will be called twice when changing from dataframe A to dataframe B
                 * and data frame A has been scrolled */
                if (fromPage != null) {
                    // console.log("DataViewer onScroll fetchMore");
                    fetchMore(e.target as HTMLDivElement);
                }
            }}
        >
            {/* {console.log("Render TableContainer: ", tableData)} */}
            {console.log("DataViewer Render TableContainer ")}
            {activeDataFrame && pagedTableData && (
                <DataTable size="small" stickyHeader>
                    <DataTableHead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <DataTableHeadRow key={headerGroup.id}>
                                {renderHeaderCell(null, 0, true)}
                                {headerGroup.headers.map((header) => renderHeaderCell(header, 0))}
                            </DataTableHeadRow>
                        ))}
                    </DataTableHead>
                    <TableBody style={{ height: "100%" }}>
                        {paddingTop > 0 && (
                            <tr>
                                <td style={{ height: `${paddingTop}px` }} />
                            </tr>
                        )}
                        {/* {console.log(
                            "DataViewer fromPage toPage rows.length, virtualRows start index, virtualRows end index: ",
                            fromPage,
                            toPage,
                            rows.length,
                            virtualRows[0]?.index,
                            virtualRows[virtualRows.length - 1]?.index
                        )} */}
                        {virtualRows.map((virtualRow) => renderBodyRow(virtualRow))}
                        {paddingBottom > 0 && (
                            <tr>
                                <td style={{ height: `${paddingBottom}px` }} />
                            </tr>
                        )}
                    </TableBody>
                </DataTable>
            )}
        </StyledTableView>
    );
};

export default TableViewVirtual;
