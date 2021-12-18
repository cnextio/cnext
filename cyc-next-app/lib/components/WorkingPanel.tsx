import React from "react";
import { WorkingPanel as StyledWorkingPanel, WorkingPanelSplitPanel } from "./StyledComponents";
import CodePanel from "./code-panel/CodePanel";
import RichOutputPanel from "./richoutput-panel/RichOutputPanel";
import DFManager from "./DFManager";
import FileManager from "./file-manager/FileManager";

const WorkingPanel = (props: any) => {  
  return (
    <StyledWorkingPanel>      
        {/* have to do complicated inline style because of this 
        https://newbedev.com/absolute-positioning-ignoring-padding-of-parent */}
        <WorkingPanelSplitPanel split="vertical" defaultSize="30%" pane2Style={{width: "0%"}}>
        {/* <WorkingPanelSplitPanel split="vertical"> */}
            {/* <div></div> */}
            <CodePanel {... props}/>
            <RichOutputPanel {... props}/>                                 
        </WorkingPanelSplitPanel>
        <DFManager/> 
        <FileManager/>
    </StyledWorkingPanel> 
  );
};

export default WorkingPanel;