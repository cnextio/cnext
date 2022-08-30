import { AppToolbarList, StyledExecutor } from "../StyledComponents";
import * as React from "react";
import { Fragment, useEffect, useState } from "react";
import AddCardIcon from "@mui/icons-material/AddCard";
import FolderIcon from "@mui/icons-material/Folder";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";

import {
    AppToolbar,
    AppToolbarItem as StyledAppToolbarItem,
    SidebarButton as StyledSidebarButton,
    SideBarDividerContainer,
    MainContainerDivider,
    Sidebar,
} from "../StyledComponents";
import { SideBarName } from "../../interfaces/IApp";
import { Tooltip } from "@mui/material";
import { clearAllOutputs, setCellCommand } from "../../../redux/reducers/CodeEditorRedux";
import { ExecutorManagerCommand } from "../../interfaces/IExecutorManager";
import { useDispatch } from "react-redux";
import store from "../../../redux/store";
import ExecutorCommandConfirmation from "./ExecutorCommandConfirmation";
import { interruptKernel, restartKernel } from "./ExecutorManager";
const AppToolbarItem = ({ icon, selectedIcon, handleClick }) => {
    return (
        <span key={icon.name} selected={selectedIcon === icon.name} className="sidebar-icons">
            <Tooltip title={icon.tooltip} placement="bottom-end">
                <span
                    className="icon"
                    id={"sidebar_" + icon.name}
                    onClick={() => handleClick(icon.name)}
                >
                    {icon.component}
                </span>
            </Tooltip>
        </span>
    );
};
const ExecutorComponent = () => {
    const [selectedIcon, setSelectedIcon] = React.useState<string | null>(null);
    const [kernelCommand, setKernelCommand] = useState<ExecutorManagerCommand | null>(null);
    const dispatch = useDispatch();
    const handleClickClearOutputs = () => {
        const state = store.getState();
        const inViewID = state.projectManager.inViewID;
        dispatch(clearAllOutputs(inViewID));
    };
    const handleClick = (name: string) => {
        if (name === SideBarName.CLEAR_OUTPUTS) {
            handleClickClearOutputs();
        } else if (name === SideBarName.RESTART_KERNEL) {
            setKernelCommand(ExecutorManagerCommand.restart_kernel);
        } else if (name === SideBarName.INTERRUPT_KERNEL) {
            setKernelCommand(ExecutorManagerCommand.interrupt_kernel);
        } else if (name === SideBarName.ADD_CELL) {
            store.dispatch(setCellCommand(SideBarName.ADD_CELL));
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
    const executorManagerIconList = [
        {
            name: SideBarName.RESTART_KERNEL,
            component: <RestartAltIcon fontSize="small" />,
            tooltip: "Restart kernel",
        },
        {
            name: SideBarName.INTERRUPT_KERNEL,
            component: <PauseIcon fontSize="small" />,
            tooltip: "Interrupt kernel",
        },
        {
            name: SideBarName.CLEAR_OUTPUTS,
            component: <PlaylistRemoveIcon fontSize="small" />,
            tooltip: "Clear results and outputs",
        },
        {
            name: SideBarName.ADD_CELL,
            component: <AddCardIcon fontSize="small" />,
            tooltip: "Add Cell",
        },
    ];
    return (
        <StyledExecutor>
            {executorManagerIconList.map((icon, index) => (
                <AppToolbarItem
                    key={index}
                    selectedIcon={selectedIcon}
                    icon={icon}
                    handleClick={handleClick}
                />
            ))}
            {kernelCommand !== null && (
                <ExecutorCommandConfirmation
                    command={kernelCommand}
                    confirmHandler={commandDialogConfirm}
                />
            )}
        </StyledExecutor>
    );
};

export default ExecutorComponent;