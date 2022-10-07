import { TextField } from "@mui/material";
import React, { useState } from "react";

export function InputText({ input, handleChange }) {
    const [value, setValue] = useState<string>(input);

    const handleChangeInternal = (event) => {
        setValue(event.target.value);
    };

    const handleKeyDown = (event) => {
        if (event.keyCode === 13 && event.ctrlKey) {
            handleChange(value);
        }
    };
    return (
        <TextField
            variant="outlined"
            multiline
            onChange={handleChangeInternal}
            onKeyDown={handleKeyDown}
            onBlur={() => {
                console.log("InputText onBlur: ", value);
                handleChange(value);
            }}
            sx={{
                width: "100%",
                "& .MuiInputBase-root": { padding: "5px 10px" },
                "& .MuiInputBase-input": { fontSize: "12px" },
            }}
            defaultValue={input}
        />
    );
}

export default InputText;
