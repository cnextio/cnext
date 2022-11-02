import { MenuItem, Select } from "@mui/material";
import React from "react";

export const InputSelection = ({ input, options, handleChange }) => {

    const handleChangeInternal = (event) => {
        // console.log("InputText ", event);
        const value = event.target.value;
        const index = options?.indexOf(value);
        handleChange(index);
    };

    return (
        <Select
            defaultValue={options?options[input]:null}
            onChange={handleChangeInternal}
            sx={{ fontSize: "12px", width: "100%", height: "30px" }}
        >
            {options?.map((item: string, index: number) => {
                // console.log("Selection ", item, index);
                return (
                    <MenuItem value={item} key={index} sx={{ fontSize: "12px" }}>
                        {item}
                    </MenuItem>
                );
            })}
        </Select>
    );
}

export default InputSelection;
