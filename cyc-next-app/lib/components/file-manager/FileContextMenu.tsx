import React from "react";
import { 
    FileContextMenu as StyledFileContextMenu, 
    FileContextMenuItem as StyledFileContextMenuItem } from "../StyledComponents";
import { FileContextMenuItem } from "../../interfaces/IFileManager"
import { Menu } from "@mui/material";

const FileContextMenu = ({contextMenu, handleClose, handleSelection}) => {      
    const menu = [
        {name: FileContextMenuItem.NEW_FILE, text: 'New file', disable: false},
        {name: FileContextMenuItem.NEW_FOLDER, text: 'New folder', disable: true},
        {name: FileContextMenuItem.DIVIDER},
        {name: FileContextMenuItem.RENAME, text: 'Rename', disable: true},
        {name: FileContextMenuItem.DELETE, text: 'Delete', disable: false},
    ];
    return (
        <StyledFileContextMenu
            open={contextMenu !== null}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
            contextMenu !== null
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined
            }
        >
            {menu.map((item) => {
               return (
                    <StyledFileContextMenuItem 
                        disabled = {item.disable?true:false}
                        divider = {item.name===FileContextMenuItem.DIVIDER}
                        onClick = {() => handleSelection(item.name)}>{item.text}
                    </StyledFileContextMenuItem> 
                )
            })}
        </StyledFileContextMenu>
    );
};

export default FileContextMenu;