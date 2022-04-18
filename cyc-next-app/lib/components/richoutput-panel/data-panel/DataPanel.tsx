import React, { Fragment } from "react";
import { DataToolbar } from "../../StyledComponents";
import DFExplorer from "./DFExplorer";
import DFFilter from "./DFFilter";
import DataStats from "./DataStats";
import DataViewMode from "./DataViewMode";
import DataView from "./DataView";
import { RootState } from "../../../../redux/store";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";

const DataPanel = (props: any) => {
    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);
    //TODO: move all grid view related thing to under DataView
    return (
        <Fragment>
            <DataToolbar>
                <DFExplorer />
                <DFFilter />
            </DataToolbar>
            {activeDataFrame != null && (
                <Box
                    sx={{ display: "inline-flex", justifyContent: "flex-start" }}
                    style={{ width: "100%" }}
                >
                    <DataStats />
                    <DataViewMode />
                </Box>
            )}
            <DataView />
        </Fragment>
    );
};

export default DataPanel;
