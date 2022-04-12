import * as React from "react";
import Box from "@mui/material/Box";
import InboxIcon from "@mui/icons-material/Inbox";
import FolderIcon from "@mui/icons-material/Folder";
import DeleteIcon from "@mui/icons-material/Delete";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import {
    Sidebar,
    SidebarList,
    SidebarListItem,
    SidebarButton as StyledSidebarButton,
    SideBarDivider,
} from "../StyledComponents";
import LogoComponent from "../Logo";
import { useDispatch } from "react-redux";
import { Fragment, useEffect, useState } from "react";
import { setShowProjectExplorer } from "../../../redux/reducers/ProjectManagerRedux";
import { clearTextOutputs } from "../../../redux/reducers/CodeEditorRedux";
import { setViewMode } from "../../../redux/reducers/ConfigManagerRedux";
import { ViewModeOptions } from "../../interfaces/IApp";
import { SideBarName } from "../../interfaces/IApp";
import store from "../../../redux/store";

// const drawerWidth = 240;

// export const DrawerHeader = styled('div')(({ theme }) => ({
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'flex-end',
//   padding: theme.spacing(0, 1),
//   // necessary for content to be below app bar
//   ...theme.mixins.toolbar,
// }));

const SidebarItem = ({ icon, selectedIcon, handleClick }) => {
    return (
        <SidebarListItem button key={icon.name} selected={selectedIcon === icon.name}>
            <StyledSidebarButton id={"sidebar_" + icon.name} onClick={() => handleClick(icon.name)}>
                {icon.component}
            </StyledSidebarButton>
        </SidebarListItem>
    );
};
const MiniSidebar = () => {
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
    const dispatch = useDispatch();

    const iconList = [
        {
            name: SideBarName.PROJECT,
            component: <FolderIcon />,
        },
        {
            name: SideBarName.INBOX,
            component: <InboxIcon />,
        },
        {
            name: SideBarName.CLEAR_STATE,
            component: <DeleteIcon />,
        },
        {
            name: SideBarName.CHANGE_LAYOUT,
            component: <ViewCompactIcon />,
        },
    ];

    const handleClickClearState = () => {
        const state = store.getState();
        const inViewID = state.projectManager.inViewID;
        dispatch(clearTextOutputs(inViewID));
    };

    const handleClickChangeLayout = () => {
        const state = store.getState();
        let viewMode = state.configManager.viewMode;
        if (viewMode === ViewModeOptions.HORIZONTAL) {
            dispatch(setViewMode(ViewModeOptions.VERTICAL));
        } else {
            dispatch(setViewMode(ViewModeOptions.HORIZONTAL));
        }
    };

    const handleClick = (name: string) => {
        if (name === SideBarName.CLEAR_STATE) {
            handleClickClearState();
        } else if (name === SideBarName.CHANGE_LAYOUT) {
            handleClickChangeLayout();
        } else {
            if (name === selectedIcon) {
                setSelectedIcon(null);
            } else {
                setSelectedIcon(name);
            }
        }
    };

    useEffect(() => {
        if (selectedIcon === SideBarName.PROJECT) {
            dispatch(setShowProjectExplorer(true));
        } else {
            dispatch(setShowProjectExplorer(false));
        }
    }, [selectedIcon]);

    return (
        <Fragment>
            <Box>
                <LogoComponent />
                <Sidebar variant='permanent'>
                    <SidebarList>
                        {iconList.map((icon, index) => (
                            <SidebarItem
                                key={index}
                                icon={icon}
                                selectedIcon={selectedIcon}
                                handleClick={handleClick}
                            />
                        ))}
                    </SidebarList>
                </Sidebar>
            </Box>
            <SideBarDivider orientation='vertical' />
        </Fragment>
    );
};

export default MiniSidebar;
