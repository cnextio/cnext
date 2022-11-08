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
import ColumnSelector from "./ColumnSelector";

const Shape = () => {
    const activeDataFrame = useSelector((state: RootState) => state.dataFrames?.activeDataFrame);
    const shape = useSelector((state: RootState) =>
        activeDataFrame ? state.dataFrames?.metadata[activeDataFrame]?.shape : null
    );

    return (
        <div style={{fontSize: "13px", marginLeft: "auto", marginTop: "4px", paddingRight: "20px"}}>
            {shape != null && (
                <>
                    Rows: {shape[0]}, Cols: {shape[1]}
                </>
            )}
        </div>
    );
};

const DataPanel = (props: any) => {
    // const dispatch = useDispatch();

    // useEffect(() => {
    //     dispatch(setDataPanelFocusSignal());
    // }, []);

    const activeDataFrame = useSelector((state: RootState) => state.dataFrames?.activeDataFrame);
    //TODO: move all grid view related thing to under DataView
    return (
        <>
            {/* {console.log("DataPanel render activeDataFrame", activeDataFrame)} */}
            <DataToolbar>
                <DFExplorer />
                <DFFilter />
            </DataToolbar>
            {activeDataFrame != null && (
                <>
                    <Box
                        sx={{ display: "inline-flex", justifyContent: "flex-start", width: "100%" }}
                    >
                        <UDFSelector />
                        <DataViewMode />
                        <ColumnSelector />
                        <Shape />
                    </Box>
                    <DataView />
                </>
            )}
        </>
    );
};

export default DataPanel;
