import React from "react";
import { PanelDivider, TablePanel, TableToolbar } from "../StyledComponents";
import RichOutputView from "./RichOutputView";
import DFExplorer from "./DFExplorer";
import DFFilter from "./DFFilter";

const RichOutputPanel = (props: any) => {
    return (
        <TablePanel>
            {/* {console.log(props)} */}
            <TableToolbar>
                <DFExplorer></DFExplorer>
                <DFFilter></DFFilter>
            </TableToolbar>
            <PanelDivider />
            <RichOutputView {...props} />
        </TablePanel>
    );
};

export default RichOutputPanel;
