import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material";
import React from "react";

const KernelRestartConfirmation = ({ openDialog, confirm }) => {
    return (
        <Dialog
            open={openDialog}
            onClose={() => confirm(false)}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogContent>
                <DialogContentText fontSize='16px' id='alert-dialog-description'>
                    Are you sure you want to restart?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    size='small'
                    sx={{ "font-size": "14px" }}
                    onClick={() => confirm(true)}
                    autoFocus
                >
                    Yes
                </Button>
                <Button size='small' sx={{ "font-size": "14px" }} onClick={() => confirm(false)}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default KernelRestartConfirmation;
