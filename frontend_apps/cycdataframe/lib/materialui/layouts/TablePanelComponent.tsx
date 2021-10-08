import { Typography } from "@mui/material";
import React from "react";
import { TableArea, TablePanel, TableToolbar } from "./StyledComponents";
import WorkingPanelDividerComponent from "./WorkingPanelDivider";

const TablePanelComponent = () => {
    return (
        <TablePanel>
            <TableToolbar>                
            </TableToolbar>
            <WorkingPanelDividerComponent />
            <TableArea>
                <Typography paragraph>
                
                </Typography>
                <Typography paragraph>
                Consequat mauris nunc congue nisi vitae suscipit. Fringilla est ullamcorper
                eget nulla facilisi etiam dignissim diam. Pulvinar elementum integer enim
                neque volutpat ac tincidunt. Ornare suspendisse sed nisi lacus sed viverra
                tellus. Purus sit amet volutpat consequat mauris. Elementum eu facilisis
                sed odio morbi. Euismod lacinia at quis risus sed vulputate odio. Morbi
                tincidunt ornare massa eget egestas purus viverra accumsan in. In hendrerit
                gravida rutrum quisque non tellus orci ac. Pellentesque nec nam aliquam sem
                et tortor. Habitant morbi tristique senectus et. Adipiscing elit duis
                tristique sollicitudin nibh sit. Ornare aenean euismod elementum nisi quis
                eleifend. Commodo viverra maecenas accumsan lacus vel facilisis. Nulla
                posuere sollicitudin aliquam ultrices sagittis orci a.
                </Typography>
            </TableArea>
        </TablePanel>
    );
  };
  
  export default TablePanelComponent;


