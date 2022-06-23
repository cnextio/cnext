import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material";
import React from "react";

const DeleteConfirmation = ({ deleteDialog, confirmDelete, itemName }) => {
    return (
        <Dialog
            open={deleteDialog}
            onClose={() => confirmDelete(false)}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogContent>
                <DialogContentText fontSize='16px' id='alert-dialog-description'>
                    Are you sure you want to delete "{itemName?.split("/").pop()}"?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    size='small'
                    sx={{ "font-size": "14px" }}
                    onClick={() => confirmDelete(true)}
                    autoFocus
                >
                    Move to trash
                </Button>
                <Button
                    size='small'
                    sx={{ "font-size": "14px" }}
                    onClick={() => confirmDelete(false)}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteConfirmation;
