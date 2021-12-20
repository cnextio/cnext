import React, { Fragment, useEffect, useState } from "react";
import { CodeToolbar as FileExporerHeader, FileExplorerHeaderName, FileTree, FileItem } from "../StyledComponents";

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useDispatch, useSelector } from "react-redux";
import { IDirectoryMetadata, IDirListResult, IProjectMetadata, ProjectCommand } from "../../interfaces/IFileManager";
import { ContentType, Message, WebAppEndpoint } from "../../interfaces/IApp";
import socket from "../Socket";
import { setOpenDir } from "../../../redux/reducers/ProjectManagerRedux";

const FileExplorer = (props: any) => {  
    const activeProject: IProjectMetadata = useSelector(state => state.projectManager.activeProject);
    const openDirs: {[id: string]: IDirectoryMetadata[]} = useSelector(state => state.projectManager.openDirs);
    const [childNodes, setChildNodes] = useState<JSX.Element[]|null>(null);
    const [expanded, setExpanded] = React.useState([]);
    const dispatch = useDispatch();

    function _setup_socket(){
        socket.emit("ping", "FileExplorer");
        socket.on(WebAppEndpoint.FileExplorer, (result: string) => {
            console.log("FileExplorer got results...", result);
            try {
                let fmResult: Message = JSON.parse(result);                
                switch(fmResult.command_name) {
                    case ProjectCommand.list_dir: 
                        // console.log('FileExplorer get list dir: ', fmResult.content);
                        if (fmResult.content_type == ContentType.DIR_LIST){
                            const dirs: IDirectoryMetadata[]|null = fmResult.content; 
                            if (dirs) {
                                const data: IDirListResult = {id: fmResult.metadata['path'], dirs: dirs}
                                dispatch(setOpenDir(data))
                            }
                        } 
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

    function _create_message(command: ProjectCommand, metadata: {}): Message {
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

    function _send_message(message: Message) {
        socket.emit(message.webapp_endpoint, JSON.stringify(message));
    }

    function fetchChildNodes(id: string) {
        let message: Message = _create_message(ProjectCommand.list_dir, {path: id});
        _send_message(message);
    };

    function handleChange(event, nodes) {
        // console.log('FileExplorer', nodes);
        const expandingNodes = nodes.filter(node => !expanded.includes(node));
        setExpanded(nodes);
        const dirID = expandingNodes[0];
        if (dirID) {
            fetchChildNodes(dirID);
        }
    };

    function createChildren(path){
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
                        <FileItem nodeId={value.path} label={value.name}>
                            {!value.is_file && createChildren(value.path)}
                        </FileItem>
                    );
                }) : <FileItem nodeId='stub'/>}
            </Fragment>
        )        
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
                <FileItem nodeId={activeProject.path} label={activeProject.name}>
                    {createChildren(activeProject.path)}                    
                </FileItem>
            </FileTree> : null}
        </Fragment>    
    );
};

export default FileExplorer;