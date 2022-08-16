import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material";
import React from "react";
import { ExecutorManagerCommand } from "../../interfaces/IExecutorManager";

const ExecutorCommandConfirmation = ({ command, confirmHandler }) => {
    return (
        <Dialog
            open={true}
            onClose={() => confirmHandler(false, command)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogContent>
                <DialogContentText fontSize="16px" id="alert-dialog-description">
                    {command === ExecutorManagerCommand.interrupt_kernel &&
                        "Are you sure you want to interrupt the kernel?"}
                    {command === ExecutorManagerCommand.restart_kernel &&
                        "Are you sure you want to restart the kernel?"}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    size="small"
                    sx={{ fontSize: "14px" }}
                    onClick={() => confirmHandler(true, command)}
                    autoFocus
                >
                    Yes
                </Button>
                <Button
                    size="small"
                    sx={{ fontSize: "14px" }}
                    onClick={() => confirmHandler(false, command)}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExecutorCommandConfirmation;
