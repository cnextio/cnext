import React, { useCallback } from "react";
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
    // DataTable,
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
import store from "../../../../redux/store";
import shortid from "shortid";
import { TableBody } from "@mui/material";
import { ICellDataURLImage, UDFLocation } from "../../../interfaces/IDataFrameManager";
import UDFContainer from "./UDFContainer";
import InputComponent from "./InputComponent";
import { relative } from "path";
import { DataTable } from "./styles";

const fetchSize = 10;

function TableViewVirtual() {
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

    const renderHeadCell = (header: any, rowIndexData: string | number) => {
        let colName = header.column.columnDef.header;
        if (activeDataFrame) {
            let state = store.getState();
            // const dfReview = state.dataFrames.dfUpdatesReview[activeDataFrame];
            const metadata = state.dataFrames.metadata[activeDataFrame];
            let review = isReviewingCell(colName, rowIndexData, dfReview);

            return (
                <DataTableCell key={shortid.generate()} align="right" review={review} head={true}>
                    {header.isPlaceholder ? null : (
                        <div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
                    )}
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
                    <div
                        {...{
                            onMouseDown: header.getResizeHandler(),
                            onTouchStart: header.getResizeHandler(),
                            className: `resizer ${
                                header.column.getIsResizing() ? "isResizing" : ""
                            }`,
                            style: {
                                transform:
                                    columnResizeMode === "onEnd" && header.column.getIsResizing()
                                        ? `translateX(${
                                              table.getState().columnSizingInfo.deltaOffset
                                          }px)`
                                        : "",
                            },
                        }}
                    />
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
            const colName = cell.column.id;
            if (indexCell) {
                //TODO: this seems wrong
                const review = isReviewingCell(rowIndexData, rowIndexData, dfReview);
                return (
                    <DataTableIndexCell
                        key="index"
                        review={review}
                        style={{ height: "max-content" }}
                    >
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
            } else if (cell) {
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
            }
        }
    };

    // const renderBodyRow = (
    //     rowNumber: number,
    //     colNames: string[],
    //     rowIndexData: any,
    //     rowData: any[],
    //     virtualRow: any
    // ) => {
    //     return (
    //         <DataTableRow
    //             hover
    //             key={virtualRow.index}
    //             style={{
    //                 position: "absolute",
    //                 top: 0,
    //                 left: 0,
    //                 transform: `translateY(${virtualRow.start}px)`,
    //             }}
    //             ref={virtualRow.measureElement}
    //             className={virtualRow.index % 2 ? "even-row" : "odd-row"}
    //         >
    //             {/** render index cell */}
    //             {renderBodyCell(rowNumber, rowIndexData, rowIndexData, null, true)}
    //             {/** render data cell */}
    //             {rowData?.map((rowCellData: any, index: number) =>
    //                 renderBodyCell(rowNumber, colNames[index], rowIndexData, rowCellData)
    //             )}
    //         </DataTableRow>
    //     );
    // };
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
                {/* {renderBodyCell(row?.id, null, true)} */}
                {/** render data cell */}
                {row?.getVisibleCells().map((cell: any) => renderBodyCell(row?.id, cell))}
            </DataTableRow>
        );
    };
    const tableContainerRef = React.useRef<HTMLDivElement>(null);

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const columns = React.useMemo<ColumnDef<any>[]>(() => {
        if (activeDataFrame) {
            const columns = tableData[activeDataFrame]?.column_names.map(
                (item: any, index: any) => {
                    return { accessorKey: item, header: item, sixe: 100 };
                }
            );
            // console.log("virtual table columns: ", columns);
            return columns;
        } else return [];
    }, [activeDataFrame, tableData]);

    // const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery<any>(
    //     ["table-data", sorting], //adding sorting state as key causes table to reset and fetch from new beginning upon sort
    //     async ({ pageParam = 0 }) => {
    //         const start = pageParam * fetchSize;
    //         const fetchedData = fetchData(tableRow, start, fetchSize, sorting); //pretend api call
    //         return fetchedData;
    //     },
    //     {
    //         getNextPageParam: (_lastGroup, groups) => groups.length,
    //         keepPreviousData: true,
    //         refetchOnWindowFocus: false,
    //     }
    // );

    const dictData = React.useMemo(() => {
        const newData = [];

        if (activeDataFrame) {
            let tableRows = tableData[activeDataFrame]?.rows;
            let tableCols = tableData[activeDataFrame]?.column_names;
            let r = 0;
            for (const row of tableRows) {
                const rowDict: { [key: string]: any } = {};
                for (let c = 0; c < row.length; c++) {
                    rowDict[tableCols[c]] = row[c];
                }
                newData.push(rowDict);
                r++;
            }
        }
        // console.log("virtual table data: ", newData);
        return newData;
    }, [activeDataFrame, tableData]);

    const [columnResizeMode, setColumnResizeMode] = React.useState<ColumnResizeMode>("onChange");
    // const rerender = React.useReducer(() => ({}), {})[1];
    //we must flatten the array of arrays from the useInfiniteQuery hook
    // const flatData = React.useMemo(() => data?.pages?.flatMap((page) => page.data) ?? [], [data]);
    // const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
    // const totalFetched = flatData.length;
    const table = useReactTable({
        data: dictData,
        columns,
        columnResizeMode,
        onSortingChange: setSorting,
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

    // const fetchMoreOnBottomReached = React.useCallback(
    //     (containerRefElement?: HTMLDivElement | null) => {
    //         if (containerRefElement) {
    //             const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
    //             console.log(
    //                 "virtualItems",
    //                 scrollHeight,
    //                 scrollTop,
    //                 clientHeight,
    //                 flatData.length,
    //                 totalFetched,
    //                 totalDBRowCount,
    //                 rowVirtualizer.getVirtualItems(),
    //                 data
    //             );
    //             if (
    //                 scrollHeight - scrollTop - clientHeight < 50 &&
    //                 !isFetching &&
    //                 totalFetched < totalDBRowCount
    //             ) {
    //                 fetchNextPage();
    //             }
    //         }
    //     },
    //     [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
    // );

    // React.useEffect(() => {
    //     // fetchMoreOnBottomReached(tableContainerRef.current);
    // }, [fetchMoreOnBottomReached]);

    // if (isLoading) {
    //     return <>Loading...</>;
    // }
    return (
        <StyledTableView ref={tableContainerRef}  style={{ width: "fit-content" }}>
            {/* {console.log("Render TableContainer: ", tableData)} */}
            {console.log("Render TableContainer ")}
            {activeDataFrame && tableData[activeDataFrame] && (
                <DataTable size="small" stickyHeader>
                    <DataTableHead style={{ border: "1px solid" }}>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <DataTableHeadRow key={headerGroup.id} style={{ border: "1px solid" }}>
                                {headerGroup.headers.map((header) => renderHeadCell(header, 0))}
                            </DataTableHeadRow>
                        ))}
                    </DataTableHead>
                    <TableBody style={{ height: "100%" }}>
                        {paddingTop > 0 && (
                            <tr>
                                <td style={{ height: `${paddingTop}px` }} />
                            </tr>
                        )}
                        {console.log(
                            "render special virtualRows.length: ",
                            virtualRows.length,
                            virtualRows?.[virtualRows.length - 1]
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
