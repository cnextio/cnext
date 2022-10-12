import React, { Fragment, useEffect } from "react";
import ReactDOM from "react-dom/client";
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
} from "@tanstack/react-table";
import { QueryClient, QueryClientProvider, useInfiniteQuery } from "@tanstack/react-query";
import { useVirtual } from "react-virtual";
import ColumnHistogram from "./ColumnHistogram";
import ScrollIntoViewIfNeeded from "react-scroll-into-view-if-needed";

import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { FileMimeType, IDFUpdatesReview, ReviewType } from "../../../interfaces/IApp";
import { ifElse } from "../../libs";
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
import store from "../../../../redux/store";
import shortid from "shortid";
import { TableBody } from "@mui/material";

const fetchSize = 5;

function TableViewVirtual() {
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
        // console.log("TableView: ", dfReview);

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
                // console.log("TableView: ", name, colName, rowIndex);
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
                        align="right"
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

    const tableContainerRef = React.useRef<HTMLDivElement>(null);

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const columns = React.useMemo<ColumnDef<any>[]>(
        () =>
            tableData[activeDataFrame]?.column_names.map((item: any, index: any) => {
                return { accessorKey: `${index}` };
            }),
        []
    );

    let tableRow = tableData[activeDataFrame]?.rows;
    const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery<any>(
        ["table-data", sorting], //adding sorting state as key causes table to reset and fetch from new beginning upon sort
        async ({ pageParam = 0 }) => {
            const start = pageParam * fetchSize;
            const fetchedData = fetchData(tableRow, start, fetchSize, sorting); //pretend api call
            return fetchedData;
        },
        {
            getNextPageParam: (_lastGroup, groups) => groups.length,
            keepPreviousData: true,
            refetchOnWindowFocus: false,
        }
    );

    //we must flatten the array of arrays from the useInfiniteQuery hook
    const flatData = React.useMemo(() => data?.pages?.flatMap((page) => page.data) ?? [], [data]);
    const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
    const totalFetched = flatData.length;

    const fetchMoreOnBottomReached = React.useCallback(
        (containerRefElement?: HTMLDivElement | null) => {
            if (containerRefElement) {
                const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
                if (
                    scrollHeight - scrollTop - clientHeight < 300 &&
                    !isFetching &&
                    totalFetched < totalDBRowCount
                ) {
                    fetchNextPage();
                }
            }
        },
        [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
    );

    React.useEffect(() => {
        fetchMoreOnBottomReached(tableContainerRef.current);
    }, [fetchMoreOnBottomReached]);

    const table = useReactTable({
        data: flatData,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        debugTable: true,
    });

    const { rows } = table.getRowModel();
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
    //Virtualizing is optional, but might be necessary if we are going to potentially have hundreds or thousands of rows
    const rowVirtualizer = useVirtual({
        parentRef: tableContainerRef,
        size: rows.length,
        overscan: 10,
    });
    const { virtualItems: virtualRows, totalSize } = rowVirtualizer;

    if (isLoading) {
        return <>Loading...</>;
    }
    return (
        <StyledTableView
            onScroll={(e) => fetchMoreOnBottomReached(e.target as HTMLDivElement)}
            ref={tableContainerRef}
        >
            {/* {console.log("Render TableContainer: ", tableData)} */}
            {console.log("Render TableContainer")}
            {tableData[activeDataFrame] && (
                <DataTable sx={{ minWidth: 650 }} size="small" stickyHeader>
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
                        {virtualRows.map((virtualRow, index) =>
                            _createRow(
                                tableData[activeDataFrame]?.column_names,
                                tableData[activeDataFrame]?.index.data[index],
                                tableData[activeDataFrame]?.rows[index]
                            )
                        )}
                    </TableBody>
                </DataTable>
            )}
        </StyledTableView>
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
