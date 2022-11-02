import { Typography } from "@mui/material";
import React, { useCallback, MouseEventHandler, useState } from "react";
import Moment from "react-moment";

// redux
import { useDispatch, useSelector } from "react-redux";
import { setActiveDF } from "../../../../redux/reducers/DataFramesRedux";
import { RootState } from "../../../../redux/store";
import {
    DFSelector,
    DFSelectorForm,
    SmallArrowIcon,
    DFSelectorMenuItem,
    RunTimeLabel,
} from "../../StyledComponents";
// import { CountNAContainer } from "./StyledComponents";
import { IconButton } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import { useLoadDFMetaData } from "./useLoadDFMetaData";

interface ReloadButtonProps {
    reloadFunc: MouseEventHandler<HTMLButtonElement> | undefined;
}

const ReloadButton = ({ reloadFunc }: ReloadButtonProps) => {
    return (
        <IconButton
            onClick={reloadFunc}
            aria-label="Back"
            size="medium"
            color="default"
            sx={{ padding: "4px", backgroundColor: "white", marginLeft: "5px" }}
        >
            {<ReplayIcon fontSize="small" style={{ width: "16px", height: "16px" }} />}
        </IconButton>
    );
};

const DFExplorer = () => {
    const dfMetaDataList = useSelector((state: RootState) => state.dataFrames?.metadata);
    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);
    const { loadDFMetaData, isLoading } = useLoadDFMetaData();
    const dispatch = useDispatch();

    function handleChange({ target }) {
        // console.log('Handle change: ', target);
        dispatch(setActiveDF(target.value));
    }

    const [mouseOverIndex, setMouseHoverIndex] = useState<number | null>(null);

    const renderDFExplorer = useCallback(() => {
        return (
            <DFSelectorForm id="dataframe-list-form">
                {console.log("DFExplorer render ", dfMetaDataList)}
                <DFSelector
                    id="dataframe-list-selector"
                    onFocus={() => setMouseHoverIndex(null)}
                    onChange={handleChange}
                    value={dfMetaDataList != null && activeDataFrame != null ? activeDataFrame : ""}
                    // label={dfList.activeDF}
                    IconComponent={SmallArrowIcon}
                    SelectDisplayProps={{
                        style: { padding: "0px 10px", lineHeight: "35px" },
                    }}
                    // displayEmpty = {true}
                    renderValue={() => {
                        return (
                            <>
                                {dfMetaDataList ? (
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
                            </>
                        );
                    }}
                >
                    {dfMetaDataList &&
                        Object.keys(dfMetaDataList).map((item, index) => (
                            <DFSelectorMenuItem
                                value={item}
                                key={index}
                                onMouseOver={() => {
                                    setMouseHoverIndex(index);
                                }}
                                onMouseOut={() => {
                                    setMouseHoverIndex(null);
                                }}
                            >
                                <span>{`${item}`}&nbsp;&nbsp;</span>
                                <RunTimeLabel
                                    variant="caption"
                                    sx={{
                                        fontStyle: "italic",
                                        width: "120px",
                                        overflow: "auto",
                                        display: "flex",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <Moment unix fromNow>
                                        {dfMetaDataList[item].timestamp}
                                    </Moment>
                                </RunTimeLabel>
                                {mouseOverIndex === index && (
                                    <ReloadButton reloadFunc={() => loadDFMetaData(item)} />
                                )}
                                {/* {console.log("ReloadButton ", mouseOverIndex, index)} */}
                            </DFSelectorMenuItem>
                        ))}
                </DFSelector>
            </DFSelectorForm>
        );
    }, [dfMetaDataList, activeDataFrame, mouseOverIndex]);

    return renderDFExplorer();
};

export default DFExplorer;
