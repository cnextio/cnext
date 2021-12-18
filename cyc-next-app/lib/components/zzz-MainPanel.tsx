import { Box } from "@mui/system";
import React, {FC} from "react";
import { MainPanel as StyledMainPanel } from "./StyledComponents";

const MainPanel = (props: { children: any; }) => {
  return (
    <StyledMainPanel>
        {props.children}
    </StyledMainPanel>
  );
};

export default MainPanel;