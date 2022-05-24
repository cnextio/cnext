import React from "react";
import AccountCircleIcon from '@mui/icons-material/accountcircle';
import SettingsIcon from '@mui/icons-material/settings';

import {
  AppBar,
  AppBarIcon,
  LeftSide
} from "./StyledComponents";

const AppBarComponent = () => {
  return (
    <AppBar>
        <LeftSide>          
        </LeftSide>
        <AppBarIcon>
            <SettingsIcon />
        </AppBarIcon>
        <AppBarIcon>
            <AccountCircleIcon />
        </AppBarIcon>
    </AppBar>
  );
};

export default AppBarComponent;