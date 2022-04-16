import React, { useState, Fragment } from "react";
import { DataPanelToolbarBtn, DataToolbar } from "../../StyledComponents";
import DFExplorer from "./DFExplorer";
import DFFilter from "./DFFilter";
import DataStats from "./DataStats";
import GridView, { GridViewStatus } from "./GridView";
import DataView from "./DataView";
import GridOnIcon from "@mui/icons-material/GridOn";
import SummarizeIcon from "@mui/icons-material/Summarize";
import { RootState } from "../../../../redux/store";
import { useSelector } from "react-redux";

const DataPanel = (props: any) => {
    const [gridViewStatus, setGridViewStatus] = useState<GridViewStatus>(GridViewStatus.NONE);

    const handleGridViewBtn = () => {
        gridViewStatus == GridViewStatus.SELECTED
            ? setGridViewStatus(GridViewStatus.UNSELECTED)
            : setGridViewStatus(GridViewStatus.SELECTED);
    };

    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);
    //TODO: move all grid view related thing to under DataView
    return (
        <Fragment>
            <DataToolbar>
                <DFExplorer />
                <DFFilter />
                {
                    <Fragment>
                        {/* <DataPanelToolbarBtn
                            selected={gridViewStatus == GridViewStatus.SELECTED}
                            onClick={() => handleGridViewBtn()}
                        >
                            <SummarizeIcon sx={{ fontSize: "20px" }} />
                        </DataPanelToolbarBtn> */}
                        <DataPanelToolbarBtn
                            selected={gridViewStatus == GridViewStatus.SELECTED}
                            onClick={() => handleGridViewBtn()}
                        >
                            <GridOnIcon sx={{ fontSize: "20px" }} />
                        </DataPanelToolbarBtn>
                    </Fragment>
                }
            </DataToolbar>
            {activeDataFrame != null && <DataStats />}
            <DataView gridViewStatus={gridViewStatus} setGridViewStatus={setGridViewStatus} />
        </Fragment>
    );
};

export default DataPanel;
