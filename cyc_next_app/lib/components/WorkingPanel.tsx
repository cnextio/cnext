import React from "react";
import { WorkingPanel as StyledWorkingPanel } from "./StyledComponents";
import CodePanel from "./code-panel/CodePanel";
import RichOutputPanel from "./richoutput-panel/RichOutputPanel";
import DFManager from "./dataframe-manager/DataFrameManager";
import FileManager from "./file-manager/FileManager";
import FileExplorer from "./file-manager/FileExplorer";
import { useSelector } from "react-redux";
import Pane from "react-split-pane-v2";
import { RootState } from "../../redux/store";
import SplitPane from "react-split-pane-v2";

const WorkingPanel = () => {
    const showProjectExplore = useSelector(
        (state: RootState) => state.projectManager.showProjectExplore
    );

    const projectConfig = useSelector((state: RootState) => state.projectManager.configs);

    return (
        <StyledWorkingPanel>
            {/* have to do complicated inline style because of this 
			https://newbedev.com/absolute-positioning-ignoring-padding-of-parent */}
            <SplitPane split="vertical">
                {showProjectExplore && (
                    <Pane size="20%">
                        <FileExplorer />
                    </Pane>
                )}
                <Pane>
                    <SplitPane split={projectConfig.view_mode}>
                        <Pane>
                            <CodePanel workingPanelViewMode={projectConfig.view_mode} />
                        </Pane>
                        <Pane>
                            <RichOutputPanel />
                        </Pane>
                    </SplitPane>
                </Pane>
            </SplitPane>
            <DFManager />
            <FileManager />
        </StyledWorkingPanel>
    );
};

export default WorkingPanel;
