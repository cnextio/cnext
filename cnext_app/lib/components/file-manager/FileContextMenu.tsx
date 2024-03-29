import React from "react";
import { ContextMenu, ContextMenuItem } from "../StyledComponents";
import { FileContextMenuCommand } from "../../interfaces/IFileManager";

//TODO: refactor to use libs/ContextMenu instead
const FileContextMenu = ({ contextMenuPos, handleClose, handleSelection, contextMenuItem }) => {
    const menu = [
        {
            name: FileContextMenuCommand.NEW_FILE,
            text: "New file",
            disable: true ? contextMenuItem?.is_file : false, // disable create file function if context menu is file type
        },
        {
            name: FileContextMenuCommand.NEW_FOLDER,
            text: "New folder",
            disable: true ? contextMenuItem?.is_file : false, // disable create folder function if context menu is file type
        },
        { name: FileContextMenuCommand.DIVIDER },
        { name: FileContextMenuCommand.RENAME, text: "Rename", disable: true },
        {
            name: FileContextMenuCommand.DELETE,
            text: "Delete",
            disable: true ? !contextMenuItem?.deletable : false,
        },
    ];

    return (
        <ContextMenu
            open={contextMenuPos != null}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
                contextMenuPos !== null
                    ? { top: contextMenuPos.mouseY, left: contextMenuPos.mouseX }
                    : undefined
            }
        >
            {menu.map((item, index:number) => {
                return (
                    <ContextMenuItem
                        disabled={item.disable ? true : false}
                        divider={item.name === FileContextMenuCommand.DIVIDER}
                        onClick={() => handleSelection(item.name)}
                        key={index}
                    >
                        {item.text}
                    </ContextMenuItem>
                );
            })}
        </ContextMenu>
    );
};

export default FileContextMenu;
