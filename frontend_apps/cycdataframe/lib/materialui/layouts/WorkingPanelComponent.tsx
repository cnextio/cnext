import { Box } from "@mui/system";
import React, {FC} from "react";
import { MainPanel, SplitPanel, WorkingPanel } from "./StyledComponents";
import SplitPane, { Pane } from "react-split-pane";
import CodePanelComponent from "./CodePanelComponent";
import TablePanelComponent from "./TablePanelComponent";

const WorkingPanelComponent = () => {
  return (
    <WorkingPanel>      
        {/* have to do complicated inline style because of this 
        https://newbedev.com/absolute-positioning-ignoring-padding-of-parent */}
        <SplitPanel split="vertical" defaultSize="50%" 
        style={{paddingLeft: "inherit", paddingRight: "inherit", height: `calc(100% - 12px)`}}>
                <CodePanelComponent />
                <TablePanelComponent />       
        </SplitPanel>
        {/* {props.children} */}        
        {/* <CodePanelComponent />
        <TablePanelComponent /> */}
    </WorkingPanel> 
  );
};

export default WorkingPanelComponent;