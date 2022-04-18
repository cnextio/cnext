import React, { useEffect, useState, Fragment } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import GridView, { GridViewStatus } from "./GridView";
import TableView from "./TableView";

const DataView = ({ gridViewStatus, setGridViewStatus }) => {
    const tableData = useSelector(
        (state: RootState) => state.dataFrames.tableData
    );
    
    const activeDataFrame = useSelector(
        (state: RootState) => state.dataFrames.activeDataFrame
    );

    // useEffect(() => {
    //     setGridViewStatus(GridViewStatus.NONE);
    //     if (tableData[activeDataFrame] !== null) {
    //         setGridViewStatus(GridViewStatus.UNSELECTED);
    //     }
    // }, [tableData, activeDataFrame]);

    // const handleGridViewBtn = () => {
    //     gridViewStatus == GridViewStatus.SELECTED
    //         ? setGridViewStatus(GridViewStatus.UNSELECTED)
    //         : setGridViewStatus(GridViewStatus.SELECTED);
    // };
    //TODO: move all grid view related thing to under DataView
    return (
        <Fragment>
            {tableData[activeDataFrame] !== null &&
                (gridViewStatus === GridViewStatus.SELECTED ? (
                    <GridView />
                ) : (
                    <TableView />
                ))}
        </Fragment>
    );
};

export default DataView;
