import { Typography } from "@mui/material";
import React, { Fragment } from "react";

// redux
import { useDispatch, useSelector } from "react-redux";
import { setActiveDF } from "../../../../redux/reducers/DataFramesRedux";
import store, { RootState } from "../../../../redux/store";
import {
    DFSelector,
    DFSelectorForm,
    SmallArrowIcon,
    DFSelectorMenuItem,
} from "../../StyledComponents";
// import { CountNAContainer } from "./StyledComponents";

const DFExplorer = () => {
    // const dataFrameList = useSelector((state: RootState) => getDataFrameList(state));
    const dispatch = useDispatch();

    function handleChange({ target }) {
        // console.log('Handle change: ', target);
        dispatch(setActiveDF(target.value));
    }

    const renderDFExplorer = () => {
        const state = store.getState();
        const dataFrameList = Object.keys(state.dataFrames?.metadata);
        const activeDataFrame = state.dataFrames?.activeDataFrame;

        return (
            <DFSelectorForm>
                {console.log("DFExplorer render ", dataFrameList)}
                <DFSelector
                    onChange={handleChange}
                    value={dataFrameList != null && activeDataFrame != null ? activeDataFrame : ""}
                    // label={dfList.activeDF}
                    IconComponent={SmallArrowIcon}
                    SelectDisplayProps={{
                        style: { padding: "0px 10px", lineHeight: "35px" },
                    }}
                    // displayEmpty = {true}
                    renderValue={() => {
                        return (
                            <Fragment>
                                {dataFrameList ? (
                                    <Typography height="100%" variant="caption" fontSize="14px">
                                        {activeDataFrame}
                                    </Typography>
                                ) : (
                                    <Typography
                                        height="100%"
                                        variant="caption"
                                        fontSize="12px"
                                        color="#BFC7CF"
                                    >
                                        Data Frame
                                    </Typography>
                                )}
                            </Fragment>
                        );
                    }}
                >
                    {dataFrameList &&
                        dataFrameList.map((item, index) => (
                            <DFSelectorMenuItem value={item} key={index}>
                                {item}
                            </DFSelectorMenuItem>
                        ))}
                </DFSelector>
            </DFSelectorForm>
        );
    };

    return renderDFExplorer();
};

export default DFExplorer;
