import React from "react";
import { WorkingPanel as StyledWorkingPanel, WorkingPanelSplitPanel } from "./StyledComponents";
import CodePanel from "./code-panel/CodePanel";
import RichOutputPanel from "./richoutput-panel/RichOutputPanel";
import DFManager from "./DFManager";
import FileManager from "./file-manager/FileManager";
import FileExplorer from "./file-manager/FileExplorer";
import { useSelector } from "react-redux";

const WorkingPanel = (props: any) => {  
  const showProjectExplore = useSelector(state => state.projectManager.showProjectExplore);

  return (
    <StyledWorkingPanel>      
        {/* have to do complicated inline style because of this 
        https://newbedev.com/absolute-positioning-ignoring-padding-of-parent */}
        <WorkingPanelSplitPanel split="vertical" defaultSize="30%" pane2Style={{width: "0%"}}>
        {/* <WorkingPanelSplitPanel split="vertical"> */}
            {showProjectExplore && <FileExplorer />}
            <CodePanel {... props}/>
            <RichOutputPanel {... props}/>                                 
        </WorkingPanelSplitPanel>
        <DFManager/> 
        <FileManager/>
    </StyledWorkingPanel> 
  );
};

export default WorkingPanel;