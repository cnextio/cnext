import React, { useEffect, useState, Fragment } from "react";
import {
    DataPanelToolbarBtn,
    PanelDivider,
    DataToolbar,
} from "../../StyledComponents";
import DFExplorer from "./DFExplorer";
import DFFilter from "./DFFilter";
import DataStatistic from "./DataStatistic";
import GridView, { GridViewStatus } from "./GridView";
import DataView from "./DataView";
import GridOnIcon from "@mui/icons-material/GridOn";
import SummarizeIcon from "@mui/icons-material/Summarize";

const DataPanel = (props: any) => {
    const [gridViewStatus, setGridViewStatus] = useState<GridViewStatus>(GridViewStatus.NONE);

    const handleGridViewBtn = () => {
        gridViewStatus == GridViewStatus.SELECTED
            ? setGridViewStatus(GridViewStatus.UNSELECTED)
            : setGridViewStatus(GridViewStatus.SELECTED);
    };
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
            <DataStatistic />
            <DataView gridViewStatus={gridViewStatus} setGridViewStatus={setGridViewStatus} />
        </Fragment>
    );
};

export default DataPanel;
