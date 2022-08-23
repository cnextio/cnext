import { StyledExecutor } from "../StyledComponents";
import * as React from "react";
import { useState } from "react";
import AddCardIcon from "@mui/icons-material/AddCard";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";

import { SideBarName } from "../../interfaces/IApp";
import { Divider, Tooltip } from "@mui/material";
import { clearAllOutputs, setCellCommand } from "../../../redux/reducers/CodeEditorRedux";
import { ExecutorManagerCommand } from "../../interfaces/IExecutorManager";
import { useDispatch } from "react-redux";
import store from "../../../redux/store";
import ExecutorCommandConfirmation from "./ExecutorCommandConfirmation";
import { interruptKernel, restartKernel } from "./ExecutorManager";
import { CellCommand } from "../../interfaces/ICodeEditor";
const AppToolbarItem = ({ icon, selectedIcon, handleClick }) => {
    return (
        <Tooltip title={icon.tooltip} placement="bottom-end">
            <span
                className="icon"
                id={"sidebar_" + icon.name}
                onClick={() => handleClick(icon.name)}
            >
                {icon.component}
            </span>
        </Tooltip>
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
        } else if (name === CellCommand.ADD_CELL) {
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
    ];
    const cellCommandIconList = [
        {
            name: CellCommand.ADD_CELL,
            component: <AddCardIcon />,
            tooltip: "Add Cell",
        },
    ];
    const SideBarDivider = () => {
        return (
            <Divider style={{ marginTop: "5px", height: "18px" }} orientation="vertical" flexItem />
        );
    };
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
            <SideBarDivider />
            {cellCommandIconList.map((icon, index) => (
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
