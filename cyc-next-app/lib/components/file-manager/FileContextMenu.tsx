import React from "react";
import { 
    ContextMenu, 
    ContextMenuItem } from "../StyledComponents";
import { FileContextMenuItem } from "../../interfaces/IFileManager"
import { Menu } from "@mui/material";

//TODO: refactor to use libs/ContextMenu instead
const FileContextMenu = ({contextMenuPos, handleClose, handleSelection}) => {      
    const menu = [
        {name: FileContextMenuItem.NEW_FILE, text: 'New file', disable: false},
        {name: FileContextMenuItem.NEW_FOLDER, text: 'New folder', disable: true},
        {name: FileContextMenuItem.DIVIDER},
        {name: FileContextMenuItem.RENAME, text: 'Rename', disable: true},
        {name: FileContextMenuItem.DELETE, text: 'Delete', disable: false},
    ];
    return (
        <ContextMenu
            open={contextMenuPos !== null}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
            contextMenuPos !== null
                ? { top: contextMenuPos.mouseY, left: contextMenuPos.mouseX }
                : undefined
            }
        >
            {menu.map((item) => {
               return (
                    <ContextMenuItem 
                        disabled = {item.disable?true:false}
                        divider = {item.name===FileContextMenuItem.DIVIDER}
                        onClick = {() => handleSelection(item.name)}>{item.text}
                    </ContextMenuItem> 
                )
            })}
        </ContextMenu>
    );
};

export default FileContextMenu;