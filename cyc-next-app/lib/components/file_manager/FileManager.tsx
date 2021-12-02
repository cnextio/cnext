import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initCodeDoc } from "../../../redux/reducers/CodeEditorRedux";
import { setOpenFiles } from "../../../redux/reducers/FileManagerRedux";
import store from '../../../redux/store';
import { CommandName, ContentType, Message, WebAppEndpoint } from "../../interfaces/IApp";
import { FileCommandName, FileMetadata } from "../../interfaces/IFileManager";
import socket from "../Socket";

function FileManager() {
    const dispatch = useDispatch();
    const inViewID = useSelector(state => state.fileManager.inViewID);

    function _setup_socket(){
        socket.emit("ping", "FileManager");
        socket.on(WebAppEndpoint.FileManager, (result: string) => {
            console.log("FileManager got results...", result);
            try {
                let fmResult: Message = JSON.parse(result);                
                switch(fmResult.command_name) {
                    case FileCommandName.get_open_files: 
                        console.log('Get open files: ', fmResult.content);
                        dispatch(setOpenFiles(fmResult.content));                        
                        break;
                    case FileCommandName.read_file:
                        // console.log('Get file content: ', fmResult.content);
                        console.log('Get file content...');
                        dispatch(initCodeDoc({text: fmResult.content}));
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

    function _createMessage(command_name: FileCommandName, content: string, seq_number: number, metadata: {} = {}): Message {
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

    useEffect(() => {
        let state = store.getState();
        if(inViewID){
            let file: FileMetadata = state.fileManager.openFiles[inViewID];
            let message: Message = _createMessage(FileCommandName.read_file, '', 1, {path: file.path});
            console.log('FileManager send:', message);        
            _sendMessage(message);
        }
    }, [inViewID])

    useEffect(() => {
        _setup_socket();        
        let message: Message = _createMessage(FileCommandName.get_open_files, '', 1);
        _sendMessage(message);
    }, []); //run this only once - not on rerender

    return null;
}

export default FileManager