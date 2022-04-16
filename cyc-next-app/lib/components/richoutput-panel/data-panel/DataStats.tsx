import React from "react";
import { useDispatch, useSelector } from "react-redux";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { DFSelector, DFStatsForm, DFStats } from "../../StyledComponents";
import store, { RootState } from "../../../../redux/store";
import { setStatsConfig } from "../../../../redux/reducers/DataFramesRedux";

const DataStats = () => {
    const dispatch = useDispatch();

    const dataStat: Object = useSelector((state: RootState) => state.dataFrames.stats);
    let selected: string[] = [];

    const handleSelectChecbox = (event: SelectChangeEvent) => {
        const {
            target: { value },
        } = event;
        let configs = store.getState().dataFrames.stats;
        let newDataFrameConfig = { ...configs };
        newDataFrameConfig[value[0]] = !newDataFrameConfig[value[0]];
        dispatch(setStatsConfig(newDataFrameConfig));
    };

    return (
        <DFStats>
            <DFStatsForm>
                <DFSelector
                    multiple
                    displayEmpty
                    value={selected}
                    onChange={handleSelectChecbox}
                    SelectDisplayProps={{
                        style: { padding: "0px 10px", lineHeight: "35px" },
                    }}
                    renderValue={() => {
                        return <span>Stats</span>;
                    }}
                >
                    {Object.entries(dataStat).map(([key, value]) => (
                        <MenuItem key={key} value={key}>
                            <Checkbox checked={Number(value) == 1} />
                            <ListItemText primary={key} />
                        </MenuItem>
                    ))}
                </DFSelector>
            </DFStatsForm>
        </DFStats>
    );
};

export default DataStats;
