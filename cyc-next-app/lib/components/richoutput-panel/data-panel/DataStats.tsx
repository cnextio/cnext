import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { DFSelector, DFStatsForm, DFStats } from "../../StyledComponents";
import { DataFrameConfigOption } from "../../../interfaces/IApp";
import store, { RootState } from "../../../../redux/store";
import { setProjectConfig } from "../../../../redux/reducers/ProjectManagerRedux";

const DataStats = () => {
    const dispatch = useDispatch();

    const getDataStats = (state: RootState) => {
        const dataFrameConfig = state.projectManager?.configs?.dataframe_manager;
        let result: Array<String> = [];
        Object.entries(dataFrameConfig).forEach(([key, value]) => {
            if (value == true) {
                result.push(key);
            }
        });
        return result;
    };
    // const [dataStatistics, setDataStatistics] = React.useState<string[]>(getDataStatistic());
    const dataStats = useSelector((state: RootState) => getDataStats(state));
    
    // use canUpdateDataStats to prevent to trigger update project config in redux in loading
    const [canUpdateDataStats, setCanUpdateDataStats] = React.useState<boolean>(false);

    const options = [
        { name: "Histogram", value: DataFrameConfigOption.histogram },
        { name: "Quantile", value: DataFrameConfigOption.quantile },
    ];

    const handleSelectChecbox = (event: SelectChangeEvent<typeof dataStats>) => {
        const {
            target: { value },
        } = event;
        setDataStatistics(value);
        setCanUpdateDataStats(true);
    };

    useEffect(() => {
        if (canUpdateDataStats) {
            let configs = store.getState().projectManager.configs;
            let newDataFrameConfig = { ...configs.dataframe_manager };
            for (let config in newDataFrameConfig) {
                if (dataStats.includes(config)) {
                    newDataFrameConfig[config] = true;
                } else {
                    newDataFrameConfig[config] = false;
                }
            }
            dispatch(setProjectConfig({ dataframe: newDataFrameConfig }));
        }
    }, [dataStats, canUpdateDataStats]);

    return (
        <DFStats>
            <DFStatsForm>
                <DFSelector
                    multiple
                    displayEmpty
                    value={dataStats}
                    onChange={handleSelectChecbox}
                    SelectDisplayProps={{
                        style: { padding: "0px 10px", lineHeight: "35px" },
                    }}
                    renderValue={(selected) => {
                        if (selected.length === 0) {
                            return <em>Data Stats</em>;
                        }
                        return selected.join(", ");
                    }}
                >
                    {options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            <Checkbox checked={dataStats.indexOf(option.value) > -1} />
                            <ListItemText primary={option.name} />
                        </MenuItem>
                    ))}
                </DFSelector>
            </DFStatsForm>
        </DFStats>
    );
};

export default DataStats;
