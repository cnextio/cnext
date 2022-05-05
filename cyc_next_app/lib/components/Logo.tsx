import { Box, CssBaseline } from "@mui/material";
import React from "react";
import { Logo, LogoIcon } from "./StyledComponents";

const LogoComponent = () => {
    return (
        <Box>
            <Logo>
                <LogoIcon alt="" src="/favicon.ico" />
            </Logo>
        </Box>
    );
};

export default LogoComponent;
