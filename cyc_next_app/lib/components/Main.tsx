import React, { FC } from "react";
import { Box } from "@mui/material";
import MiniSidebar from "./sidebar/Sidebar";
import {MainPanel} from "./StyledComponents";
import WorkingPanel from "./WorkingPanel";
  
const Main: FC = (props: any) => {
    const handleSideBarSelection = (name: string, params: object) => {
    }

    return (
        // macbook pro 13 height
        // move this to style files
        <Box display="flex" sx={{ flexDirection: 'column' }} style={{height: "100vh"}}> 
            {console.log('MainPanel render')}
            {/* <CssBaseline /> */}
            {/* <TopPanel>
                <LogoComponent />
                <AppBarComponent />
            </TopPanel> */}
            <MainPanel>
                {console.log(props)}
                <MiniSidebar {...props}/>
                <WorkingPanel {... props}/>            
            </MainPanel>
        </Box>
    )
}

export default Main;
