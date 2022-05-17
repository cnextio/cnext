import React, { useEffect, useRef } from "react";
import { ProjectCommand } from "../../interfaces/IFileManager";
import { ContextMenuNewItem } from "../StyledComponents";
import CypressIds from "../tests/CypressIds";

const NewItemInput = ({ handleKeyPress, command }) => {
    const newItemRef = useRef();

    useEffect(() => {
        console.log("FileExplorer: ", newItemRef.current);
        if (newItemRef && newItemRef.current) {
            newItemRef.current.focus();
            newItemRef.current.setSelectionRange(0, 0);
        }
    }, [newItemRef]);

    return (
        <ContextMenuNewItem
            inputRef={newItemRef}
            defaultValue={command == ProjectCommand.create_file ? ".py" : ""}
            data-cy={CypressIds.newFileItem}
            onKeyDown={(event: React.KeyboardEvent) =>
                handleKeyPress(event, newItemRef.current.value, command)
            }
        />
    );
};

export default NewItemInput;
