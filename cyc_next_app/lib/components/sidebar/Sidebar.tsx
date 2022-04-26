import * as React from "react";
import Box from "@mui/material/Box";
import InboxIcon from "@mui/icons-material/Inbox";
import FolderIcon from "@mui/icons-material/Folder";
import DeleteIcon from "@mui/icons-material/Delete";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
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
import {
    setShowProjectExplorer,
    setProjectConfig,
} from "../../../redux/reducers/ProjectManagerRedux";
import { clearTextOutputs } from "../../../redux/reducers/CodeEditorRedux";
import { ViewMode } from "../../interfaces/IApp";
import { SideBarName } from "../../interfaces/IApp";
import Tooltip from "@mui/material/Tooltip";
import store from "../../../redux/store";
import Divider from "@mui/material/Divider";
import { restartKernel, interruptKernel } from "../kernel-manager/KernelManager";

const SidebarItem = ({ icon, selectedIcon, handleClick }) => {
    return (
        <SidebarListItem button key={icon.name} selected={selectedIcon === icon.name}>
            <Tooltip title={icon.tooltip} placement='right-end'>
                <StyledSidebarButton
                    id={"sidebar_" + icon.name}
                    onClick={() => handleClick(icon.name)}
                >
                    {icon.component}
                </StyledSidebarButton>
            </Tooltip>
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
            tooltip: "Explorer",
        },
        {
            name: SideBarName.INBOX,
            component: <InboxIcon />,
            tooltip: "Inbox",
        },
        {
            name: SideBarName.CLEAR_STATE,
            component: <DeleteIcon />,
            tooltip: "Clear results and outputs",
        },
        {
            name: SideBarName.CHANGE_LAYOUT,
            component: <ViewCompactIcon />,
            tooltip: "Change layout",
        },
    ];

    const kernelIconList = [
        {
            name: SideBarName.RESTART_KERNEL,
            component: <RestartAltIcon />,
            tooltip: "Restart kernel",
        },
        {
            name: SideBarName.INTERRUPT_KERNEL,
            component: <PauseIcon />,
            tooltip: "Interrupt kernel",
        },
    ];

    const handleClickClearState = () => {
        const state = store.getState();
        const inViewID = state.projectManager.inViewID;
        dispatch(clearTextOutputs(inViewID));
    };

    const handleClickRestartKernel = () => {
        console.log("handleClickRestartKernel");
    };

    const handleClickInterruptKernel = () => {
        console.log("handleClickInterruptKernel");
    };

    const handleClickChangeLayout = () => {
        const state = store.getState();
        const viewMode = state.projectManager.configs.view_mode;
        if (viewMode === ViewMode.HORIZONTAL) {
            dispatch(setProjectConfig({ view_mode: ViewMode.VERTICAL }));
        } else {
            dispatch(setProjectConfig({ view_mode: ViewMode.HORIZONTAL }));
        }
    };

    const handleClick = (name: string) => {
        if (name === SideBarName.CLEAR_STATE) {
            handleClickClearState();
        } else if (name === SideBarName.CHANGE_LAYOUT) {
            handleClickChangeLayout();
        } else if (name === SideBarName.RESTART_KERNEL) {
            restartKernel();
        } else if (name === SideBarName.INTERRUPT_KERNEL) {
            interruptKernel();
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
                    <Divider style={{ width: "100%" }} />
                    <SidebarList>
                        {kernelIconList.map((icon, index) => (
                            <SidebarItem
                                key={index}
                                selectedIcon={selectedIcon}
                                icon={icon}
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
