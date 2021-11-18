import React, { FC, useState } from "react";
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
// import Component from "react"
import MiniSidebar, { DrawerHeader } from "../../../lib/components/Sidebar";
import Header from "../../../lib/components/Header";

import {
  CssBaseline,
  Paper as MuiPaper
} from "@mui/material";

// import {apolloClient, USER_ID} from "../../../lib/database";
// import BacklogContainer from "./backlogs";
// import TaskContainer from "./tasks";
import {DRAWING, FOLDERS, INBOX, TASKS} from "../../routes";
// import FolderContainer from "./folders";
import DrawingPageContainer from "./drawing-page";
import { Box, Divider, Typography } from "@mui/material";
import SidebarDividerComponent from "../../../lib/components/SidebarDivider";
import LogoComponent from "../../../lib/components/Logo";
import MainPanelComponent from "../../../lib/components/MainPanel";
import { CodeEditor, CodePanel, CodeToolbar, MainPanel, TopPanel, WorkingPanel } from "../../../lib/components/StyledComponents";
import AppBarComponent from "../../../lib/components/AppBar";
import WorkingPanelComponent from "../../../lib/components/WorkingPanelComponent";
  
const MainLayout: FC = (props: any) => {
    const [page, setPage] = useState({name: DRAWING});

    const handleSideBarSelection = (name: string, params: object) => {
        console.log(name, params);
        setPage({name: name});
    }

    return (
        // macbook pro 13 height
        // move this to style files
        <Box display="flex" sx={{ flexDirection: 'column' }} style={{height: "100vh"}}> 
            {/* <CssBaseline /> */}
            {/* <TopPanel>
                <LogoComponent />
                <AppBarComponent />
            </TopPanel> */}
            <MainPanel>
                <MiniSidebar />
                <SidebarDividerComponent />
                <WorkingPanelComponent {... props}/>            
            </MainPanel>
        </Box>
    )
}

export default MainLayout;
