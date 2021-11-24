import React, { useRef } from "react";
import { DataTable, TablePanel, TableToolbar } from "./StyledComponents";
import TableView from "./TableView";
import DFExplorer from "./DFExplorer";

import dynamic from 'next/dynamic'
const VizComponentWithNoSSR = dynamic(
    () => import("./PlotView"),
    { ssr: false }
  )

import WorkingPanelDividerComponent from "./WorkingPanelDivider";
import DFStatusNotification from "./DFStatusNotification";

//for testing
import {tableData as testTableData} from "./tests/TestTableData";
import DFFilter from "./DFFilter";

const TablePanelComponent = (props: any) => {
    return (
        <TablePanel>
            {/* {console.log(props)} */}
            <TableToolbar>
              <DFExplorer></DFExplorer>
              <DFFilter></DFFilter>
            </TableToolbar>
            <WorkingPanelDividerComponent />
            <TableView {... props}/>
            <VizComponentWithNoSSR />
            {/* <DFStatusNotification/> */}
        </TablePanel>
    );
  };
  
  export default TablePanelComponent;


