import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initCodeDoc, setFileSaved } from "../../../redux/reducers/CodeEditorRedux";
import { setOpenFiles } from "../../../redux/reducers/FileManagerRedux";
import store from '../../../redux/store';
import { CommandName, ContentType, Message, WebAppEndpoint } from "../../interfaces/IApp";
import { FileCommandName, IFileMetadata } from "../../interfaces/IFileManager";
import socket from "../Socket";

function FileManager() {
    const dispatch = useDispatch();
    const inViewID = useSelector(state => state.fileManager.inViewID);
    const codeText = useSelector(state => state.codeEditor.text);  
    const [codeTextUpdated, setcodeTextUpdated] = useState(false);    
    // using this to avoid saving the file when we load code doc for the first time
    const [codeTextInit, setcodeTextInit] = useState(0);
    const [timerExpire, setTimerExpire] = useState(false);
    
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
                        setcodeTextInit(1);
                        break;
                    case FileCommandName.save_file:
                        console.log('Get save file result: ', fmResult);
                        dispatch(setFileSaved());
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

    // called when the in-view file changed
    useEffect(() => {
        let state = store.getState();
        if(inViewID){
            let file: IFileMetadata = state.fileManager.openFiles[inViewID];
            let message: Message = _createMessage(FileCommandName.read_file, '', 1, {path: file.path});
            console.log('FileManager send:', message);        
            _sendMessage(message);
        }
    }, [inViewID])

    const SAVE_FILE_DURATION = 1000;
    function saveFile(){
        if(codeTextUpdated && codeText){
            setcodeTextUpdated(false);
            let state = store.getState();
            let file: IFileMetadata = state.fileManager.openFiles[inViewID];
            let message: Message = _createMessage(FileCommandName.save_file, codeText.join('\n'), 1, {path: file.path});
            console.log('FileManager send:', message.command_name);        
            // console.log('FileManager send:', message);        
            _sendMessage(message);
        }
    }

    useEffect(() => {
        setTimerExpire(false);
        saveFile();
    }, [timerExpire])

    useEffect(() => {
        if(codeTextInit==1){
            console.log('codeText update', codeTextUpdated);
            setcodeTextUpdated(true);
        }
    }, [codeText])

    useEffect(() => {
        _setup_socket();        
        let message: Message = _createMessage(FileCommandName.get_open_files, '', 1);
        _sendMessage(message);
        const saveFileTimer = setInterval(() => {setTimerExpire(timerExpire => true)}, SAVE_FILE_DURATION);
        return () => clearInterval(saveFileTimer);
    }, []); //run this only once - not on rerender

    return null;
}

export default FileManager