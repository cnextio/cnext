import React, { useMemo, useState } from "react";
import { WorkingPanel as StyledWorkingPanel, WorkingPanelSplitPanel } from "./StyledComponents";
import CodePanel from "./code-panel/CodePanel";
import RichOutputPanel from "./richoutput-panel/RichOutputPanel";
import DFManager from "./dataframe-manager/DataFrameManager";
import FileManager from "./file-manager/FileManager";
import FileExplorer from "./file-manager/FileExplorer";
import { useSelector } from "react-redux";
import Pane from "react-split-pane-v2/lib/Pane";
import { ViewMode } from "../interfaces/IApp";
import store, { RootState } from '../../redux/store';
// import { extensions, getCodeText, onCodeMirrorChange } from "./code-panel/CodeMirror";

const WorkingPanel = () => {  
	const showProjectExplore = useSelector((state: RootState) => state.projectManager.showProjectExplore);
	const [viewMode, setViewMode] = useState(ViewMode.HORIZONTAL)
	return (
        <StyledWorkingPanel>
            {/* have to do complicated inline style because of this 
			https://newbedev.com/absolute-positioning-ignoring-padding-of-parent */}
            <WorkingPanelSplitPanel split={viewMode}>
                {showProjectExplore && (
                    <Pane size="300px">
                        <FileExplorer />
                    </Pane>
                )}
                <Pane>
                    <CodePanel workingPanelViewMode={viewMode} />
                </Pane>
                <Pane>
                    <RichOutputPanel />
                </Pane>
            </WorkingPanelSplitPanel>
            <DFManager />
            <FileManager />
        </StyledWorkingPanel>
    );
};

export default WorkingPanel;