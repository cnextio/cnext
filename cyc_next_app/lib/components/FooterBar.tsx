import React, { useEffect } from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Box from "@mui/material/Box";
import RestoreIcon from "@mui/icons-material/Restore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const FooterBar = () => {
    return (
        <Box>
            <BottomNavigation
                showLabels
                value={"value"}
                // onChange={(event, newValue) => {
                //     setValue(newValue);
                // }}
            >
                <BottomNavigationAction label='Recents' icon={<RestoreIcon />} />
                <BottomNavigationAction label='Favorites' icon={<FavoriteIcon />} />
                <BottomNavigationAction label='Nearby' icon={<LocationOnIcon />} />
            </BottomNavigation>
        </Box>
    );
};

export default FooterBar;
