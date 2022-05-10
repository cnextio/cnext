import React from "react";
import TextField from "@mui/material/TextField";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material";

export interface AddProjectDialogProps {
    openDialog: boolean;
    confirm: (value: boolean) => boolean;
    projectPath: string;
}

const AddProjectDialog = (props: AddProjectDialogProps) => {
    const { openDialog, confirm, projectPath } = props;

    return (
        <Dialog open={openDialog} onClose={() => confirm(false)}>
            <DialogContent style={{ minWidth: "500px" }}>
                <DialogContentText fontSize='16px' id='dialog-add-project'>
                    <TextField
                        id='add-project-input'
                        label='Project path'
                        variant='outlined'
                        style={{ width: "100%", fontSize: "14px" }}
                        size='small'
                        value={projectPath}
                    />
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    size='small'
                    sx={{ fontSize: "14px" }}
                    onClick={() => confirm(true)}
                    autoFocus
                >
                    Add
                </Button>
                <Button size='small' sx={{ fontSize: "14px" }} onClick={() => confirm(false)}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddProjectDialog;
