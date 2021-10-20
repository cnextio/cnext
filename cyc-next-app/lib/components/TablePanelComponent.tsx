import React from "react";
import { DataTable, TablePanel, TableToolbar } from "./StyledComponents";
import TableComponent from "./TableComponent";

import dynamic from 'next/dynamic'
const ColumnHistogramComponentWithNoSSR = dynamic(
    () => import("./ColumnHistogramComponent"),
    { ssr: false }
  )
// import VizComponent from "./VizComponent";
import WorkingPanelDividerComponent from "./WorkingPanelDivider";

//for testing
import {tableData as testTableData} from "./tests/TestTableData";

const TablePanelComponent = (props: any) => {
    return (
        <TablePanel>
            {/* {console.log(props)} */}
            <TableToolbar>                
            </TableToolbar>
            <WorkingPanelDividerComponent />
            <TableComponent {... props}/>
            {/* <ColumnHistogramComponentWithNoSSR df_id='test_df' col_name='Engine Speed'/> */}
        </TablePanel>
    );
  };
  
  export default TablePanelComponent;


