import React, { useCallback } from "react";
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
import { FormControlLabel, OutlinedInput } from "@mui/material";
import CypressIds from "../../tests/CypressIds";
import { setUDFsSelection } from "../../../../redux/reducers/DataFramesRedux";

const UDFSelector = () => {
    const dispatch = useDispatch();
    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);
    const udfsSelector = useSelector((state: RootState) =>
        activeDataFrame ? state.dataFrames.udfsSelector[activeDataFrame] : null
    );

    const handleSelectChildrenChecbox = (event: SelectChangeEvent) => {
        if (udfsSelector) {
            const {
                target: { value },
            } = event;
            // console.log("DataStats: ", value);
            // let udfsConfig = store.getState().dataFrames.udfsConfig;
            let newUDFConfig = { ...udfsSelector.udfs };
            newUDFConfig[value[0]] = !newUDFConfig[value[0]];
            dispatch(setUDFsSelection({ df_id: activeDataFrame, selections: newUDFConfig }));
        }
    };

    const handleSelectParentChecbox = (event: SelectChangeEvent) => {
        if (udfsSelector) {
            // let udfConfig = store.getState().dataFrames.udfsConfig;
            let newUDFConfig = { ...udfsSelector.udfs };
            let selectedStatsLen = Object.values(udfsSelector.udfs).filter((value) => {
                return value;
            }).length;
            if (selectedStatsLen > 0) {
                for (const key in newUDFConfig) {
                    newUDFConfig[key] = false;
                }
            } else {
                for (const key in newUDFConfig) {
                    newUDFConfig[key] = true;
                }
            }
            dispatch(setUDFsSelection({ df_id: activeDataFrame, selections: newUDFConfig }));
        }
    };

    const renderComponent = useCallback(() => {
        if (udfsSelector) {
            let selectedStatsLen = Object.values(udfsSelector.udfs).filter((value) => {
                return value;
            }).length;
            let allStatsLen = Object.values(udfsSelector.udfs).length;
            return (
                <DFStats>
                    <FormControlLabel
                        control={
                            <DFStatsParentCheckbox
                                checked={selectedStatsLen > 0 && selectedStatsLen == allStatsLen}
                                indeterminate={
                                    selectedStatsLen > 0 && selectedStatsLen != allStatsLen
                                }
                                onChange={handleSelectParentChecbox}
                                size="small"
                                data-cy={CypressIds.dfStatsCheckboxAll}
                            />
                        }
                        label=""
                        sx={{ marginRight: "-10px", marginTop: "-12px", paddingLeft: "10px" }}
                    />
                    <DFStatsForm size="small">
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
                            input={<OutlinedInput />}
                        >
                            {/* <MenuList dense> */}
                            {Object.entries(udfsSelector.udfs).map(([key, value]) => (
                                <DFStatsMenuItem value={key}>
                                    <Checkbox checked={value} size="small" />
                                    {key}
                                </DFStatsMenuItem>
                            ))}
                            {/* </MenuList> */}
                        </DFStatsSelector>
                    </DFStatsForm>
                </DFStats>
            );
        } else return null;
    }, [udfsSelector]);

    return renderComponent();
};

export default UDFSelector;
