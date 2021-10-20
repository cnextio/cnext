// import ChipInput from "../../../lib/material-ui-chip-input";
import React, {useState} from "react";
// import {COMMON_FOLDER_TITLE} from "../../../lib/database";
import Box from "@material-ui/core/Box";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    container: {
        padding: 0,
        alignItems: 'center'
    },
}));

function FolderTitle({ folder, onChange, withLabel }) {
    const classes = useStyles();
    const handleOnChange = (chips) => {
        if (chips.length>0){
           onChange(chips);
        }
    }

    const chipInput = <ChipInput
            label={withLabel ? "Folder" : null}
            // defaultValue = {defaultValue}
            clickable={"true"}
            onChange={handleOnChange}
            disableUnderline={true}
            useDefaultForEmpty={true}
            className={classes}
            value = {folder}
        />;
    return chipInput;
}

export function FolderTitleContainer({folder, handleFolderChange}) {
    const classes = useStyles();
    // const [folders, setFolders] = useState([COMMON_FOLDER_TITLE]);
    // const onFolderChange = (folders) => {
    //     setFolders(folders);
    // }

    return (
        <Box className={classes.container} display='flex' pb={0}>
            <FolderTitle folder={folder} onChange={handleFolderChange} withLabel/>
        </Box>
    );
}

export default FolderTitle