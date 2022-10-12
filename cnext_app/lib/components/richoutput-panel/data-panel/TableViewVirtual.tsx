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

const fetchSize = 5;

function TableViewVirtual() {
    const tableData = useSelector((state: RootState) => state.dataFrames.tableData);

    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);

    const dfReview: IDFUpdatesReview = useSelector((state: RootState) => getReviewRequest(state));

    function getReviewRequest(state: RootState): IDFUpdatesReview {
        return ifElse(state.dataFrames.dfUpdatesReview, activeDataFrame, null);
    }
    const rerender = React.useReducer(() => ({}), {})[1];
    console.log("tableData", tableData);
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

    //we need a reference to the scrolling element for logic down below
    const tableContainerRef = React.useRef<HTMLDivElement>(null);

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const columns = React.useMemo<ColumnDef<any>[]>(
        () =>
            tableData[activeDataFrame]?.column_names.map((item: any, index: any) => {
                return { accessorKey: `${index}` };
            }),
        []
    );
    console.log("columns columns", columns);

    //react-query has an useInfiniteQuery hook just for this situation!
    const a = [
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
        [
            "1",
            "60",
            "RL",
            "65.0",
            "8450",
            "Pave",
            "nan",
            "Reg",
            "Lvl",
            "AllPub",
            "Inside",
            "Gtl",
            "CollgCr",
            "Norm",
            "Norm",
            "1Fam",
            "2Story",
            "7",
            "5",
            "2003",
        ],
    ];

    let b = tableData[activeDataFrame]?.rows.map((item: any) => Object.assign({}, item));
    const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery<PersonApiResponse>(
        ["table-data", sorting], //adding sorting state as key causes table to reset and fetch from new beginning upon sort
        async ({ pageParam = 0 }) => {
            const start = pageParam * fetchSize;
            const fetchedData = fetchData(b, start, fetchSize, sorting); //pretend api call
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

    //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
    const fetchMoreOnBottomReached = React.useCallback(
        (containerRefElement?: HTMLDivElement | null) => {
            if (containerRefElement) {
                const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
                //once the user has scrolled within 300px of the bottom of the table, fetch more data if there is any
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

    //a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
    React.useEffect(() => {
        fetchMoreOnBottomReached(tableContainerRef.current);
    }, [fetchMoreOnBottomReached]);
    console.log("flatData", flatData);

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
    const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
    const paddingBottom =
        virtualRows.length > 0 ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0) : 0;

    if (isLoading) {
        return <>Loading...</>;
    }

    return (
        <div className="p-2">
            <div className="h-2" />
            <div
                className="container"
                onScroll={(e) => fetchMoreOnBottomReached(e.target as HTMLDivElement)}
                ref={tableContainerRef}
            >
                <table>
                    {tableData[activeDataFrame]?.column_names.map(
                        (dfColName: string, index: number) =>
                            createCell(dfColName, 0, dfColName, true)
                    )}
                    {/* {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <th
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                style={{ width: header.getSize() }}
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        {...{
                                                            className: header.column.getCanSort()
                                                                ? "cursor-pointer select-none"
                                                                : "",
                                                            onClick:
                                                                header.column.getToggleSortingHandler(),
                                                        }}
                                                    >
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                        {{
                                                            asc: " 🔼",
                                                            desc: " 🔽",
                                                        }[header.column.getIsSorted() as string] ??
                                                            null}
                                                    </div>
                                                )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            ))} */}
                    <tbody>
                        {paddingTop > 0 && (
                            <tr>
                                <td style={{ height: `${paddingTop}px` }} />
                            </tr>
                        )}
                        {virtualRows.map((virtualRow) => {
                            const row = rows[virtualRow.index] as Row<Person>;
                            return (
                                <tr key={row.id}>
                                    {console.log("row=>>>", row)}
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <td key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                        {paddingBottom > 0 && (
                            <tr>
                                <td style={{ height: `${paddingBottom}px` }} />
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TableViewVirtual;
export const fetchData = (data:any,start: number, size: number, sorting: SortingState) => {
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
