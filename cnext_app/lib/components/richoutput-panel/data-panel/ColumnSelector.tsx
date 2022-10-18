import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import {
    SmallArrowIcon,    
} from "../../StyledComponents";
import {ColumnVisibleForm,
    ColumnVisible,
    ColumnVisibleSelector,
    ColumnVisibleMenuItem,
    ColumnVisibleParentCheckbox} from "./styles";
import { RootState } from "../../../../redux/store";
import { FormControlLabel, OutlinedInput } from "@mui/material";
import { setColumnSelection } from "../../../../redux/reducers/DataFramesRedux";

const ColumnSelector = () => {
    const dispatch = useDispatch();
    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);
    const columnSelector = useSelector((state: RootState) =>
        activeDataFrame ? state.dataFrames.columnSelector : null
    );
    const tableData = useSelector((state: RootState) => state.dataFrames.tableData);
    const columns = React.useMemo<any>(() => {
        if (activeDataFrame) {
            let col: { [key: string]: boolean } = {};
            for (let i = 0; i < tableData[activeDataFrame]?.column_names.length; i++) {
                const element = tableData[activeDataFrame]?.column_names[i];
                col[element] = true;
            }
            return col;
        } else return {};
    }, [activeDataFrame, tableData]);

    const [columnVisibility, setColumnVisibility] = React.useState<any>(columns);
    const handleSelectChildrenChecbox = (event: SelectChangeEvent) => {
        if (columnVisibility) {
            const {
                target: { value },
            } = event;
            console.log("DataStats: ", value);
            let col = { ...columnVisibility };
            col[value[0]] = !col[value[0]];
            setColumnVisibility(col);
            dispatch(setColumnSelection(col));
        }
    };

    const handleSelectParentChecbox = (event: SelectChangeEvent) => {
        if (columnVisibility) {
            let col = { ...columnVisibility };
            let selectedColumnLen = Object.values(columnVisibility).filter((value) => {
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
            setColumnVisibility(col);
            dispatch(setColumnSelection(col));
        }
    };

    const renderComponent = () => {
        if (columnVisibility) {
            let selectedColumnLen = Object.values(columnVisibility).filter((value) => {
                return value;
            }).length;
            let allColumnLen = Object.values(columnVisibility).length;
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
                                return <span>Column</span>;
                            }}
                            input={<OutlinedInput />}
                        >
                            {/* <MenuList dense> */}
                            {Object.entries(columnVisibility).map(([key, value]) => (
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
