import React, { useMemo } from "react";
import { WorkingPanel as StyledWorkingPanel, WorkingPanelSplitPanel } from "./StyledComponents";
import CodePanel from "./code-panel/CodePanel";
import RichOutputPanel from "./richoutput-panel/RichOutputPanel";
import DFManager from "./dataframe-manager/DataFrameManager";
import FileManager from "./file-manager/FileManager";
import FileExplorer from "./file-manager/FileExplorer";
import { useSelector } from "react-redux";
import Pane from "react-split-pane-v2/lib/Pane";
// import { extensions, getCodeText, onCodeMirrorChange } from "./code-panel/CodeMirror";

const WorkingPanel = () => {  
	const showProjectExplore = useSelector(state => state.projectManager.showProjectExplore);
	
	return (
		<StyledWorkingPanel>      
			{/* have to do complicated inline style because of this 
			https://newbedev.com/absolute-positioning-ignoring-padding-of-parent */}
			<WorkingPanelSplitPanel split="vertical" >
				{showProjectExplore &&
				<Pane size='300px'> 
					<FileExplorer />
				</Pane>}
				<Pane>
					<CodePanel />
					{/* {codePanel} */}
				</Pane>
				<Pane>
					<RichOutputPanel />                                 
				</Pane>
			</WorkingPanelSplitPanel>
			<DFManager/> 
			<FileManager/>
		</StyledWorkingPanel> 
	);
};

export default WorkingPanel;