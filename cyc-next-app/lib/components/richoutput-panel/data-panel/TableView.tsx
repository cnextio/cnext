import {
  TableBody,
} from "@mui/material";
import React, {  
  Fragment,
} from "react";
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
  TableContainer,
  DataTableHeadText,
} from "../../StyledComponents";
import { IDFUpdatesReview, ReviewType } from "../../../interfaces/IApp";
import ColumnHistogram from "./ColumnHistogram";
import { useSelector } from "react-redux";
import { ifElse, ifElseDict } from "../../libs";
import CountNA from "./CountNA";


const RichOutputView = (props: any) => {
  const tableData = useSelector((state) => state.dataFrames.tableData);
  
  const activeDataFrame = useSelector(
    (state) => state.dataFrames.activeDataFrame
  );
  const dfReview: IDFUpdatesReview = useSelector((state) =>
    _getReviewRequest(state)
  );
  
  function _getReviewRequest(state): IDFUpdatesReview {
    return ifElse(state.dataFrames.dfUpdatesReview, activeDataFrame, null);
  }

  const _createCell = (
    dfColName: string,
    dfRowIndex: number,
    item: any,
    head: boolean = false,
    indexCell: boolean = false
  ) => {
    let review: boolean = false;
    if (dfReview) {
      if (dfReview.type == ReviewType.col) {
        review = dfReview.name == dfColName;
      } else if (dfReview.type == ReviewType.row) {
        review = dfReview.name == dfRowIndex;
      } else if (dfReview.type == ReviewType.cell) {
        // console.log(dfReview.name);
        let name = dfReview.name as [string, number];
        review = name[0] == dfColName && name[1] == dfRowIndex;
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
            {dfRowIndex}
            {dfReview && dfReview.type == ReviewType.row && review && (
              <ScrollIntoViewIfNeeded
                options={{ active: true, block: "nearest", inline: "center" }}
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
            <div>{item}</div>
            {head ? (
              <ColumnHistogram
                df_id={activeDataFrame}
                col_name={dfColName}
                smallLayout={true}
              />
            ) : null}
            {head ? (
              <CountNA df_id={activeDataFrame} col_name={dfColName} />
            ) : null}
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
        {_createCell(null, rowIndex, null, false, true)}
        {rowData.map((item: any, index: number) =>
          _createCell(colNames[index], rowIndex, item)
        )}
      </DataTableRow>
    );
  };


  return (
    <TableContainer>
      {/* {console.log("Render TableContainer: ", tableData)} */}
      {console.log("Render TableContainer")}
      <DataTable sx={{ minWidth: 650 }} size="small" stickyHeader>
        {/* {console.log(tableData)} */}
        <DataTableHead>
          <DataTableHeadRow>
            <DataTableHeadCell>
              <DataTableHeadText>
                {tableData[activeDataFrame].index.name}
              </DataTableHeadText>
            </DataTableHeadCell>
            {tableData[activeDataFrame].column_names.map(
              (dfColName: string, index: number) =>
                _createCell(dfColName, 0, dfColName, true)
            )}
          </DataTableHeadRow>
        </DataTableHead>
        <TableBody>
          {tableData[activeDataFrame].rows.map(
            (rowData: any[], index: number) =>
              _createRow(
                tableData[activeDataFrame].column_names,
                tableData[activeDataFrame].index.data[index],
                rowData
              )
          )}
        </TableBody>
      </DataTable>
    </TableContainer>
  );
};

export default RichOutputView;
