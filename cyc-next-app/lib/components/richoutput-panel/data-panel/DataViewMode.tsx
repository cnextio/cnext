import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { SelectChangeEvent } from "@mui/material/Select";
import {
    DFStatsForm as DFViewModeForm,
    DFStats as DFViewMode,
    DFStatsSelector as DFViewModeSelector,
    DFViewModeSmallArrowIcon,
    DFViewModeMenuItem,
} from "../../StyledComponents";
import store, { RootState } from "../../../../redux/store";
import { setDataViewMode } from "../../../../redux/reducers/DataFramesRedux";
import { OutlinedInput } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { DFViewMode as DFViewModeOptions } from "../../../interfaces/IApp";
import CypressIds from "../../tests/CypressIds";

const DataViewMode = () => {
    const dispatch = useDispatch();
    const viewMode: string = useSelector((state: RootState) => state.dataFrames.dataViewMode);

    const handleChange = (event: SelectChangeEvent) => {
        dispatch(setDataViewMode(event.target.value));
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
        const classes = useOutlinedInputStyles();
        return (
            <DFViewMode>
                <DFViewModeForm size='small'>
                    <DFViewModeSelector
                        displayEmpty
                        value={viewMode}
                        onChange={handleChange}
                        SelectDisplayProps={{
                            style: {
                                padding: "0px 5px",
                                lineHeight: "20px",
                            },
                        }}
                        IconComponent={DFViewModeSmallArrowIcon}
                        data-cy={CypressIds.dfViewMode}
                        input={<OutlinedInput classes={classes} />}
                    >
                        {/* <MenuList dense> */}
                        {Object.values(DFViewModeOptions).map((vm) => (
                            <DFViewModeMenuItem value={vm}>{vm}</DFViewModeMenuItem>
                        ))}
                        {/* </MenuList> */}
                    </DFViewModeSelector>
                </DFViewModeForm>
            </DFViewMode>
        );
    };

    return renderComponent();
};

export default DataViewMode;
