import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { DFSelector, DFDataStatisticForm, DFDataStatistic } from "../../StyledComponents";
import { DataFrameConfigOption } from "../../../interfaces/IApp";
import store from "../../../../redux/store";
import { setProjectConfig } from "../../../../redux/reducers/ProjectManagerRedux";

const DataStatistic = () => {
    const dispatch = useDispatch();

    const getDataStatistic = () => {
        const dataFrameConfig = store.getState().projectManager.configs.dataframe;
        let result: Array<String> = [];
        Object.entries(dataFrameConfig).forEach(([key, value]) => {
            if (value == true) {
                result.push(key);
            }
        });
        return result;
    };
    const [dataStatistics, setDataStatistics] = React.useState<string[]>(getDataStatistic());

    // use canUpdateDataStats to prevent to trigger update project config in redux in loading
    const [canUpdateDataStats, setCanUpdateDataStats] = React.useState<boolean>(false);

    const options = [
        { name: "Show histogram plot", value: DataFrameConfigOption.show_histogram_plot },
        { name: "Show quantile plot", value: DataFrameConfigOption.show_quantile_plot },
    ];

    const handleSelectChecbox = (event: SelectChangeEvent<typeof dataStatistics>) => {
        const {
            target: { value },
        } = event;
        setDataStatistics(value);
        setCanUpdateDataStats(true);
    };

    useEffect(() => {
        if (canUpdateDataStats) {
            let configs = store.getState().projectManager.configs;
            let newDataFrameConfig = { ...configs.dataframe };
            for (let config in newDataFrameConfig) {
                if (dataStatistics.includes(config)) {
                    newDataFrameConfig[config] = true;
                } else {
                    newDataFrameConfig[config] = false;
                }
            }
            dispatch(setProjectConfig({ dataframe: newDataFrameConfig }));
        }
    }, [dataStatistics, canUpdateDataStats]);

    return (
        <DFDataStatistic>
            <DFDataStatisticForm>
                <DFSelector
                    multiple
                    displayEmpty
                    value={dataStatistics}
                    onChange={handleSelectChecbox}
                    SelectDisplayProps={{
                        style: { padding: "0px 10px", lineHeight: "35px" },
                    }}
                    renderValue={(selected) => {
                        if (selected.length === 0) {
                            return <em>Data Statistics</em>;
                        }
                        return selected.join(", ");
                    }}
                >
                    {options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            <Checkbox checked={dataStatistics.indexOf(option.value) > -1} />
                            <ListItemText primary={option.name} />
                        </MenuItem>
                    ))}
                </DFSelector>
            </DFDataStatisticForm>
        </DFDataStatistic>
    );
};

export default DataStatistic;
