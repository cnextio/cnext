import * as React from "react";
import FolderIcon from "@mui/icons-material/Folder";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import ShareIcon from "@mui/icons-material/Share";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import Modal from '@mui/material/Modal';
import { nanoid } from 'nanoid';

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
import { clearAllOutputs } from "../../../redux/reducers/CodeEditorRedux";
import { ViewMode } from "../../interfaces/IApp";
import { SideBarName } from "../../interfaces/IApp";
import Tooltip from "@mui/material/Tooltip";
import store from "../../../redux/store";
import Divider from "@mui/material/Divider";
import { restartKernel, interruptKernel } from "../executor-manager/ExecutorManager";
import ExecutorCommandConfirmation from "../executor-manager/ExecutorCommandConfirmation";
import Account from "../user-manager/Account";
import { ExecutorManagerCommand } from "../../interfaces/IExecutorManager";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};
  

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
    const [openShare, setOpenShare] = useState(false);
    const [shareId, setShareId] = useState(nanoid());
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

    const shareIconList = [
        {
            name: SideBarName.SHARE,
            component: <ShareIcon />,
            tooltip: "Share",
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
            dispatch(setProjectConfig({ view_mode: ViewMode.VERTICAL }));
        } else {
            dispatch(setProjectConfig({ view_mode: ViewMode.HORIZONTAL }));
        }
    };

    const handleOpenShare = () => setOpenShare(true);
    const handleCloseShare = () => setOpenShare(false);
    const handleStartCollab = () => {
        // Add shareId to the url and reload the page
        const url = new URL(window.location.href);
        url.searchParams.set("share", shareId);
        
        window.location.href = url.href;
    };

    const handleClick = (name: string) => {
        if (name === SideBarName.CLEAR_OUTPUTS) {
            handleClickClearOutputs();
        } else if (name === SideBarName.CHANGE_LAYOUT) {
            handleClickChangeLayout();
        } else if (name === SideBarName.RESTART_KERNEL) {
            setKernelCommand(ExecutorManagerCommand.restart_kernel);
        } else if (name === SideBarName.INTERRUPT_KERNEL) {
            setKernelCommand(ExecutorManagerCommand.interrupt_kernel);
        } else if (name === SideBarName.SHARE) {
            handleOpenShare();
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
        } else {
            dispatch(setShowProjectExplorer(false));
        }
    }, [selectedIcon]);

    return (
        <Fragment>
            <Sidebar>
                <Logo />
                <Modal
                    open={openShare}
                    onClose={handleCloseShare}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <Stack spacing={2}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Share your workspace
                            </Typography>
                            <TextField  fullWidth  label="Share this link to start collaborating" variant="standard" value={`http://localhost:4000/?remoteProject=${shareId}`} />
                            <div>
                                <Button onClick={handleStartCollab} variant="contained">Start</Button>
                                <Button onClick={handleCloseShare}>Cancel</Button>
                            </div>
                        </Stack>
                    </Box>
                </Modal>
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
                        {shareIconList.map((icon, index) => (
                            <AppToolbarItem
                                key={index}
                                selectedIcon={selectedIcon}
                                icon={icon}
                                handleClick={handleClick}
                            />
                        ))}
                    </AppToolbarList>
                    {/* <AppToolbarList>
                        {executorManagerIconList.map((icon, index) => (
                            <AppToolbarItem
                                key={index}
                                selectedIcon={selectedIcon}
                                icon={icon}
                                handleClick={handleClick}
                            />
                        ))}
                    </AppToolbarList> */}
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
