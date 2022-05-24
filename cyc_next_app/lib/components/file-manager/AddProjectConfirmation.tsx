import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    TextField,
} from "@mui/material";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setAddProject } from "../../../redux/reducers/ProjectManagerRedux";

const AddProjectConfirmation = ({ openDialog, confirm }) => {
    const [projectPath, setProjectPath] = useState<string | null>(null);
    const [txtError, setTxtError] = useState<string | null>(null);
    const dispatch = useDispatch();

    const isFile = (name: string) => {
        return name.split(".")[1];
    };

    const handleClickApprove = () => {
        if (projectPath == null) {
            setTxtError("The path is empty");
            return;
        }

        if (isFile(projectPath)) {
            setTxtError("The path is not folder");
            return;
        }

        setTxtError(null);
        dispatch(setAddProject(projectPath));
        return confirm(true);
    };

    return (
        <Dialog
            open={openDialog}
            onClose={() => confirm(false)}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogContent>
                <DialogContentText fontSize='16px' id='alert-dialog-description'>
                    Add new project
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <TextField
                    id='outlined-basic'
                    label='path'
                    variant='outlined'
                    size='small'
                    value={projectPath}
                    error={txtError != null ? true : false}
                    helperText={txtError}
                    onChange={(e) => setProjectPath(e.target.value)}
                    style={{ width: 400 }}
                />
                <Button
                    size='small'
                    sx={{ "font-size": "14px" }}
                    onClick={() => handleClickApprove()}
                    autoFocus
                >
                    Add
                </Button>
                <Button size='small' sx={{ "font-size": "14px" }} onClick={() => confirm(false)}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddProjectConfirmation;
