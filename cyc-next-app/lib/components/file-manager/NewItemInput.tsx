import React, { useEffect, useRef } from "react"
import { FileContextMenuNewItem } from "../StyledComponents"

const NewItemInput = ({handleKeyPress}) => {
    const newItemRef = useRef();
    
    useEffect(() => {
        console.log('FileExplorer: ', newItemRef.current);
        if(newItemRef && newItemRef.current){            
            newItemRef.current.focus();
            newItemRef.current.setSelectionRange(0, 0);
        }
    }, [newItemRef])

    return (
        <FileContextMenuNewItem
            inputRef = {newItemRef}
            defaultValue = ".py"
            onKeyDown = {(event: React.KeyboardEvent) => handleKeyPress(event, newItemRef.current.value)}
        />
    )
}

export default NewItemInput;