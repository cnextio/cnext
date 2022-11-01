import { Checkbox, FormControlLabel } from "@mui/material";
import React from "react";

export function InputCheckbox({ input, name, handleChange }) {
    
    const handleChangeInternal = (event) => {
        // console.log("InputText ", event);
        handleChange(event.target.checked);
    };

    return (
        <FormControlLabel
            control={
                <Checkbox
                    defaultChecked={input}
                    size="small"
                    sx={{ "& .MuiSvgIcon-root": { width: "18px", height: "18px" } }}
                />
            }
            label={name}
            sx={{ "& .MuiFormControlLabel-label": { fontSize: "12px" } }}
            onChange={handleChangeInternal}
        />
    );
}

export default InputCheckbox;
