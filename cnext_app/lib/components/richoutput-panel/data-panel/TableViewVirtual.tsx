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
import { SpecialMimeType, IDFUpdatesReview, ReviewType } from "../../../interfaces/IApp";
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
import { ICellDataURLImage, UDFLocation } from "../../../interfaces/IDataFrameManager";
import UDFContainer from "./UDFContainer";
import InputComponent from "./InputComponent";

const fetchSize = 5;

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
        index: string,
        item: {},
        colName: string,
        type: SpecialMimeType
    ) => {
        console.log("Render image: ", item, type);
        if ([SpecialMimeType.FILE_PNG, SpecialMimeType.URL_PNG].includes(type)) {
            return (
                <ImageMimeCell
                    src={"data:image/png;base64," + (item as ICellDataURLImage).binary}
                />
            );
        } else if ([SpecialMimeType.FILE_JPG, SpecialMimeType.URL_JPG].includes(type)) {
            return (
                <ImageMimeCell
                    src={"data:image/jpg;base64," + (item as ICellDataURLImage).binary}
                />
            );
        } else if (
            [
                SpecialMimeType.INPUT_SELECTION,
                SpecialMimeType.INPUT_CHECKBOX,
                SpecialMimeType.INPUT_TEXT,
            ].includes(type)
        ) {
            return (
                <InputComponent
                    df_id={activeDataFrame}
                    rowNumber={rowNumber}
                    colName={colName}
                    index={index}
                    item={item}
                    type={type}
                />
            );
        }
    };

    const renderBodyInnerCell = (
        rowNumber: number,
        index: string,
        item: string | {},
        metadata: {},
        colName: string | number,
        dfReview: {},
        review: {}
    ) => {
        return (
            <DataTableCell key={shortid.generate()} align="right" review={review} head={false}>
                {metadata &&
                metadata.columns[colName] &&
                Object.values(SpecialMimeType).includes(metadata.columns[colName].type)
                    ? // <ImageMimeCell src={"data:image/png;base64," + item.binary} />
                      renderSpecialMimeInnerCell(
                          rowNumber,
                          index,
                          item,
                          colName,
                          metadata.columns[colName].type
                      )
                    : item}
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
        rowNumber: number,
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
                        : renderBodyInnerCell(
                              rowNumber,
                              rowIndexData,
                              rowCellData,
                              metadata,
                              colName,
                              dfReview,
                              review
                          )}
                </>
            );
        }
    };

    const renderBodyRow = (
        rowNumber: number,
        colNames: string[],
        rowIndexData: any,
        rowData: any[]
    ) => {
        return (
            <DataTableRow hover key={shortid.generate()}>
                {/** render index cell */}
                {renderBodyCell(rowNumber, rowIndexData, rowIndexData, null, true)}
                {/** render data cell */}
                {rowData.map((rowCellData: any, index: number) =>
                    renderBodyCell(rowNumber, colNames[index], rowIndexData, rowCellData)
                )}
            </DataTableRow>
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
                        {virtualRows.map((virtualRow, rowNumber) =>
                            renderBodyRow(
                                rowNumber,
                                tableData[activeDataFrame]?.column_names,
                                tableData[activeDataFrame]?.index.data[rowNumber],
                                tableData[activeDataFrame]?.rows[rowNumber]
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
