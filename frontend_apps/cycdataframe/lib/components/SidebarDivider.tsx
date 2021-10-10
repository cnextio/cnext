import React from "react";
import { Divider } from "@mui/material";
import { SideBarDivider } from './StyledComponents';

const SidebarDividerComponent = () => {
  return (
    <SideBarDivider>
        <Divider orientation='vertical'/>
    </SideBarDivider>
  );
};

export default SidebarDividerComponent;
