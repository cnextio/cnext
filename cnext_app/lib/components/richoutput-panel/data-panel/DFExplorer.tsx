import { Typography } from "@mui/material";
import React, { Fragment } from "react";

// redux
import { useDispatch, useSelector } from "react-redux";
import { setActiveDF } from "../../../../redux/reducers/DataFramesRedux";
import { RootState } from "../../../../redux/store";
import {
    DFSelector,
    DFSelectorForm,
    SmallArrowIcon,
    DFSelectorMenuItem,
} from "../../StyledComponents";
// import { CountNAContainer } from "./StyledComponents";

const DFExplorer = () => {
    const dataFrameList = useSelector((state: RootState) => getDataFrameList(state));
    const dispatch = useDispatch();

    function getDataFrameList(state: RootState) {
        let activeDF = state.dataFrames.activeDataFrame;
        return activeDF
            ? {
                  activeDF: activeDF,
                  list: Object.keys(state.dataFrames.tableData),
              }
            : {
                  activeDF: null,
                  list: Object.keys(state.dataFrames.tableData),
              };
    }

    function handleChange({ target }) {
        // console.log('Handle change: ', target);
        dispatch(setActiveDF(target.value));
    }

    return (
        <DFSelectorForm>
            {console.log(dataFrameList)}
            <DFSelector
                onChange={handleChange}
                value={
                    dataFrameList != null && dataFrameList.activeDF != null
                        ? dataFrameList.activeDF
                        : ""
                }
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
                                    {dataFrameList.activeDF}
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
                    dataFrameList.list.map((item, index) => (
                        <DFSelectorMenuItem value={item}>{item}</DFSelectorMenuItem>
                    ))}
            </DFSelector>
        </DFSelectorForm>
    );
};

export default DFExplorer;
