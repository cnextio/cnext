import React, { Fragment, useEffect, useState } from "react";
import path from "path";
import {
    CodeToolbar as FileExporerHeader,
    FileExplorerHeaderName,
    FileTree,
    FileItem,
} from "../StyledComponents";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useDispatch, useSelector } from "react-redux";
import {
    FileContextMenuItem,
    IDirectoryMetadata,
    IDirListResult,
    IFileMetadata,
    IProjectMetadata,
    ProjectCommand,
} from "../../interfaces/IFileManager";
import { ContentType, IMessage, WebAppEndpoint } from "../../interfaces/IApp";
import socket from "../Socket";
import {
    setFileToOpen,
    setInView,
    setOpenDir,
    setOpenFiles,
} from "../../../redux/reducers/ProjectManagerRedux";
import FileContextMenu from "./FileContextMenu";
import NewItemInput from "./NewItemInput";
import DeleteConfirmation from "./DeleteConfirmation";
import store from "../../../redux/store";
import CypressIds from "../tests/CypressIds";

interface ContextMenuInfo {
    parent: string;
    item: string;
    is_file?: boolean;
}

const FileExplorer = (props: any) => {
    const activeProject: IProjectMetadata = useSelector(
        (state) => state.projectManager.activeProject
    );
    const openDirs: { [id: string]: IDirectoryMetadata[] } = useSelector(
        (state) => state.projectManager.openDirs
    );
    // const [clickedItemParent, setClickedItemParent] = useState<string|null>(null);
    const [contextMenuItems, setContextMenuItems] = useState<ContextMenuInfo | null>(null);
    const [createItemInProgress, setCreateItemInProgress] = useState<boolean>(false);
    const [command, setProjectCommand] = useState<
        ProjectCommand.create_file | ProjectCommand.create_folder | null
    >(null);
    const [expanded, setExpanded] = useState<Array<string>>([]);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const dispatch = useDispatch();

    const setupSocket = () => {
        socket.emit("ping", "FileExplorer");
        socket.on(WebAppEndpoint.FileExplorer, (result: string) => {
            console.log("FileExplorer got results...", result);
            try {
                let fmResult: IMessage = JSON.parse(result);
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
                        let openFiles: IFileMetadata[] = fmResult.content;
                        dispatch(setOpenFiles(openFiles));
                        if (openFiles.length > 0) {
                            dispatch(setInView(openFiles[0].path));
                        }
                        break;
                }
            } catch (error) {
                throw error;
            }
        });
    };
    useEffect(() => {
        setupSocket();
        return () => {
            socket.off(WebAppEndpoint.FileExplorer);
        };
    }, []);

    const createMessage = (command: ProjectCommand, metadata: {}): IMessage => {
        let message: IMessage = {
            webapp_endpoint: WebAppEndpoint.FileExplorer,
            command_name: command,
            seq_number: 1,
            content: null,
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
        const expandingNodes = nodes.filter((node) => !expanded.includes(node));
        setExpanded(nodes);
        const dirID = expandingNodes[0];
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
                    const newExpanded = [...expanded, contextMenuItems.item];
                    setExpanded([...new Set(newExpanded)]); // Remove duplicate expanded note ID
                    setProjectCommand(ProjectCommand.create_file);
                    setCreateItemInProgress(true);
                }
                break;
            case FileContextMenuItem.NEW_FOLDER:
                if (contextMenuItems) {
                    // Expanded the folder when creating new file
                    const newExpanded = [...expanded, contextMenuItems.item];
                    setExpanded([...new Set(newExpanded)]); // Remove duplicate expanded note ID
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

    const generateFileItems = (path: string) => {
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
                                    {!value.is_file && generateFileItems(value.path)}
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

    return (
        <Fragment>
            <FileExporerHeader>
                <FileExplorerHeaderName variant='overline'>Projects</FileExplorerHeaderName>
            </FileExporerHeader>
            {activeProject ? (
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
                    expanded={expanded}
                    onNodeToggle={handleDirToggle}
                >
                    <FileItem
                        nodeId={relativeProjectPath}
                        data-cy={CypressIds.projectRoot}
                        label={activeProject.name}
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
                        {generateFileItems(relativeProjectPath)}
                    </FileItem>
                </FileTree>
            ) : null}
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
