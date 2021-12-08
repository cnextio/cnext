import { Box } from "@mui/system";
import React, {FC} from "react";
import { MainPanel, WorkingPanel as StyledWorkingPanel, WorkingPanelSplitPanel } from "./StyledComponents";
import SplitPane, { Pane } from "react-split-pane";
import CodePanel from "./code-panel/CodePanel";
import TablePanelComponent from "./richoutput-panel/RichOutputPanel";
import DFManager from "./DFManager";
import DFStatusNotification from "./DFStatusNotification";
import FileManager from "./file-manager/FileManager";

const WorkingPanel = (props: any) => {  
  return (
    <StyledWorkingPanel>      
        {/* have to do complicated inline style because of this 
        https://newbedev.com/absolute-positioning-ignoring-padding-of-parent */}
        {/* minus 12px to variable which is WorkingPannel's padding */}
        {/* pane2Style width is the must for the scrolling to work when resize, this is like the min width of pane 2 */}
        <WorkingPanelSplitPanel split="vertical" defaultSize="70%" pane2Style={{width: "0%"}}>             
            <CodePanel {... props}/>
            <TablePanelComponent {... props}/>                                 
        </WorkingPanelSplitPanel>
        <DFManager/> 
        <FileManager/>
        {/* {props.children} */}        
        {/* <CodePanelComponent />
        <TablePanelComponent /> */}
    </StyledWorkingPanel> 
  );
};

export default WorkingPanel;