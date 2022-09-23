import * as React from "react";
import FolderIcon from "@mui/icons-material/Folder";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
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
    setProjectSetting,
    setShowGitManager,
} from "../../../redux/reducers/ProjectManagerRedux";
import { clearAllOutputs, setDiffEditor } from "../../../redux/reducers/CodeEditorRedux";
import { ViewMode } from "../../interfaces/IApp";
import { SideBarName } from "../../interfaces/IApp";
import Tooltip from "@mui/material/Tooltip";
import store from "../../../redux/store";
import Divider from "@mui/material/Divider";
import { restartKernel, interruptKernel } from "../executor-manager/ExecutorManager";
import ExecutorCommandConfirmation from "../executor-manager/ExecutorCommandConfirmation";
import Account from "../user-manager/Account";
import { ExecutorManagerCommand } from "../../interfaces/IExecutorManager";

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
    const [kernelCommand, setKernelCommand] = useState<ExecutorManagerCommand | null>(null);
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
    const gitManagerIconList = [
        {
            name: SideBarName.GIT,
            component: <TrendingUpIcon />,
            tooltip: "Git",
        },
    ];
    const handleClickClearOutputs = () => {
        const state = store.getState();
        const inViewID = state.projectManager.inViewID;
        dispatch(clearAllOutputs(inViewID));
    };

    const handleClickChangeLayout = () => {
        const state = store.getState();
        const viewMode = state.projectManager.settings.view_mode;
        if (viewMode === ViewMode.HORIZONTAL) {
            dispatch(setProjectSetting({ view_mode: ViewMode.VERTICAL }));
        } else {
            dispatch(setProjectSetting({ view_mode: ViewMode.HORIZONTAL }));
        }
    };

    const handleClick = (name: string) => {
        if (name === SideBarName.CHANGE_LAYOUT) {
            handleClickChangeLayout();
        } else {
            if (name === selectedIcon) {
                setSelectedIcon(null);
            } else {
                setSelectedIcon(name);
            }
        }
    };

    const commandDialogConfirm = (confirm: boolean, command: ExecutorManagerCommand) => {
        setKernelCommand(null);
        if (confirm) {
            if (command === ExecutorManagerCommand.interrupt_kernel) {
                interruptKernel();
            } else if (command === ExecutorManagerCommand.restart_kernel) {
                restartKernel();
            }
        }
    };

    useEffect(() => {
        if (selectedIcon === SideBarName.PROJECT) {
            dispatch(setShowProjectExplorer(true));
            dispatch(setShowGitManager(false));
        } else if (selectedIcon === SideBarName.GIT) {
            // dispatch(setDiffEditor(false))

            dispatch(setShowGitManager(true));
            dispatch(setShowProjectExplorer(false));
        } else {
            dispatch(setDiffEditor(false))

            dispatch(setShowGitManager(false));
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
                    {gitManagerIconList.map((icon, index) => (
                        <AppToolbarItem
                            key={index}
                            icon={icon}
                            selectedIcon={selectedIcon}
                            handleClick={handleClick}
                        />
                    ))}
                    <SideBarDivider />
                </AppToolbar>
                <Account />
            </Sidebar>

            <MainContainerDivider orientation="vertical" />
            {kernelCommand !== null && (
                <ExecutorCommandConfirmation
                    command={kernelCommand}
                    confirmHandler={commandDialogConfirm}
                />
            )}
        </Fragment>
    );
};

export default MiniSidebar;
