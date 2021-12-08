import React, { useRef } from "react";
import { DataTable, PanelDivider, TablePanel, TableToolbar } from "../StyledComponents";
import TableView from "./RichOutputView";
import DFExplorer from "./DFExplorer";

import dynamic from 'next/dynamic'
// const VizComponentWithNoSSR = dynamic(
//     () => import("../plot_panel/PlotView"),
//     { ssr: false }
//   )

// import WorkingPanelDivider from "../obs-WorkingPanelDivider";
import DFStatusNotification from "../DFStatusNotification";

//for testing
import {tableData as testTableData} from "../tests/TestTableData";
import DFFilter from "./DFFilter";

const TablePanelComponent = (props: any) => {
    return (
        <TablePanel>
            {/* {console.log(props)} */}
            <TableToolbar>
              <DFExplorer></DFExplorer>
              <DFFilter></DFFilter>
            </TableToolbar>
            <PanelDivider/>
            <TableView {... props}/>
        </TablePanel>
    );
  };
  
  export default TablePanelComponent;


