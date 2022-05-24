import * as React from "react";
import Box from "@mui/material/Box";
import InboxIcon from "@mui/icons-material/Inbox";
import FolderIcon from "@mui/icons-material/Folder";
import DeleteIcon from "@mui/icons-material/Delete";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";

import {
    AppToolbar,
    AppToolbarList,
    AppToolbarItem as StyledAppToolbarItem,
    SidebarButton as StyledSidebarButton,
    SideBarDividerContainer,
    MainContainerDivider,
    Sidebar,
} from "../StyledComponents";
import Logo from "./Logo";
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
import KernelInterruptConfirmation from "../kernel-manager/KernelInterruptConfirmation";
import KernelRestartComfirmation from "../kernel-manager/KernelRestartConfirmation";
import Account from "../user-manager/Account";

const AppToolbarItem = ({ icon, selectedIcon, handleClick }) => {
    return (
        <StyledAppToolbarItem key={icon.name} selected={selectedIcon === icon.name}>
            <Tooltip title={icon.tooltip} placement="right-end">
                <StyledSidebarButton
                    id={"sidebar_" + icon.name}
                    onClick={() => handleClick(icon.name)}
                >
                    {icon.component}
                </StyledSidebarButton>
            </Tooltip>
        </StyledAppToolbarItem>
    );
};

const SideBarDivider = () => {
    return (
        <SideBarDividerContainer>
            <Divider style={{ paddingTop: "5px", marginBottom: "5px", width: "80%" }} />
        </SideBarDividerContainer>
    );
};

const MiniSidebar = () => {
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
    const [openKernelInterruptDialog, setOpenKernelInterruptDialog] = useState(false);
    const [openKernelRestartDialog, setOpenKernelRestartDialog] = useState(false);
    const dispatch = useDispatch();

    const projectManagerIconList = [
        {
            name: SideBarName.PROJECT,
            component: <FolderIcon />,
            tooltip: "File Explorer",
        },
    ];

    const layoutManagerIconList = [
        {
            name: SideBarName.CHANGE_LAYOUT,
            component: <ViewCompactIcon />,
            tooltip: "Change layout",
        },
    ];

    const executorManagerIconList = [
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
        {
            name: SideBarName.CLEAR_STATE,
            component: <PlaylistRemoveIcon />,
            tooltip: "Clear results and outputs",
        },
    ];

    const handleClickClearState = () => {
        const state = store.getState();
        const inViewID = state.projectManager.inViewID;
        dispatch(clearTextOutputs(inViewID));
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
            setOpenKernelRestartDialog(true);
        } else if (name === SideBarName.INTERRUPT_KERNEL) {
            setOpenKernelInterruptDialog(true);
        } else {
            if (name === selectedIcon) {
                setSelectedIcon(null);
            } else {
                setSelectedIcon(name);
            }
        }
    };

    const handleKernelInterruptDialogClose = (confirm: boolean) => {
        if (confirm) {
            interruptKernel();
        }
        setOpenKernelInterruptDialog(false);
    };

    const handleKernelRestartDialogClose = (confirm: boolean) => {
        if (confirm) {
            restartKernel();
        }
        setOpenKernelRestartDialog(false);
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
            <Sidebar>
                <Logo />
                <AppToolbar variant="permanent">
                    <AppToolbarList>
                        {projectManagerIconList.map((icon, index) => (
                            <AppToolbarItem
                                key={index}
                                icon={icon}
                                selectedIcon={selectedIcon}
                                handleClick={handleClick}
                            />
                        ))}
                    </AppToolbarList>
                    <SideBarDivider />
                    <AppToolbarList>
                        {layoutManagerIconList.map((icon, index) => (
                            <AppToolbarItem
                                key={index}
                                icon={icon}
                                selectedIcon={selectedIcon}
                                handleClick={handleClick}
                            />
                        ))}
                    </AppToolbarList>
                    <SideBarDivider />
                    <AppToolbarList>
                        {executorManagerIconList.map((icon, index) => (
                            <AppToolbarItem
                                key={index}
                                selectedIcon={selectedIcon}
                                icon={icon}
                                handleClick={handleClick}
                            />
                        ))}
                    </AppToolbarList>
                </AppToolbar>
                <Account />
            </Sidebar>
            <MainContainerDivider orientation="vertical" />
            <KernelInterruptConfirmation
                openDialog={openKernelInterruptDialog}
                confirm={handleKernelInterruptDialogClose}
            />
            <KernelRestartComfirmation
                openDialog={openKernelRestartDialog}
                confirm={handleKernelRestartDialogClose}
            />
        </Fragment>
    );
};

export default MiniSidebar;
