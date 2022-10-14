import { ExecutorToolbar as StyledExecutorToolbar } from "../StyledComponents";
import * as React from "react";
import { useState } from "react";
import AddCardIcon from "@mui/icons-material/AddCardOutlined";
import PauseIcon from "@mui/icons-material/PauseOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAltOutlined";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemoveOutlined";

import { ExecutorToolbarItem, SideBarName } from "../../interfaces/IApp";
import { Divider, Tooltip } from "@mui/material";
import { clearAllOutputs, setCellCommand } from "../../../redux/reducers/CodeEditorRedux";
import { ExecutorManagerCommand } from "../../interfaces/IExecutorManager";
import { useDispatch } from "react-redux";
import store from "../../../redux/store";
import ExecutorCommandConfirmation from "./ExecutorCommandConfirmation";
import { interruptKernel, restartKernel } from "./ExecutorManager";
import { CellCommand } from "../../interfaces/ICodeEditor";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { SocketContext } from "../Socket";

const ExecutorToolbarItemComponent = ({ icon, selectedIcon, handleClick }) => {
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

const ExecutorToolbar = () => {
    const socket = React.useContext(SocketContext);
    const [selectedIcon, setSelectedIcon] = React.useState<string | null>(null);
    const [kernelCommand, setKernelCommand] = useState<ExecutorManagerCommand | null>(null);
    const dispatch = useDispatch();
    const handleClickClearOutputs = () => {
        const state = store.getState();
        const inViewID = state.projectManager.inViewID;
        if (inViewID) {
            dispatch(clearAllOutputs(inViewID));
        }
    };
    const handleClick = (name: string) => {
        if (name === ExecutorToolbarItem.CLEAR_OUTPUTS) {
            handleClickClearOutputs();
        } else if (name === ExecutorToolbarItem.RESTART_KERNEL) {
            setKernelCommand(ExecutorManagerCommand.restart_kernel);
        } else if (name === ExecutorToolbarItem.INTERRUPT_KERNEL) {
            setKernelCommand(ExecutorManagerCommand.interrupt_kernel);
        } else if (name === CellCommand.ADD_CELL) {
            store.dispatch(setCellCommand(CellCommand.ADD_CELL));
        }  else if (name === CellCommand.RUN_ALL_CELL) {
            store.dispatch(setCellCommand(CellCommand.RUN_ALL_CELL));
        }
         else {
            if (name === selectedIcon) {
                setSelectedIcon(null);
            } else {
                setSelectedIcon(name);
            }
        }
    };
    const commandDialogConfirm = (confirm: boolean, command: ExecutorManagerCommand) => {
        setKernelCommand(null);
        if (confirm && socket) {
            if (command === ExecutorManagerCommand.interrupt_kernel) {
                interruptKernel(socket);
            } else if (command === ExecutorManagerCommand.restart_kernel) {
                restartKernel(socket);
            }
        }
    };

    const executorToolbarItems = [
        {
            name: ExecutorToolbarItem.RESTART_KERNEL,
            component: <RestartAltIcon fontSize="small" />,
            tooltip: "Restart kernel",
        },
        {
            name: ExecutorToolbarItem.INTERRUPT_KERNEL,
            component: <PauseIcon fontSize="small" />,
            tooltip: "Interrupt kernel",
        },
        {
            name: ExecutorToolbarItem.CLEAR_OUTPUTS,
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
        {
            name: CellCommand.RUN_ALL_CELL,
            component: <ArrowRightIcon  fontSize="large"/>,
            tooltip: "Run All Cell",
        },
    ];
    const ExecutorDivider = () => {
        return (
            <Divider style={{ marginTop: "5px", height: "18px" }} orientation="vertical" flexItem />
        );
    };
    return (
        <StyledExecutorToolbar>
            {executorToolbarItems.map((icon, index) => (
                <ExecutorToolbarItemComponent
                    key={index}
                    selectedIcon={selectedIcon}
                    icon={icon}
                    handleClick={handleClick}
                />
            ))}
            <ExecutorDivider />
            {cellCommandIconList.map((icon, index) => (
                <ExecutorToolbarItemComponent
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
        </StyledExecutorToolbar>
    );
};

export default ExecutorToolbar;
