import { LoadingButton } from "@mui/lab";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
} from "@mui/material";
import React from "react";
import { ExecutorCommandStatus, IExecutorCommandResponse } from "../../interfaces/IApp";
import { ExecutorManagerCommand } from "../../interfaces/IExecutorManager";

const ExecutorCommandConfirmation = ({
    command,
    confirmHandler,
    executing,
    executionStatus,
}: {
    command: any;
    confirmHandler: any;
    executing: any;
    executionStatus: IExecutorCommandResponse | null;
}) => {
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
            {executionStatus && executionStatus.status !== ExecutorCommandStatus.EXECUTION_OK && (
                <Alert
                    severity="error"
                    sx={{ marginLeft: "20px", marginRight: "20px", fontSize: "13px" }}
                >
                    {executionStatus.status === ExecutorCommandStatus.EXECUTION_FAILED && (
                        <>
                            Fail to excute the command some issues in the server. You might need to
                            restart the server from the command line.
                        </>
                    )}
                    {executionStatus.status === ExecutorCommandStatus.CONNECTION_FAILED && (
                        <>
                            Fail to excute the command due to connection error. You may want to
                            retry it a few more times.
                        </>
                    )}
                </Alert>
            )}
            <DialogActions>
                {!executing ? (
                    <Button
                        size="small"
                        sx={{ fontSize: "14px" }}
                        onClick={() => confirmHandler(true, command)}
                        autoFocus
                    >
                        Yes
                    </Button>
                ) : (
                    <LoadingButton loading size="small" sx={{ fontSize: "14px" }}>
                        Yes
                    </LoadingButton>
                )}

                <Button
                    size="small"
                    sx={{ fontSize: "14px" }}
                    onClick={() => confirmHandler(false, command)}
                    disabled={executing}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExecutorCommandConfirmation;
