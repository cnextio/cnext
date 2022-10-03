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
import { FormControlLabel, OutlinedInput } from "@mui/material";
import CypressIds from "../../tests/CypressIds";
import { setUDFsConfig } from "../../../../redux/reducers/DataFramesRedux";

const UDFSelector = () => {
    const dispatch = useDispatch();
    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);
    // const statConfig: Object = useSelector((state: RootState) => state.dataFrames.stats);
    const udfsConfig = useSelector((state: RootState) =>
        activeDataFrame ? state.dataFrames.udfsConfig[activeDataFrame] : null
    );

    const handleSelectChildrenChecbox = (event: SelectChangeEvent) => {
        if (udfsConfig) {
            const {
                target: { value },
            } = event;
            // console.log("DataStats: ", value);
            // let udfsConfig = store.getState().dataFrames.udfsConfig;
            let newUDFConfig = { ...udfsConfig };
            newUDFConfig[value[0]] = !newUDFConfig[value[0]];
            dispatch(setUDFsConfig({ df_id: activeDataFrame, config: newUDFConfig }));
        }
    };

    const handleSelectParentChecbox = (event: SelectChangeEvent) => {
        if (udfsConfig) {
            // let udfConfig = store.getState().dataFrames.udfsConfig;
            let newUDFConfig = { ...udfsConfig };
            let selectedStatsLen = Object.values(udfsConfig).filter((value) => {
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
            dispatch(setUDFsConfig({ df_id: activeDataFrame, config: newUDFConfig }));
        }
    };

    const renderComponent = () => {
        if (udfsConfig) {
            let selectedStatsLen = Object.values(udfsConfig).filter((value) => {
                return value;
            }).length;
            let allStatsLen = Object.values(udfsConfig).length;
            return (
                <DFStats>
                    <FormControlLabel
                        control={
                            <DFStatsParentCheckbox
                                checked={selectedStatsLen == allStatsLen}
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
                            {Object.entries(udfsConfig).map(([key, value]) => (
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
    };

    return renderComponent();
};

export default UDFSelector;
