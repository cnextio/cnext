import React, { Fragment, useContext, useEffect } from "react";
import { DataToolbar } from "../../StyledComponents";
import DFExplorer from "./DFExplorer";
import DFFilter from "./DFFilter";
import UDFSelector from "./UDFSelector";
import DataViewMode from "./DataViewMode";
import DataView from "./DataView";
import { RootState } from "../../../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import { setDataPanelFocusSignal } from "../../../../redux/reducers/DataFramesRedux";

const DataPanel = (props: any) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setDataPanelFocusSignal());
    }, []);

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
                    <UDFSelector />
                    <DataViewMode />
                </Box>
            )}
            <DataView />
        </Fragment>
    );
};

export default DataPanel;
