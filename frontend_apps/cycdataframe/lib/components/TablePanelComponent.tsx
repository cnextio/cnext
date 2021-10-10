import React from "react";
import { DataTable, TablePanel, TableToolbar } from "./StyledComponents";
import TableComponent from "./TableComponent";
import WorkingPanelDividerComponent from "./WorkingPanelDivider";

//for testing
import {tableData as testTableData} from "./tests/TestTableData";

import { DataTableContent } from "./Interfaces";

const TablePanelComponent = (props: any) => {
    return (
        <TablePanel>
            {/* {console.log(props)} */}
            <TableToolbar>                
            </TableToolbar>
            <WorkingPanelDividerComponent />
            {/* <TableComponent tableData={testTableData}/> */}
            <TableComponent {... props}/>
        </TablePanel>
    );
  };
  
  export default TablePanelComponent;


