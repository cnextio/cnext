import React, { useCallback, useEffect } from "react";
import CountNA from "./CountNA";

//3 TanStack Libraries!!!
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    Row,
    SortingState,
    ColumnSort,
    useReactTable,
    ColumnResizeMode,
} from "@tanstack/react-table";
// import { QueryClient, QueryClientProvider, useInfiniteQuery } from "@tanstack/react-query";
// import { useVirtualizer } from "@tanstack/react-virtual";
import { useVirtual } from "react-virtual";
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
import { useInfiniteQuery } from "@tanstack/react-query";

function TableViewVirtual() {
    const tableData = useSelector((state: RootState) => state.dataFrames.tableData);
    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);
    const columnSelector = useSelector((state: RootState) =>
        activeDataFrame ? state.dataFrames.columnSelector : {}
    );
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

            if (indexCell) {
                const indexName = state.dataFrames.tableData[activeDataFrame].index.name;
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
                                cellContent.url
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
                                cellContent.url
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

    const renderBodyCell = (rowNumber: number, cell: any, indexCell: boolean = false) => {
        let state = store.getState();
        if (activeDataFrame) {
            const dfReview = state.dataFrames.dfUpdatesReview[activeDataFrame];
            const metadata = state.dataFrames.metadata[activeDataFrame];
            const rowIndexData = tableData[activeDataFrame]?.index.data[rowNumber];
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
                const review = isReviewingCell(rowIndexData, rowIndexData, dfReview);
                return (
                    <DataTableIndexCell
                        key="index"
                        review={review}
                        style={{ height: "max-content" }}
                    >
                        {rowIndexData}
                        {renderReviewer(review)}
                    </DataTableIndexCell>
                );
            } else if (cell) {
                const colName = cell.column.id;
                const review = isReviewingCell(colName, rowIndexData, dfReview);
                const type = metadata.columns[cell.column.id].type;
                // console.log(
                //     "virtual rowNumber, colName, cell.id, type: ",
                //     rowNumber,
                //     cell.column.id,
                //     cell,
                //     type
                // );
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
                            ? renderSpecialMimeInnerCell(rowNumber, rowIndexData, cell, type)
                            : flexRender(cell.column.columnDef.cell, cell.getContext())}
                        {/* tableData[activeDataFrame]?.rows[rowNumber][cellIndex]} */}
                        {renderReviewer(review)}
                    </DataTableCell>
                );
            }
        }
    };

    const renderBodyRow = (virtualRow: any) => {
        const row = rows[virtualRow.index] as Row;

        return (
            <DataTableRow
                hover
                key={row?.id}
                ref={virtualRow.measureRef}
                // className={row?.index % 2 ? "even-row" : "odd-row"}
            >
                {/** render index cell */}
                {renderBodyCell(row?.id, null, true)}
                {/** render data cell */}
                {row?.getVisibleCells().map((cell: any) => renderBodyCell(row?.id, cell))}
            </DataTableRow>
        );
    };
    const tableContainerRef = React.useRef<HTMLDivElement>(null);

    /** convert data to dictionary type to make it compatible with react-table */
    const rowsData = React.useMemo(() => {
        const rowsData = [];

        if (activeDataFrame) {
            let tableRows = tableData[activeDataFrame]?.rows;
            let tableCols = tableData[activeDataFrame]?.column_names;

            for (let i = 0; i < tableRows.length; i++) {
                const rowDict: { [key: string]: any } = {};
                for (let c = 0; c < tableRows[i].length; c++) {
                    rowDict[tableCols[c]] = tableRows[i][c];
                }
                rowsData.push(rowDict);
            }
        }
        // console.log("virtual table data: ", newData);
        return rowsData;
    }, [activeDataFrame, tableData]);

    const columns = React.useMemo<ColumnDef<any>[]>(() => {
        if (activeDataFrame) {
            const columns = tableData[activeDataFrame]?.column_names.map(
                (item: any, index: any) => {
                    return { accessorKey: item, header: item };
                }
            );
            // console.log("virtual table columns: ", columns);
            return columns;
        } else return [];
    }, [activeDataFrame, tableData]);

    const [columnResizeMode, setColumnResizeMode] = React.useState<ColumnResizeMode>("onChange");
    const [columnVisibility, setColumnVisibility] = React.useState({});

    useEffect(() => {
        setColumnVisibility(columnSelector);
    }, [columnSelector]);

    const table = useReactTable({
        data: rowsData,
        columns,
        columnResizeMode,
        state: {
            columnVisibility,
        },
        getCoreRowModel: getCoreRowModel(),
        debugTable: true,
        debugHeaders: true,
        debugColumns: true,
    });

    const { rows } = table.getRowModel();

    const rowVirtualizer = useVirtual({
        parentRef: tableContainerRef,
        size: rows.length,
        // estimateSize: useCallback(() => 10, []),
        overscan: 10,
    });
    const { virtualItems: virtualRows, totalSize } = rowVirtualizer;

    const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
    const paddingBottom =
        virtualRows.length > 0 ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0) : 0;

    const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery<any>(
        async ({ pageParam = 0 }) => {
            // const start = pageParam * fetchSize;
            const fetchedData = []; // = fetchData(tableRow, start, fetchSize, sorting); //pretend api call
            return fetchedData;
        },
        {
            getNextPageParam: (_lastGroup, groups) => groups.length,
            keepPreviousData: true,
            refetchOnWindowFocus: false,
        }
    );
    const fetchMoreOnBottomReached = React.useCallback(
        (containerRefElement?: HTMLDivElement | null) => {
            if (containerRefElement) {
                const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
                if (
                    scrollHeight - scrollTop - clientHeight < 50 &&
                    !isFetching //&& totalFetched < totalDBRowCount
                ) {
                    fetchNextPage();
                }
            }
        },
        [fetchNextPage, isFetching]
    );

    //a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
    // React.useEffect(() => {
    //     // fetchMoreOnBottomReached(tableContainerRef.current);
    // }, [fetchMoreOnBottomReached]);

    // if (isLoading) {
    //     return <>Loading...</>;
    // }
    return (
        <StyledTableView ref={tableContainerRef}>
            {/* {console.log("Render TableContainer: ", tableData)} */}
            {console.log("Render TableContainer ")}
            {activeDataFrame && tableData[activeDataFrame] && (
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
                            "render special virtualRows.length: ",
                            virtualRows.length,
                            virtualRows?.[virtualRows.length - 1]
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
        // </div>
    );
}

export default TableViewVirtual;
export const fetchData = (data: any, start: number, size: number, sorting: SortingState) => {
    const dbData = [...data];
    if (sorting.length) {
        const sort = sorting[0] as ColumnSort;
        const { id, desc } = sort as { id: keyof any; desc: boolean };
        dbData.sort((a, b) => {
            if (desc) {
                return a[id] < b[id] ? 1 : -1;
            }
            return a[id] > b[id] ? 1 : -1;
        });
    }
    return {
        data: dbData.slice(start, start + size),
        meta: {
            totalRowCount: dbData.length,
        },
    };
};
