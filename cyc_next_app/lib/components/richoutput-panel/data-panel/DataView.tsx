import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import GridView from "./GridView";
import TableView from "./TableView";
import { DFViewMode } from "../../../interfaces/IApp";
import SummaryView from "../summary-panel/SummaryView";

const DataView = () => {
    const tableData = useSelector((state: RootState) => state.dataFrames.tableData);

    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);

    const dataViewMode = useSelector((state: RootState) => state.dataFrames.dataViewMode);

    const renderData = () => {
        switch (dataViewMode) {
            case DFViewMode.GRID_VIEW:
                return <GridView />;
            case DFViewMode.TABLE_VIEW:
                return <TableView />;
            case DFViewMode.SUMMARY_VIEW:
                return <SummaryView />;
            default:
                return null;
        }
    };
    //TODO: move all grid view related thing to under DataView
    return <Fragment>{tableData[activeDataFrame] != null && renderData()}</Fragment>;
};

export default DataView;
