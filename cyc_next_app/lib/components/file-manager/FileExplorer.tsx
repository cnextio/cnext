import React, { Fragment, useEffect, useState } from "react";
import path from "path";
import {
    ProjectToolbar,
    FileExplorerHeaderName,
    FileTree,
    FileItem,
    ProjectItem,
    ErrorText,
} from "../StyledComponents";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LockIcon from "@mui/icons-material/Lock";
import { useDispatch, useSelector } from "react-redux";
import {
    FileContextMenuItem,
    IDirectoryMetadata,
    IDirListResult,
    IFileMetadata,
    IProjectMetadata,
    IWorkspaceMetadata,
    ProjectCommand,
} from "../../interfaces/IFileManager";
// import { IWorkSpaceConfig as IWorkSpaceMetadata } from "../../interfaces/IApp";
import { ContentType, IMessage, WebAppEndpoint } from "../../interfaces/IApp";
import socket from "../Socket";
import {
    setFileToOpen,
    setInView,
    setOpenDir,
    setOpenFiles,
    setProjects,
    setProjectToAdd,
    setProjectToSetActive,
    setServerSynced,
    // setActiveProject,
    // setPathToAddProject,
    // setProjectToSetActive,
    setWorkspaceMetadata,
} from "../../../redux/reducers/ProjectManagerRedux";
import FileContextMenu from "./FileContextMenu";
import NewItemInput from "./NewItemInput";
import DeleteConfirmation from "./DeleteConfirmation";
import store, { RootState } from "../../../redux/store";
import CypressIds from "../tests/CypressIds";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import AddBoxIcon from "@mui/icons-material/AddBox";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import Tooltip from "@mui/material/Tooltip";
import { resetCodeEditor } from "../../../redux/reducers/CodeEditorRedux";

interface ContextMenuInfo {
    parent: string;
    item: string;
    is_file?: boolean;
}

