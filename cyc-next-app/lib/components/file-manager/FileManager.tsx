import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    initCodeText,
    setFileSaved,
} from "../../../redux/reducers/CodeEditorRedux";
import {
    setActiveProject,
    setFileMetaData,
    setFileToClose,
    setFileToOpen,
    setFileToSave,
    setFileToSaveState,
    setInView,
    setOpenFiles,
    setServerSynced,
} from "../../../redux/reducers/ProjectManagerRedux";
import store from "../../../redux/store";
import {
    CommandName,
    ContentType,
    Message,
    WebAppEndpoint,
} from "../../interfaces/IApp";
import { ICodeText, ICodeLine } from "../../interfaces/ICodeEditor";
import { ProjectCommand, IFileMetadata } from "../../interfaces/IFileManager";
import { ifElse } from "../libs";
import socket from "../Socket";

const FileManager = () => {
    const dispatch = useDispatch();
    const inViewID = useSelector((state) => state.projectManager.inViewID);
    const fileToClose = useSelector((state) => state.projectManager.fileToClose);
    const fileToOpen = useSelector((state) => state.projectManager.fileToOpen);
    const fileToSave = useSelector((state) => state.projectManager.fileToSave);
    const fileToSaveState = useSelector((state) => state.projectManager.fileToSaveState);
    const codeText = useSelector((state) => getCodeText(state));
    const codeLines = useSelector((state) => getCodeLines(state));
    const [codeTextUpdated, setCodeTextUpdated] = useState(false);
    // using this to avoid saving the file when we load code doc for the first time
    const [codeTextInit, setcodeTextInit] = useState(0);
    const [saveTimer, setSaveTimer] = useState<NodeJS.Timer | null>(null);
    const [saveTimeout, setSaveTimeout] = useState(false);

    const _setup_socket = () => {
        socket.emit("ping", "FileManager");
        socket.on(WebAppEndpoint.FileManager, (result: string) => {
            console.log("FileManager got results...", result);
            try {
                let fmResult: Message = JSON.parse(result);
                let state = store.getState();
                /** can't use inViewID from useSelector because this function is defined only once */
                let inViewID = state.projectManager.inViewID;
                if (!fmResult.error) {
                    switch (fmResult.command_name) {
                        case ProjectCommand.get_open_files:
                            console.log("FileManager got open_files result: ", fmResult.content);
                            dispatch(setOpenFiles(fmResult.content));
                            break;
                        case ProjectCommand.read_file:
                            if (inViewID) {
                                // console.log('Get file content: ', fmResult.content);
                                console.log("FileManager got read_file result: ", fmResult);
                                if (fmResult.type === ContentType.FILE_CONTENT) {
                                    let reduxCodeText: ICodeText = {
                                        reduxFileID: inViewID,
                                        codeText: fmResult.content["content"],
                                        codeLines: fmResult.content["code_lines"],
                                        // timestamp: fmResult.content['timestamp']
                                    };
                                    dispatch(initCodeText(reduxCodeText));

                                    /** update file timestamp */
                                    let fileMetadata = {
                                        ...store.getState().projectManager.openFiles[inViewID],
                                    };
                                    fileMetadata.timestamp = fmResult.content["timestamp"];
                                    dispatch(setFileMetaData(fileMetadata));
                                }
                                dispatch(setServerSynced(true));
                                setcodeTextInit(1);
                            }
                            break;
                        case ProjectCommand.save_state:
                            console.log("FileManager got save_state result: ", fmResult);
                            if (fmResult.type === ContentType.FILE_METADATA) {
                                //TODO: remove stateSaved variable, use fileToSaveState only
                                // dispatch(setFileSaved(null));
                                dispatch(setFileToSaveState(null));
                            }
                        case ProjectCommand.save_file:
                            console.log("FileManager got save_file result: ", fmResult);
                            if (fmResult.type === ContentType.FILE_METADATA) {
                                //TODO: remove fileSaved variable, use fileToSave only
                                // fileSaved is current needed only in CodeToolbar
                                dispatch(setFileSaved(null));
                                dispatch(setFileToSave(null));

                                /** update file timestamp */
                                if (inViewID) {
                                    let fileMetadata = {
                                        ...store.getState().projectManager.openFiles[inViewID],
                                    };
                                    fileMetadata.timestamp = fmResult.content["timestamp"];
                                    dispatch(setFileMetaData(fileMetadata));
                                }
                            }
                            break;
                        case ProjectCommand.close_file:
                            console.log("FileManager got close_file result: ", fmResult);
                            dispatch(setFileToClose(null));
                            let openFiles: IFileMetadata[] = fmResult.content;
                            dispatch(setOpenFiles(openFiles));
                            if (openFiles.length > 0) {
                                dispatch(setInView(openFiles[0].path));
                            }
                            break;
                        case ProjectCommand.open_file:
                            console.log("FileManager got open_file result: ", fmResult);
                            dispatch(setFileToOpen(null));
                            dispatch(setOpenFiles(fmResult.content));
                            dispatch(setInView(fmResult.metadata["path"]));
                            break;
                        case ProjectCommand.get_active_project:
                            console.log("FileManager got active project result: ", fmResult);
                            let message: Message = _createMessage(
                                ProjectCommand.get_open_files,
                                "",
                                1
                            );
                            _sendMessage(message);
                            dispatch(setActiveProject(fmResult.content));
                            break;
                    }
                } else {
                    //TODO: send error to ouput
                    console.log("FileManager command error: ", fmResult);
                }
            } catch (error) {
                throw error;
            }
        });
    };

    function getCodeText(state) {
        let inViewID = state.projectManager.inViewID;
        if (inViewID) {
            return ifElse(state.codeEditor.codeText, inViewID, null);
        }
        return null;
    }

    function getCodeLines(state) {
        let inViewID = state.projectManager.inViewID;
        if (inViewID) {
            return ifElse(state.codeEditor.codeLines, inViewID, null);
        }
        return null;
    }

    const _sendMessage = (message: Message) => {
        console.log(
            `FileManager ${message.webapp_endpoint} send  message: `,
            JSON.stringify(message)
        );
        socket.emit(message.webapp_endpoint, JSON.stringify(message));
    };

    const _createMessage = (
        command_name: ProjectCommand,
        content: string | ICodeLine[],
        seq_number: number,
        metadata: {} = {}
    ): Message => {
        let message: Message = {
            webapp_endpoint: WebAppEndpoint.FileManager,
            command_name: command_name,
            type: ContentType.COMMAND,
            seq_number: seq_number,
            content: content,
            metadata: metadata,
            error: false,
        };
        return message;
    };

    const clearSaveConditions = () => {
        if (saveTimer) clearInterval(saveTimer);
        // TODO: the following line means if the previous code has not been saved it won't be saved
        // need to handle the on going saving before inViewID changed
        setCodeTextUpdated(false);
    };

    // called when the in-view file changed
    const SAVE_FILE_DURATION = 1000;
    useEffect(() => {
        clearSaveConditions();
        let state = store.getState();
        if (inViewID) {
            let file: IFileMetadata = state.projectManager.openFiles[inViewID];
            let message: Message = _createMessage(ProjectCommand.read_file, "", 1, {
                path: file.path,
                timestamp: file.timestamp,
            });
            _sendMessage(message);
            setSaveTimer(
                setInterval(() => {
                    setSaveTimeout(true);
                }, SAVE_FILE_DURATION)
            );
        }
    }, [inViewID]);

    useEffect(() => {
        if (fileToClose) {
            // TODO: make sure the file is saved before being closed
            let message: Message = _createMessage(ProjectCommand.close_file, "", 1, {
                path: fileToClose,
            });
            _sendMessage(message);
        }
    }, [fileToClose]);

    useEffect(() => {
        if (fileToOpen) {
            // TODO: make sure the file is saved before being closed
            let message: Message = _createMessage(ProjectCommand.open_file, "", 1, {
                path: fileToOpen,
            });
            _sendMessage(message);
        }
    }, [fileToOpen]);

    /**
     * This function will be called whenever there is a file to be saved
     * and saveTimeout changes the value. However, files will only be saved
     * if saveTimeout is true and there is file to be saved. Since file only
     * be saved when saveTimeout is true, the saving message will only be
     * sent out at most once every SAVE_FILE_DURATION
     */
    const saveFile = () => {
        // console.log('FileManager save file', codeTextUpdated);
        if (saveTimeout && fileToSave.length > 0 && codeText !== null) {
            console.log("FileManager: save file");
            for (let filePath of fileToSave) {
                let state = store.getState();
                let file: IFileMetadata = state.projectManager.openFiles[filePath];
                let codeText = state.codeEditor.codeText[filePath];
                let timestamp = state.codeEditor.timestamp[filePath];
                let message: Message = _createMessage(
                    ProjectCommand.save_file,
                    codeText.join("\n"),
                    1,
                    { path: file.path, timestamp: timestamp }
                );
                console.log("FileManager send:", message.command_name, message.metadata);
                // console.log('FileManager send:', message);
                _sendMessage(message);
                setSaveTimeout(false);
            }
        }
    };
    useEffect(() => {
        saveFile();
    }, [saveTimeout, fileToSave]);

    const saveState = () => {
        if (saveTimeout && fileToSaveState.length > 0 && codeLines !== null) {
            console.log("FileManager: save state");
            for (let filePath of fileToSaveState) {
                const state = store.getState();
                const codeLines = state.codeEditor.codeLines[filePath];
                const timestamp = state.codeEditor.timestamp[filePath];
                const message: Message = _createMessage(ProjectCommand.save_state, codeLines, 1, {
                    path: filePath,
                    timestamp: timestamp,
                });
                console.log("FileManager send:", message.command_name, message.metadata);
                _sendMessage(message);
                setSaveTimeout(false);
            }
        }
    };
    useEffect(() => {
        saveState();
    }, [saveTimeout, fileToSaveState]);

    /**
     * Use fileToSave and fileToSaveState instead of codeText to trigger saveFile and saveState so we can control
     * the situation where saving might fail and need to be retried. This is better
     * that messing up directly with codeText
     * */
    useEffect(() => {
        dispatch(setFileToSave(inViewID));
    }, [codeText]);

    useEffect(() => {
        dispatch(setFileToSaveState(inViewID));
    }, [codeLines]);

    useEffect(() => {
        _setup_socket();
        let message: Message = _createMessage(ProjectCommand.get_active_project, "", 1);
        // let message: Message = _createMessage(ProjectCommandName.get_open_files, '', 1);
        _sendMessage(message);
        // const saveFileTimer = setInterval(() => {saveFile()}, SAVE_FILE_DURATION);
        // return () => clearInterval(saveFileTimer);
    }, []); //run this only once - not on rerender

    return null;
};

export default FileManager;
