import React from "react";
import { 
    ContextMenu as StyledContextMenu, 
    ContextMenuItem as StyledContextMenuItem } from "../StyledComponents";
import { IContextMenu } from "../../interfaces/IContextMenu";

const ContextMenu = ({open, contextMenu, handleClose, handleSelection} : 
                    {open: boolean, contextMenu: IContextMenu|undefined, handleClose: any, handleSelection: any}) => {          
    return (
        <StyledContextMenu
            open={open}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
            contextMenu
                ? { top: contextMenu.pos.mouseY, left: contextMenu.pos.mouseX }
                : undefined
            }
        >
            {contextMenu && contextMenu.menu.map((item) => {
               return (
                    <StyledContextMenuItem 
                        disabled = {item.disable?true:false}
                        divider = {item.name===null}
                        onClick = {() => handleSelection(item)}>{item.text}
                    </StyledContextMenuItem> 
                )
            })}
        </StyledContextMenu>
    );
};

export default ContextMenu;