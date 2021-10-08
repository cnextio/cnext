import React, { FC, useState } from "react";
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
// import Component from "react"
import MiniSidebar, { DrawerHeader } from "../../../lib/materialui/layouts/Sidebar";
import Header from "../../../lib/materialui/layouts/Header";

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
import SidebarDividerComponent from "../../../lib/materialui/layouts/SidebarDivider";
import LogoComponent from "../../../lib/materialui/layouts/Logo";
import MainPanelComponent from "../../../lib/materialui/layouts/MainPanel";
import { CodeArea, CodePanel, CodeToolbar, MainPanel, TopPanel, WorkingPanel } from "../../../lib/materialui/layouts/StyledComponents";
import AppBarComponent from "../../../lib/materialui/layouts/AppBar";
import WorkingPanelDividerComponent from "../../../lib/materialui/layouts/WorkingPanelDivider";
import CodePanelComponent from "../../../lib/materialui/layouts/CodePanelComponent";
import TablePanelComponent from "../../../lib/materialui/layouts/TablePanelComponent";
import WorkingPanelComponent from "../../../lib/materialui/layouts/WorkingPanelComponent";

// const drawerWidth = 200;

// const GlobalStyle = createGlobalStyle`
//   html,
//   body,
//   #root {
//     height: 100%;
//   }

//   body {
//     background: ${props => props.theme.body.background};
//   }

//   .MuiCardHeader-action .MuiIconButton-root {
//     padding: 4px;
//     width: 28px;
//     height: 28px;
//   }
// `;

// const Root = styled.div`
//   display: flex;
//   min-height: 100vh;
//   position: "relative";
// `;

// const Drawer = styled.div`
//   ${props => props.theme.breakpoints.up("md")} {
//     width: ${drawerWidth}px;
//     flex-shrink: 0;
//   }
// `;

// const AppContent = styled.div`
//   max-width: 100%; 
//   flex: 1;
//   display: flex;
//   flex-direction: column;
// `;

// const Paper = styled(MuiPaper)(spacing);

// const MainContent = styled(Paper)`  
//   flex: 1;
//   background: ${props => props.theme.body.background};

//   @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
//     flex: none;
//   }

//   .MuiPaper-root .MuiPaper-root {
//     box-shadow: none;
//   }
// `;
  
const MainLayout: FC = () => {
  const [page, setPage] = useState({name: DRAWING});

  const handleSideBarSelection = (name: string, params: object) => {
      console.log(name, params);
      setPage({name: name});
  }

  // const PageSelection = ({ page }) => {
  //     switch(page.name) {
  //           case DRAWING:
  //               return <DrawingPageContainer />
  //               break;
  //     }
  // }
    // console.log(theme)
  return (
    <Box sx={{ flexDirection: 'column' }}>
        <CssBaseline />
        <TopPanel>
            <LogoComponent />
            <AppBarComponent />
        </TopPanel>
        <MainPanel>
            <MiniSidebar />
            <SidebarDividerComponent />
            <WorkingPanelComponent />            
        </MainPanel>
    </Box>
  )
}

export default MainLayout;
