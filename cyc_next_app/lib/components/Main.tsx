import React, { FC } from "react";
import { Box } from "@mui/material";
import MiniSidebar from "./sidebar/Sidebar";
import { MainPanel } from "./StyledComponents";
import WorkingPanel from "./WorkingPanel";
import FooterBar from "./FooterBar";

const Main: FC = (props: any) => {
    return (
        // macbook pro 13 height
        // move this to style files
        <Box
            display='flex'
            sx={{ flexDirection: "column" }}
            style={{ height: "calc(100vh - 32px)" }}
        >
            {console.log("MainPanel render")}
            {/* <CssBaseline /> */}
            {/* <TopPanel>
                <LogoComponent />
                <AppBarComponent />
            </TopPanel> */}
            <MainPanel>
                {console.log(props)}
                <MiniSidebar {...props} />
                <WorkingPanel {...props} />
                <FooterBar {...props} />
            </MainPanel>
        </Box>
    );
};

export default Main;
