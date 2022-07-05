import { Tooltip } from "@mui/material";
import React from "react";
import { OPERATION_DISABLED_MSG } from "../../interfaces/IApp";
import { Overlay } from "../StyledComponents";

export const OverlayComponent = () => {
    return (
        <Tooltip
            title={OPERATION_DISABLED_MSG}
            placement="left"
            style={{ marginLeft: "auto" }}
            children={<Overlay />}
        />
    );
}