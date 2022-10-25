import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { SmallArrowIcon } from "../../StyledComponents";
import {
    ColumnVisibleForm,
    ColumnVisible,
    ColumnVisibleSelector,
    ColumnVisibleMenuItem,
    ColumnVisibleParentCheckbox,
} from "./styles";
import { RootState } from "../../../../redux/store";
import { FormControlLabel, OutlinedInput } from "@mui/material";
import { setColumnSelection } from "../../../../redux/reducers/DataFramesRedux";

const ColumnSelector = () => {
    const dispatch = useDispatch();
    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);
    const columnSelector = useSelector((state: RootState) =>
        activeDataFrame ? state.dataFrames.columnSelector[activeDataFrame] : null
    );
    const metadata = useSelector((state: RootState) => state.dataFrames.metadata);

    useEffect(() => {
        if (activeDataFrame && columnSelector && Object.keys(columnSelector.columns).length == 0) {
            const columnNames = Object.keys(metadata[activeDataFrame]?.columns); 
            let col: { [key: string]: boolean } = {};
            for (let element of columnNames) {
                col[element] = true;
            }

            dispatch(setColumnSelection({ df_id: activeDataFrame, selections: col }));
        }
    }, [columnSelector]);

    const handleSelectChildrenChecbox = (event: SelectChangeEvent) => {
        if (columnSelector) {
            const {
                target: { value },
            } = event;
            console.log("DataStats: ", value);
            let col = { ...columnSelector.columns };
            col[value[0]] = !col[value[0]];
            dispatch(setColumnSelection({ df_id: activeDataFrame, selections: col }));
        }
    };

    const handleSelectParentChecbox = (event: SelectChangeEvent) => {
        if (columnSelector) {
            let col = { ...columnSelector.columns };
            let selectedColumnLen = Object.values(columnSelector.columns).filter((value) => {
                return value;
            }).length;
            if (selectedColumnLen > 0) {
                for (const key in col) {
                    col[key] = false;
                }
            } else {
                for (const key in col) {
                    col[key] = true;
                }
            }
            dispatch(setColumnSelection({ df_id: activeDataFrame, selections: col }));
        }
    };

    const renderComponent = () => {
        if (columnSelector) {
            let selectedColumnLen = Object.values(columnSelector.columns).filter((value) => {
                return value;
            }).length;
            let allColumnLen = Object.values(columnSelector.columns).length;
            return (
                <ColumnVisible>
                    <FormControlLabel
                        control={
                            <ColumnVisibleParentCheckbox
                                checked={selectedColumnLen > 0 && selectedColumnLen == allColumnLen}
                                indeterminate={
                                    selectedColumnLen > 0 && selectedColumnLen != allColumnLen
                                }
                                onChange={handleSelectParentChecbox}
                                size="small"
                            />
                        }
                        label=""
                        sx={{ marginRight: "-10px", marginTop: "-12px", paddingLeft: "10px" }}
                    />
                    <ColumnVisibleForm size="small">
                        <ColumnVisibleSelector
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
                                return <span>Columns</span>;
                            }}
                            input={<OutlinedInput />}
                        >
                            {/* <MenuList dense> */}
                            {Object.entries(columnSelector.columns).map(([key, value]) => (
                                <ColumnVisibleMenuItem value={key}>
                                    <Checkbox checked={value} size="small" />
                                    {key}
                                </ColumnVisibleMenuItem>
                            ))}
                            {/* </MenuList> */}
                        </ColumnVisibleSelector>
                    </ColumnVisibleForm>
                </ColumnVisible>
            );
        } else return null;
    };

    return renderComponent();
};

export default ColumnSelector;
