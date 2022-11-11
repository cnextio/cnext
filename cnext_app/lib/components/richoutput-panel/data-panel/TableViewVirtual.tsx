import React, { useCallback } from "react";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    Row,
    useReactTable,
    ColumnResizeMode,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { SpecialMimeType } from "../../../interfaces/IApp";
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
// const OVER_SCAN = 10;
/** number of pages to be retained */
const NUM_KEEP_PAGE = 3;
/** the difference between the rendered row and what is stored in the memory below which new data need to be loaded */
const FETCH_THRESHOLD = 25;

const TableViewVirtual = () => {
    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);
    const columnSelector = useSelector((state: RootState) =>
        activeDataFrame ? state.dataFrames.columnSelector[activeDataFrame].columns : {}
    );

    const tableContainerRef = React.useRef<HTMLDivElement>(null);

    const tableMetadataUpdateSignal = useSelector((state: RootState) =>
        activeDataFrame ? state.dataFrames.tableMetadataUpdateSignal[activeDataFrame] : null
    );

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
    }, [activeDataFrame, tableMetadataUpdateSignal]);

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

    const rowVirtualizer = useVirtualizer({
        count: pagedDataTotalSize,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => 20,
    });

    const virtualRows = rowVirtualizer?.getVirtualItems();
    const virtualRowsTotalSize = rowVirtualizer?.getTotalSize();

    const renderHeaderCell = useCallback(
        (header: any, rowIndexData: string | number, indexCell: boolean = false) => {
            if (activeDataFrame) {
                const state = store.getState();
                // const dfReview = state.dataFrames.dfUpdatesReview[activeDataFrame];
                // const metadata = state.dataFrames.metadata[activeDataFrame];

                if (indexCell && pagedTableData) {
                    // const indexName = state.dataFrames.tableData[activeDataFrame]?.index.name;
                    const indexName = pagedTableData[0]?.index.name;
                    // const review = isReviewingCell(indexName, rowIndexData, dfReview);
                    return (
                        // <DataTableCell key={indexName} align="right" review={review} head={true}>
                        <DataTableCell key={indexName} align="right" review={false} head={true}>
                            {indexName}
                            {/* {renderUDF(activeDataFrame, metadata, indexName)} */}
                            <UDFContainer colName={indexName} />
                            {/* {renderReviewer(review)} */}
                        </DataTableCell>
                    );
                } else if (header) {
                    const colName = header.column.columnDef.header;
                    // const review = isReviewingCell(colName, rowIndexData, dfReview);
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
                        // <DataTableCell key={header.id} align="right" review={review} head={true}>
                        <DataTableCell key={header.id} align="right" review={false} head={true}>
                            {header.isPlaceholder ? null : (
                                <div>
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                </div>
                            )}
                            <UDFContainer colName={colName} />
                            {/* {renderReviewer(review)} */}
                            {renderResizer()}
                        </DataTableCell>
                    );
                }
            }
        },
        [activeDataFrame, pagedTableData]
    );

    const renderSpecialMimeInnerCell = useCallback(
        (
            df_id: string,
            rowNumber: number,
            rowIndexData: string,
            cell: any,
            type: SpecialMimeType
        ) => {
            if (df_id) {
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
                                df_id={df_id}
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
        },
        []
    );

    const renderBodyCell = useCallback(
        (
            // df_id: string | null,
            rowNumber: number,
            cell: any,
            rowIndex: any,
            indexCell: boolean = false
        ) => {
            let state = store.getState();
            if (activeDataFrame) {
                const metadata = state.dataFrames.metadata[activeDataFrame];
                if (indexCell) {
                    // const review = isReviewingCell(rowIndex, rowIndex, dfReview);
                    return (
                        <DataTableIndexCell
                            key="index"
                            review={false}
                        >
                            {rowIndex}
                            {/* {renderReviewer(review)} */}
                        </DataTableIndexCell>
                    );
                } else if (cell && metadata) {
                    const type = metadata.columns[cell.column.id]?.type;
                    return (
                        <DataTableCell
                            key={cell.id}
                            align="right"
                            // review={false}
                            head={false}
                            style={{
                                width: cell.column.getSize(),
                            }}
                        >
                            {metadata && Object.values(SpecialMimeType).includes(type)
                                ? renderSpecialMimeInnerCell(
                                      activeDataFrame,
                                      rowNumber,
                                      rowIndex,
                                      cell,
                                      type
                                  )
                                : /** there is bug in the library that makes it not working with column name with a `.` in it */
                                  // return flexRender(cell.column.columnDef.cell, cell.getContext());
                                  cell.row.original[cell.column.columnDef.header]}
                        </DataTableCell>
                    );
                }
            }
        },
        [activeDataFrame, tableMetadataUpdateSignal]
    );

    const renderBodyRow = useCallback(
        (virtualRow: any) => {
            if (fromPage != null) {
                const startIndex = fromPage * DF_PAGE_SIZE;
                /** since we only store a subset of data in pagedTableData therefore the rows, we have to map the index
                 * virtualRow.index to rows index with `virtualRow.index - startIndex` */
                const shiftedIndex = virtualRow?.index - startIndex;
                if (shiftedIndex >= 0 && shiftedIndex < rows.length) {
                    const row = rows[shiftedIndex] as Row;
                    return (
                        <DataTableRow
                            hover
                            key={row?.id}
                            ref={rowVirtualizer.measureElement}
                            data-index={virtualRow.index}
                            // className={row?.index % 2 ? "even-row" : "odd-row"}
                        >
                            {/** render index cell */}
                            {renderBodyCell(
                                // activeDataFrame,
                                row?.id,
                                null,
                                flatIndexData[row?.id],
                                true
                            )}
                            {/** render data cell */}
                            {row?.getVisibleCells().map((cell: any) =>
                                renderBodyCell(
                                    // activeDataFrame,
                                    row?.id,
                                    cell,
                                    flatIndexData[row?.id]
                                )
                            )}
                        </DataTableRow>
                    );
                }
            }
        },
        [activeDataFrame, tableMetadataUpdateSignal, rows, fromPage]
    );

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
            {console.log("Debug DataViewer Render TableContainer ")}
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
                    <TableBody style={{ height: virtualRowsTotalSize }}>
                        {paddingTop > 0 && (
                            <tr>
                                <td style={{ height: `${paddingTop}px` }} />
                            </tr>
                        )}
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