const FileExplorer = (props: any) => {
    const activeProject: IProjectMetadata | null = useSelector(
        (state: RootState) => state.projectManager.activeProject
    );

    const openDirs: { [id: string]: IDirectoryMetadata[] } = useSelector(
        (state: RootState) => state.projectManager.openDirs
    );

    const workspaceMetadata: IWorkspaceMetadata = useSelector(
        (state: RootState) => state.projectManager.workspaceMetadata
    );

    const [contextMenuItems, setContextMenuItems] = useState<ContextMenuInfo | null>(null);
    const [createItemInProgress, setCreateItemInProgress] = useState<boolean>(false);
    const [createProjectInProgress, setCreateProjectInprogress] = useState<boolean>(false);
    const [txtError, setTxtError] = useState<string | null>(null);
    const [command, setProjectCommand] = useState<
        | ProjectCommand.create_file
        | ProjectCommand.create_folder
        | ProjectCommand.add_project
        | null
    >(null);
    const [expandedDirs, setExpandedDirs] = useState<Array<string>>([]);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const dispatch = useDispatch();

    const setupSocket = () => {
        socket.emit("ping", "FileExplorer");
        socket.on(WebAppEndpoint.FileExplorer, (result: string) => {
            console.log("FileExplorer got results...", result);
            try {
                let fmResult: IMessage = JSON.parse(result);
                if (!fmResult.error) {
                    switch (fmResult.command_name) {
                        case ProjectCommand.list_dir:
                            console.log("FileExplorer got list dir: ", fmResult.content);
                            if (fmResult.type == ContentType.DIR_LIST) {
                                const dirs: IDirectoryMetadata[] | null = fmResult.content;
                                if (dirs) {
                                    const data: IDirListResult = {
                                        id: fmResult.metadata["path"],
                                        dirs: dirs,
                                    };
                                    dispatch(setOpenDir(data));
                                }
                            }
                            break;
                        case ProjectCommand.create_file:
                            console.log("FileExplorer got create_file: ", fmResult);
                            dispatch(setOpenFiles(fmResult.content));
                            dispatch(setInView(fmResult.metadata["path"]));
                            break;
                        case ProjectCommand.delete:
                            console.log("FileExplorer got delete result: ", fmResult);
                            let openFiles = fmResult.content as IFileMetadata[];
                            dispatch(setOpenFiles(openFiles));
                            if (openFiles.length > 0) {
                                dispatch(setInView(openFiles[0].path));
                            }
                            break;
                    }
                } else {
                }
            } catch (error) {
                console.error(error);
            }
        });
    };

    useEffect(() => {
        setupSocket();
        return () => {
            socket.off(WebAppEndpoint.FileExplorer);
        };
    }, []);

    useEffect(() => {
        let projects: IProjectMetadata[] = [];
        let activeProject: IProjectMetadata | null = null;
        workspaceMetadata.open_projects.forEach((project: IProjectMetadata) => {
            if (project.id === workspaceMetadata.active_project) {
                activeProject = project;
            } else {
                projects.push(project);
            }
        });
        setProjects(projects);
    }, [workspaceMetadata]);

    useEffect(() => {
        if (activeProject) {
            setExpandedDirs([]);
            // TODO: make sure the files have been saved before close
            // dispatch(setOpenFiles([])); // Close all files when changing active project
        }
    }, [activeProject]);

    const createMessage = (command: ProjectCommand, metadata: {}, content = null): IMessage => {
        let message: IMessage = {
            webapp_endpoint: WebAppEndpoint.FileExplorer,
            command_name: command,
            content: content,
            type: ContentType.STRING,
            error: false,
            metadata: metadata,
        };
        return message;
    };

    const sendMessage = (message: IMessage) => {
        console.log(
            `File Explorer Send Message: ${message.webapp_endpoint} ${JSON.stringify(message)}`
        );
        socket.emit(message.webapp_endpoint, JSON.stringify(message));
    };

    const fetchDirChildNodes = (path: string) => {
        const state = store.getState();
        const projectPath = state.projectManager.activeProject?.path;
        let message: IMessage = createMessage(ProjectCommand.list_dir, {
            project_path: projectPath,
            path: path,
        });
        sendMessage(message);
    };

    const handleDirToggle = (event, nodes) => {
        const expandingNodes = nodes.filter((node) => !expandedDirs.includes(node));
        setExpandedDirs(nodes);
        const dirID = expandingNodes[0];
        console.log("expandingNodes", expandingNodes);
        console.log("FileExplorer handleDirToggle: ", event, dirID);
        if (dirID != null) {
            fetchDirChildNodes(dirID);
        }
    };

    const [contextMenuPos, setContextMenuPos] = React.useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);

    /**
     * Called when context menu opens
     * @param event
     * @param clickedItem
     * @param parentItem
     */
    const openContextMenu = (
        event: React.MouseEvent,
        clickedItem: string,
        parentItem: string,
        is_file: boolean,
        deletable: boolean
    ) => {
        event.preventDefault();
        event.stopPropagation();
        console.log("FileExplorer: ", clickedItem, parentItem);
        setContextMenuPos(
            contextMenuPos === null
                ? {
                      mouseX: event.clientX - 2,
                      mouseY: event.clientY - 4,
                  }
                : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
                  // Other native context menus might behave different.
                  // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
                  null
        );
        setContextMenuItems({
            parent: parentItem,
            item: clickedItem,
            is_file: is_file,
            deletable: deletable,
        });
    };

    const selectContextMenuItem = (item: FileContextMenuItem) => {
        switch (item) {
            case FileContextMenuItem.NEW_FILE:
                if (contextMenuItems) {
                    // Expanded the folder when creating new file
                    const newExpanded = [...expandedDirs, contextMenuItems.item];
                    setExpandedDirs([...new Set(newExpanded)]); // Remove duplicate expanded note ID
                    setProjectCommand(ProjectCommand.create_file);
                    setCreateItemInProgress(true);
                }
                break;
            case FileContextMenuItem.NEW_FOLDER:
                if (contextMenuItems) {
                    // Expanded the folder when creating new file
                    const newExpanded = [...expandedDirs, contextMenuItems.item];
                    setExpandedDirs([...new Set(newExpanded)]); // Remove duplicate expanded note ID
                    setProjectCommand(ProjectCommand.create_folder);
                    setCreateItemInProgress(true);
                }
                break;
            case FileContextMenuItem.DELETE:
                if (contextMenuItems) {
                    setDeleteDialog(true);
                }
                break;
        }
        setContextMenuPos(null);
    };

    const closeContextMenu = () => {
        setContextMenuPos(null);
    };

    const isNameNotEmpty = (name: string) => {
        return name.split(".")[0].length > 0;
    };

    const relativeProjectPath = "";

    // const isFile = (name: string) => {
    //     return name.split(".")[1];
    // };

    const checkProjectPath = (projectPath: string) => {
        if (projectPath == "") {
            setTxtError("The path is empty");
            return false;
        }

        // if (isFile(projectPath)) {
        //     setTxtError("The path is not folder");
        //     return false;
        // }

        setTxtError(null);
        return true;
    };

    const handleNewProjectKeyPress = (event: React.KeyboardEvent, value: string) => {
        const projectPath = value;
        if (event.key === "Enter") {
            let isValidPath = checkProjectPath(projectPath);
            if (isValidPath) {
                dispatch(setProjectToAdd(projectPath));
                setCreateProjectInprogress(false);
            }
        } else if (event.key === "Escape") {
            setCreateProjectInprogress(false);
        }
    };

    const handleNewItemKeyPress = (
        event: React.KeyboardEvent,
        value: string,
        projectCommand: ProjectCommand.create_file | ProjectCommand.create_folder
    ) => {
        const state = store.getState();
        const projectPath = state.projectManager.activeProject?.path;
        if (event.key === "Enter") {
            if (isNameNotEmpty(value) && contextMenuItems) {
                /** this will create path format that conforms to the style of the client OS
                 * but not that of server OS. The server will have to use os.path.norm to correct
                 * the path */
                let relativePath = path.join(relativeProjectPath, contextMenuItems.item, value);
                console.log(
                    "FileExplorer create new item: ",
                    relativePath,
                    contextMenuItems.item,
                    value
                );
                let message = createMessage(projectCommand, {
                    project_path: projectPath,
                    path: relativePath,
                });
                sendMessage(message);
                fetchDirChildNodes(contextMenuItems.item);
                setCreateItemInProgress(false);
            }
        } else if (event.key === "Escape") {
            setCreateItemInProgress(false);
        }
    };

    const changeActiveProject = (projectId: string) => {
        let currentProjectID = store.getState().projectManager.activeProject?.id;
        if (projectId != null && projectId != currentProjectID) {
            dispatch(setProjectToSetActive(projectId));
        }
    };

    const handleDeleteDialogClose = (confirm) => {
        if (confirm && contextMenuItems) {
            const state = store.getState();
            const projectPath = state.projectManager.activeProject?.path;
            let message = createMessage(ProjectCommand.delete, {
                project_path: projectPath,
                path: contextMenuItems.item,
                is_file: contextMenuItems.is_file,
            });
            sendMessage(message);
            fetchDirChildNodes(contextMenuItems.parent);
        }
        setDeleteDialog(false);
    };

    const handleAddProjectBtn = () => {
        setCreateProjectInprogress(true);
    };

    const renderFileItems = (path: string) => {
        return (
            <Fragment>
                {Object.keys(openDirs).includes(path) ? (
                    openDirs[path]
                        .filter((value) => value.name.substring(0, 1) !== ".")
                        .sort(function (a, b) {
                            if (a.name < b.name) {
                                return -1;
                            }
                            if (a.name > b.name) {
                                return 1;
                            }
                            return 0;
                        })
                        .sort(function (a, b) {
                            return Number(a?.is_file) - Number(b?.is_file);
                        })
                        .map((value, index) => {
                            return (
                                <FileItem
                                    nodeId={value.path}
                                    label={value.name}
                                    onClick={() => {
                                        value.is_file ? dispatch(setFileToOpen(value.path)) : null;
                                    }}
                                    onContextMenu={(event: React.MouseEvent) => {
                                        openContextMenu(
                                            event,
                                            value.path,
                                            path,
                                            value.is_file,
                                            value.deletable
                                        );
                                    }}
                                >
                                    {!value.is_file && renderFileItems(value.path)}
                                </FileItem>
                            );
                        })
                ) : (
                    <FileItem nodeId='stub' />
                )}
                {createItemInProgress && contextMenuItems && contextMenuItems["item"] === path ? (
                    <FileItem
                        nodeId='new_item'
                        label={
                            <NewItemInput
                                handleKeyPress={handleNewItemKeyPress}
                                command={command}
                            />
                        }
                    />
                ) : null}
            </Fragment>
        );
    };

    const renderProjectItem = (projectItem: IProjectMetadata) => {
        if (projectItem.id !== activeProject?.id) {
            return (
                <Tooltip title={projectItem?.path} placement='bottom-end'>
                    <ProjectItem onDoubleClick={() => changeActiveProject(projectItem?.id)}>
                        <LockIcon
                            style={{
                                fontSize: "16px",
                                marginBottom: "-3px",
                                marginRight: "4px",
                            }}
                        />
                        {projectItem?.name}
                    </ProjectItem>
                </Tooltip>
            );
        } else {
            return (
                <Tooltip title={projectItem?.path} placement='bottom-end'>
                    <FileTree
                        aria-label='file system navigator'
                        defaultCollapseIcon={<ExpandMoreIcon />}
                        defaultExpandIcon={<ChevronRightIcon />}
                        sx={{
                            height: 240,
                            flexGrow: 1,
                            maxWidth: 400,
                            overflowY: "auto",
                        }}
                        expanded={expandedDirs}
                        onNodeToggle={handleDirToggle}
                    >
                        {activeProject != null && (
                            <FileItem
                                nodeId={relativeProjectPath}
                                data-cy={CypressIds.projectRoot}
                                label={activeProject?.name}
                                onContextMenu={(event: React.MouseEvent) => {
                                    openContextMenu(
                                        event,
                                        relativeProjectPath,
                                        relativeProjectPath,
                                        false,
                                        false
                                    );
                                }}
                            >
                                {renderFileItems(relativeProjectPath)}
                            </FileItem>
                        )}
                    </FileTree>
                </Tooltip>
            );
        }
    };

    return (
        <Fragment>
            <ProjectToolbar>
                <FileExplorerHeaderName variant='overline'>Projects</FileExplorerHeaderName>
                <Tooltip
                    title='Add project'
                    enterDelay={500}
                    placement='bottom-end'
                    style={{ marginLeft: "auto" }}
                >
                    <AddBoxIcon
                        id='add-project-button'
                        onClick={handleAddProjectBtn}
                        fontSize='small'
                        style={{ cursor: "pointer" }}
                    />
                </Tooltip>
                {/* <Tooltip title="Add folder" enterDelay={500} placement="bottom-end">
                    <CreateNewFolderIcon fontSize="small" style={{ cursor: "pointer" }} />
                </Tooltip>
                <Tooltip title="Add file" enterDelay={500} placement="bottom-end">
                    <NoteAddIcon fontSize="small" style={{ cursor: "pointer" }} />
                </Tooltip> */}
            </ProjectToolbar>
            <div>
                {workspaceMetadata.open_projects.map((item) => renderProjectItem(item))}
                {createProjectInProgress ? (
                    <Fragment>
                        <NewItemInput
                            id='new-project-input'
                            handleKeyPress={handleNewProjectKeyPress}
                            command={ProjectCommand.add_project}
                            style={{ marginLeft: "10px" }}
                        />
                        {txtError != null ? <ErrorText>{txtError}</ErrorText> : null}
                    </Fragment>
                ) : null}
            </div>
            <FileContextMenu
                contextMenuPos={contextMenuPos}
                handleClose={closeContextMenu}
                handleSelection={selectContextMenuItem}
                contextMenuItem={contextMenuItems}
            />
            {deleteDialog && contextMenuItems?.item != null && (
                <DeleteConfirmation
                    deleteDialog={deleteDialog}
                    confirmDelete={handleDeleteDialogClose}
                    itemName={contextMenuItems?.item}
                />
            )}
        </Fragment>
    );
};

export default FileExplorer;
