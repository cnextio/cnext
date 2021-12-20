import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initCodeDoc, setFileSaved } from "../../../redux/reducers/CodeEditorRedux";
import { setActiveProject, setOpenFiles } from "../../../redux/reducers/ProjectManagerRedux";
import store from '../../../redux/store';
import { CommandName, ContentType, Message, WebAppEndpoint } from "../../interfaces/IApp";
import { ProjectCommand, IFileMetadata } from "../../interfaces/IFileManager";
import socket from "../Socket";

function FileManager() {
    const dispatch = useDispatch();
    const inViewID = useSelector(state => state.projectManager.inViewID);
    const codeText = useSelector(state => state.codeEditor.text);  
    const [codeTextUpdated, setcodeTextUpdated] = useState(false);    
    // using this to avoid saving the file when we load code doc for the first time
    const [codeTextInit, setcodeTextInit] = useState(0);
    const [saveTimer, setSaveTimer] = useState(false);
    
    function _setup_socket(){
        socket.emit("ping", "FileManager");
        socket.on(WebAppEndpoint.FileManager, (result: string) => {
            console.log("FileManager got results...", result);
            try {
                let fmResult: Message = JSON.parse(result);                
                switch(fmResult.command_name) {
                    case ProjectCommand.get_open_files: 
                        console.log('FileManager get open files: ', fmResult.content);
                        dispatch(setOpenFiles(fmResult.content));                        
                        break;
                    case ProjectCommand.read_file:
                        // console.log('Get file content: ', fmResult.content);
                        console.log('FileManager get file content...');
                        dispatch(initCodeDoc({text: fmResult.content}));
                        setcodeTextInit(1);
                        break;
                    case ProjectCommand.save_file:
                        console.log('FileManager get save file result: ', fmResult);
                        dispatch(setFileSaved(null));
                        break;
                    case ProjectCommand.get_active_project:
                        console.log('FileManager get active project result: ', fmResult);
                        let message: Message = _createMessage(ProjectCommand.get_open_files, '', 1);
                        _sendMessage(message);
                        dispatch(setActiveProject(fmResult.content));
                        break;
                } 
            } catch(error) {
                throw(error);
            }
        });
    };

    const _sendMessage = (message: Message) => {
        console.log(`Send ${WebAppEndpoint.FileManager} request: `, JSON.stringify(message));
        socket.emit(WebAppEndpoint.FileManager, JSON.stringify(message));
    }

    function _createMessage(command_name: ProjectCommand, content: string, seq_number: number, metadata: {} = {}): Message {
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
            console.log('FileManager send:', message);        
            _sendMessage(message);
        }
    }, [inViewID])

    const SAVE_FILE_DURATION = 1000;
    function saveFile(){
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