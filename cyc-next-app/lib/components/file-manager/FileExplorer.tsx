import React, { Fragment, useEffect, useRef, useState } from "react";
import { 
    CodeToolbar as FileExporerHeader, 
    FileExplorerHeaderName, 
    FileTree, 
    FileItem
} from "../StyledComponents";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useDispatch, useSelector } from "react-redux";
import { FileContextMenuItem, IDirectoryMetadata, IDirListResult, IProjectMetadata, ProjectCommand } from "../../interfaces/IFileManager";
import { ContentType, Message, WebAppEndpoint } from "../../interfaces/IApp";
import socket from "../Socket";
import { setFileToOpen, setInView, setOpenDir, setOpenFiles } from "../../../redux/reducers/ProjectManagerRedux";
import FileContextMenu from "./FileContextMenu";
import NewItemInput from "./NewItemInput";
import DeleteConfirmation from "./DeleteConfirmation";

interface ContextMenuInfo {
    parent: string,
    item: string,
    is_file?: boolean,
}

const FileExplorer = (props: any) => {  
    const activeProject: IProjectMetadata = useSelector(state => state.projectManager.activeProject);
    const openDirs: {[id: string]: IDirectoryMetadata[]} = useSelector(state => state.projectManager.openDirs);
    // const [clickedItemParent, setClickedItemParent] = useState<string|null>(null);
    const [contextMenuItems, setContextMenuItems] = useState<ContextMenuInfo|null>(null);
    const [createItemInProgress, setCreateItemInProgress] = useState<boolean>(false);
    const [deleteItemInProgress, setDeleteItemInProgress] = useState<boolean>(false);
    const [expanded, setExpanded] = React.useState([]);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const dispatch = useDispatch();

    const _setup_socket = () => {
        socket.emit("ping", "FileExplorer");
        socket.on(WebAppEndpoint.FileExplorer, (result: string) => {
            console.log("FileExplorer got results...", result);
            try {
                let fmResult: Message = JSON.parse(result);                
                switch(fmResult.command_name) {
                    case ProjectCommand.list_dir: 
                        console.log('FileExplorer got list dir: ', fmResult.content);
                        if (fmResult.content_type == ContentType.DIR_LIST){
                            const dirs: IDirectoryMetadata[]|null = fmResult.content; 
                            if (dirs) {
                                const data: IDirListResult = {id: fmResult.metadata['path'], dirs: dirs}
                                dispatch(setOpenDir(data))
                            }
                        } 
                        break;
                    case ProjectCommand.create_file: 
                        console.log('FileExplorer got create_file: ', fmResult);
                        dispatch(setOpenFiles(fmResult.content));   
                        dispatch(setInView(fmResult.metadata['path']));                         
                        break;
                    case ProjectCommand.delete: 
                        console.log('FileExplorer got delete: ', fmResult);
                        dispatch(setOpenFiles(fmResult.content));   
                        // setDeleteItemInProgress(false);
                        // dispatch(setInView(fmResult.metadata['path']));                         
                        break;
                } 
            } catch(error) {
                throw(error);
            }
        });
    };
    useEffect(()=>{
        _setup_socket();
    }, []);

    const _create_message = (command: ProjectCommand, metadata: {}): Message => {
        let message: Message = {
            webapp_endpoint: WebAppEndpoint.FileExplorer,
            command_name: command,
            seq_number: 1,
            content: null,
            content_type: ContentType.STRING,
            error: false,
            metadata: metadata
        };    
        return message;
    }

    const _send_message = (message: Message) => {
        socket.emit(message.webapp_endpoint, JSON.stringify(message));
    }

    const fetchChildNodes = (id: string) => {
        let message: Message = _create_message(ProjectCommand.list_dir, {path: id});
        _send_message(message);
    };

    const handleChange = (event, nodes) => {
        // console.log('FileExplorer', nodes);
        const expandingNodes = nodes.filter(node => !expanded.includes(node));
        setExpanded(nodes);
        const dirID = expandingNodes[0];
        if (dirID) {
            fetchChildNodes(dirID);
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
    const handleItemContextMenu = (event: React.MouseEvent, clickedItem: string, 
        parentItem: string, is_file: boolean) => {
        event.preventDefault();
        event.stopPropagation();
        console.log('FileExplorer: ', clickedItem, parentItem);        
        setContextMenuPos(
            contextMenuPos === null
            ? {
                mouseX: event.clientX - 2,
                mouseY: event.clientY - 4,
            }
            : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
            // Other native context menus might behave different.
            // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
            null,
        );
        setContextMenuItems({parent: parentItem, item: clickedItem, is_file: is_file});
    }

    const handleContextMenuSelection = (item: FileContextMenuItem) => {
        // console.log('FileExplorer: ', item);
        switch (item){
            case FileContextMenuItem.NEW_FILE: 
                if (contextMenuItems){
                    setCreateItemInProgress(true);
                }
                break;
            case FileContextMenuItem.DELETE: 
                if (contextMenuItems){
                    // FIXME: this is a hack for now to avoid main.py being deleted
                    if(contextMenuItems.item.split('/').at(-1)==='main.py'){
                        // do nothing
                        break;
                    }
                    // setRemoveItemInProgress(true);
                    setDeleteDialog(true);
                }
                break;
        }        
        setContextMenuPos(null);
    };

    const handleContextMenuClose = () => {
        setContextMenuPos(null);
    };

    const validateFileName = (name: string) => {
        return (name.split(".")[0].length>0);
    };

    const handleNewItemKeyPress = (event: React.KeyboardEvent, value: string) => {
        // console.log('FileExplorer', event.key);
        if (event.key === 'Enter') {
            if(validateFileName(value) && contextMenuItems){
                console.log('FileExplorer: ', );                
                let fileName = contextMenuItems.parent+'/'+value;
                let message = _create_message(ProjectCommand.create_file, {path: fileName});
                _send_message(message);
                fetchChildNodes(contextMenuItems.parent);
            }
            setCreateItemInProgress(false);            
        } else if (event.key === 'Escape') {            
            setCreateItemInProgress(false);
        }
    }
    
    const generateFileItems = (path: string) => {
        return (
            <Fragment>
                {Object.keys(openDirs).includes(path) ?
                openDirs[path]
                .filter(value => value.name.substring(0, 1)!=='.')
                .sort(function(a, b){
                    if(a.name < b.name) { return -1; }
                    if(a.name > b.name) { return 1; }
                    return 0;
                })
                .map((value, index) => {
                    // {console.log('FileExplorer openDirs: ', value)}
                    return (
                        <FileItem 
                            nodeId = {value.path} 
                            label = {value.name}
                            onDoubleClick = {() => {value.is_file ? dispatch(setFileToOpen(value.path)) : null}}
                            onContextMenu = {
                                (event: React.MouseEvent) => 
                                {handleItemContextMenu(event, value.path, path, value.is_file)}
                            }
                        >
                            {!value.is_file && generateFileItems(value.path)}
                        </FileItem>                        
                    );
                }) : <FileItem nodeId='stub'/>}
                {createItemInProgress && contextMenuItems && contextMenuItems['parent']===path ? 
                <FileItem
                    nodeId = 'new_item' 
                    label = {
                        <NewItemInput handleKeyPress={handleNewItemKeyPress}/>
                    }
                /> 
                : null}
            </Fragment>
        )        
    }
    
    const handleDeleteDialogClose = (confirm) => {
        if (confirm && contextMenuItems){
            let message = _create_message(ProjectCommand.delete, 
                {path: contextMenuItems.item, is_file: contextMenuItems.is_file});
            _send_message(message);
            fetchChildNodes(contextMenuItems.parent);
        }        
        setDeleteDialog(false);
    }

    return (
        <Fragment>
            <FileExporerHeader>
                <FileExplorerHeaderName  variant='overline'>
                    File Manager
                </FileExplorerHeaderName>                                   
            </FileExporerHeader>
            {activeProject ? 
            <FileTree
                aria-label="file system navigator"
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                sx={{ height: 240, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
                expanded={expanded}
                onNodeToggle={handleChange}
            >
                <FileItem 
                    nodeId={activeProject.path} 
                    label={activeProject.name}
                >
                    {generateFileItems(activeProject.path)}                    
                </FileItem>
            </FileTree> : null}
            <FileContextMenu 
                contextMenu={contextMenuPos} 
                handleClose={handleContextMenuClose} 
                handleSelection={handleContextMenuSelection}
            />
            <DeleteConfirmation 
                deleteDialog={deleteDialog}
                confirmDelete={handleDeleteDialogClose}
                itemName={contextMenuItems?.item}
            />
        </Fragment>    
    );
};

export default FileExplorer;