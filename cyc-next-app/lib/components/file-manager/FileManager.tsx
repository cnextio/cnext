import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initCodeDoc, setFileSaved } from "../../../redux/reducers/CodeEditorRedux";
import { setActiveProject, setFileToClose, setFileToOpen, setInView, setOpenFiles } from "../../../redux/reducers/ProjectManagerRedux";
import store from '../../../redux/store';
import { CommandName, ContentType, Message, WebAppEndpoint } from "../../interfaces/IApp";
import { ProjectCommand, IFileMetadata } from "../../interfaces/IFileManager";
import socket from "../Socket";

const FileManager = () => {
    const dispatch = useDispatch();
    const inViewID = useSelector(state => state.projectManager.inViewID);
    const fileToClose = useSelector(state => state.projectManager.fileToClose);
    const fileToOpen = useSelector(state => state.projectManager.fileToOpen);
    const codeText = useSelector(state => state.codeEditor.text);  
    const [codeTextUpdated, setcodeTextUpdated] = useState(false);    
    // using this to avoid saving the file when we load code doc for the first time
    const [codeTextInit, setcodeTextInit] = useState(0);
    const [saveTimer, setSaveTimer] = useState(false);
    
    const _setup_socket = () => {
        socket.emit("ping", "FileManager");
        socket.on(WebAppEndpoint.FileManager, (result: string) => {
            console.log("FileManager got results...", result);
            try {
                let fmResult: Message = JSON.parse(result);
                if(!fmResult.error){                
                    switch(fmResult.command_name) {
                        case ProjectCommand.get_open_files: 
                            console.log('FileManager got open files: ', fmResult.content);
                            dispatch(setOpenFiles(fmResult.content));                        
                            break;
                        case ProjectCommand.read_file:
                            // console.log('Get file content: ', fmResult.content);
                            console.log('FileManager got file content...');
                            dispatch(initCodeDoc({text: fmResult.content}));
                            setcodeTextInit(1);
                            break;
                        case ProjectCommand.save_file:
                            console.log('FileManager got save file result: ', fmResult);
                            dispatch(setFileSaved(null));
                            break;
                        case ProjectCommand.close_file:
                            console.log('FileManager got close file result: ', fmResult);
                            dispatch(setFileToClose(null));
                            dispatch(setOpenFiles(fmResult.content));   
                            break;
                        case ProjectCommand.open_file:
                            console.log('FileManager got open file result: ', fmResult);
                            dispatch(setFileToOpen(null));
                            dispatch(setOpenFiles(fmResult.content));   
                            dispatch(setInView(fmResult.metadata['path']));
                            break;
                        case ProjectCommand.get_active_project:
                            console.log('FileManager got active project result: ', fmResult);
                            let message: Message = _createMessage(ProjectCommand.get_open_files, '', 1);
                            _sendMessage(message);
                            dispatch(setActiveProject(fmResult.content));
                            break;
                    } 
                } else {
                    //TODO: send error to ouput
                    console.log('FileManager command error: ', fmResult);
                }
            } catch(error) {
                throw(error);
            }
        });
    };

    const _sendMessage = (message: Message) => {
        console.log(`FileManager ${message.webapp_endpoint} send  message: `, JSON.stringify(message));
        socket.emit(message.webapp_endpoint, JSON.stringify(message));
    }

    const _createMessage = (command_name: ProjectCommand, content: string, seq_number: number, metadata: {} = {}): Message => {
        let message: Message = {
            webapp_endpoint: WebAppEndpoint.FileManager,
            command_name: command_name,
            content_type: ContentType.COMMAND,
            seq_number: seq_number,
            content: content,
            metadata: metadata,
            error: false
        };
        return message;
    }

    // called when the in-view file changed
    useEffect(() => {
        let state = store.getState();
        if(inViewID){
            let file: IFileMetadata = state.projectManager.openFiles[inViewID];
            let message: Message = _createMessage(ProjectCommand.read_file, '', 1, {path: file.path});    
            _sendMessage(message);
        }
    }, [inViewID])

    useEffect(() => {
        if (fileToClose){
            // TODO: make sure the file is saved before being closed
            let message: Message = _createMessage(ProjectCommand.close_file, '', 1, {path: fileToClose});    
            _sendMessage(message);
        }        
    }, [fileToClose])

    useEffect(() => {
        if (fileToOpen){
            // TODO: make sure the file is saved before being closed
            let message: Message = _createMessage(ProjectCommand.open_file, '', 1, {path: fileToOpen});    
            _sendMessage(message);
        }        
    }, [fileToOpen])

    const SAVE_FILE_DURATION = 1000;
    const saveFile = () => {
        if(codeTextUpdated && codeText){
            setcodeTextUpdated(false);
            let state = store.getState();
            let file: IFileMetadata = state.projectManager.openFiles[inViewID];
            let message: Message = _createMessage(ProjectCommand.save_file, codeText.join('\n'), 1, {path: file.path});
            console.log('FileManager send:', message.command_name);        
            // console.log('FileManager send:', message);        
            _sendMessage(message);
        }
    }

    useEffect(() => {
        setSaveTimer(false);
        saveFile();
    }, [saveTimer])

    useEffect(() => {
        if(codeTextInit==1){
            console.log('codeText update', codeTextUpdated);
            setcodeTextUpdated(true);
        }
    }, [codeText])

    useEffect(() => {
        _setup_socket();        
        let message: Message = _createMessage(ProjectCommand.get_active_project, '', 1);
        // let message: Message = _createMessage(ProjectCommandName.get_open_files, '', 1);
        _sendMessage(message);
        const saveFileTimer = setInterval(() => {setSaveTimer(timerExpire => true)}, SAVE_FILE_DURATION);
        return () => clearInterval(saveFileTimer);
    }, []); //run this only once - not on rerender

    return null;
}

export default FileManager