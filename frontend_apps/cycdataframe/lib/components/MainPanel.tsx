import { Box } from "@mui/system";
import React, {FC} from "react";
import { MainPanel } from "./StyledComponents";

const MainPanelComponent = (props: { children: any; }) => {
  return (
    <MainPanel>
        {props.children}
    </MainPanel>
  );
};

export default MainPanelComponent;