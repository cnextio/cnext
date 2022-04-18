import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import {
    DFStatsForm,
    DFStats,
    DFStatsSelector,
    SmallArrowIcon,
    DFStatsMenuItem,
    DFStatsParentCheckbox,
} from "../../StyledComponents";
import store, { RootState } from "../../../../redux/store";
import { setStatsConfig } from "../../../../redux/reducers/DataFramesRedux";
import { FormControlLabel, OutlinedInput } from "@mui/material";
import { makeStyles } from "@mui/styles";
import CypressIds from "../../tests/CypressIds";

const DataStats = () => {
    const dispatch = useDispatch();

    const statConfig: Object = useSelector((state: RootState) => state.dataFrames.stats);

    const handleSelectChildrenChecbox = (event: SelectChangeEvent) => {
        const {
            target: { value },
        } = event;
        // console.log("DataStats: ", value);
        let statConfig = store.getState().dataFrames.stats;
        let newDataFrameConfig = { ...statConfig };
        newDataFrameConfig[value[0]] = !newDataFrameConfig[value[0]];
        dispatch(setStatsConfig(newDataFrameConfig));
    };

    const handleSelectParentChecbox = (event: SelectChangeEvent) => {
        console.log("DataStats: ", event);
        let statConfig = store.getState().dataFrames.stats;
        let newDataFrameConfig = { ...statConfig };
        let selectedStatsLen = Object.values(statConfig).filter((value) => {
            return value;
        }).length;
        if (selectedStatsLen > 0) {
            for (const key in newDataFrameConfig) {
                newDataFrameConfig[key] = false;
            }
        } else {
            for (const key in newDataFrameConfig) {
                newDataFrameConfig[key] = true;
            }
        }
        dispatch(setStatsConfig(newDataFrameConfig));
    };

    /** I could not find a way to make this works with styledcomponent so use makestyle instead */
    const useOutlinedInputStyles = makeStyles(() => ({
        root: {
            fontSize: "13px",
            "& $notchedOutline": {
                borderColor: "white",
            },
            "&:hover $notchedOutline": {
                borderColor: "white",
            },
            "&$focused $notchedOutline": {
                borderColor: "white",
            },
        },
        focused: {},
        notchedOutline: {},
    }));

    const renderComponent = () => {
        let selectedStatsLen = Object.values(statConfig).filter((value) => {
            return value;
        }).length;
        let allStatsLen = Object.values(statConfig).length;
        const classes = useOutlinedInputStyles();
        return (
            <DFStats>
                <FormControlLabel
                    control={
                        <DFStatsParentCheckbox
                            checked={selectedStatsLen == allStatsLen}
                            indeterminate={selectedStatsLen > 0 && selectedStatsLen != allStatsLen}
                            onChange={handleSelectParentChecbox}
                            size='small'
                            data-cy={CypressIds.dfStatsCheckboxAll}
                        />
                    }
                    label=''
                    sx={{ marginRight: "-10px", marginTop: "-12px", paddingLeft: "10px" }}
                />
                <DFStatsForm size='small'>
                    <DFStatsSelector
                        multiple
                        displayEmpty
                        value={[]}
                        onChange={handleSelectChildrenChecbox}
                        SelectDisplayProps={{
                            style: {
                                padding: "0px 5px",
                                lineHeight: "20px",
                            },
                        }}
                        IconComponent={SmallArrowIcon}
                        renderValue={() => {
                            return <span>AutoStats</span>;
                        }}
                        input={<OutlinedInput classes={classes} />}
                    >
                        {/* <MenuList dense> */}
                        {Object.entries(statConfig).map(([key, value]) => (
                            <DFStatsMenuItem value={key}>
                                <Checkbox checked={value} size='small' />
                                {key}
                            </DFStatsMenuItem>
                        ))}
                        {/* </MenuList> */}
                    </DFStatsSelector>
                </DFStatsForm>
            </DFStats>
        );
    };

    return renderComponent();
};

export default DataStats;
