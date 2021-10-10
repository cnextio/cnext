import { Box } from "@mui/system";
import React, {FC} from "react";
import { MainPanel, WorkingPanel, WorkingPanelSplitPanel } from "./StyledComponents";
import SplitPane, { Pane } from "react-split-pane";
import CodePanelComponent from "./CodePanelComponent";
import TablePanelComponent from "./TablePanelComponent";

const WorkingPanelComponent = (props: any) => {  
  return (
    <WorkingPanel>      
        {/* have to do complicated inline style because of this 
        https://newbedev.com/absolute-positioning-ignoring-padding-of-parent */}
        {/* minus 12px to variable which is WorkingPannel's padding */}
        <WorkingPanelSplitPanel split="vertical" defaultSize="30%"> 
                <CodePanelComponent {... props}/>
                <TablePanelComponent {... props}/>       
        </WorkingPanelSplitPanel>
        {/* {props.children} */}        
        {/* <CodePanelComponent />
        <TablePanelComponent /> */}
    </WorkingPanel> 
  );
};

export default WorkingPanelComponent;