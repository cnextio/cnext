import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initCodeText, setFileSaved } from "../../../redux/reducers/CodeEditorRedux";
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
import store, { RootState } from "../../../redux/store";
import { ContentType, IMessage, SubContentType, WebAppEndpoint } from "../../interfaces/IApp";
import { ICodeText, ICodeLine } from "../../interfaces/ICodeEditor";
import { ProjectCommand, IFileMetadata } from "../../interfaces/IFileManager";
import { ifElse } from "../libs";
import socket from "../Socket";

const FileManager = () => {
    const dispatch = useDispatch();
    const inViewID = useSelector((state: RootState) => state.projectManager.inViewID);
    const fileToClose = useSelector((state: RootState) => state.projectManager.fileToClose);
    const fileToOpen = useSelector((state: RootState) => state.projectManager.fileToOpen);
    const fileToSave = useSelector((state: RootState) => state.projectManager.fileToSave);
    const fileToSaveState = useSelector((state: RootState) => state.projectManager.fileToSaveState);
    const codeText = useSelector((state: RootState) => getCodeText(state));
    const codeLines = useSelector((state: RootState) => getCodeLines(state));
    // const [codeTextUpdated, setCodeTextUpdated] = useState(false);
    // using this to avoid saving the file when we load code doc for the first time
    // const [codeTextInit, setcodeTextInit] = useState(0);
    const [saveTimer, setSaveTimer] = useState<NodeJS.Timer | null>(null);
    const [saveTimeout, setSaveTimeout] = useState(false);

    const _setup_socket = () => {
        socket.emit("ping", WebAppEndpoint.FileManager);
        socket.on(WebAppEndpoint.FileManager, (result: string) => {
            console.log("FileManager got results...", result);
            try {
                let fmResult: IMessage = JSON.parse(result);
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
                                    dispatch(setFileToSaveState(null));

                                    /** update file timestamp */
                                    let fileMetadata = {
                                        ...store.getState().projectManager.openFiles[inViewID],
                                    };
                                    fileMetadata.timestamp = fmResult.content["timestamp"];
                                    dispatch(setFileMetaData(fileMetadata));
                                }
                                /** make sure that this is only set to true after redux state has been updated.
                                 * Otherwise the save action will be triggered */
                                dispatch(setServerSynced(true));
                            }
                            break;
                        // case ProjectCommand.save_file:
                        //     console.log("FileManager got save_file result: ", fmResult);
                        //     if (fmResult.type === ContentType.FILE_METADATA) {
                        //         //TODO: remove fileSaved variable, use fileToSave only
                        //         // fileSaved is current needed only in CodeToolbar
                        //         dispatch(setFileSaved(null));
                        //         dispatch(setFileToSave(null));

                        //         /** update file timestamp */
                        //         if (inViewID) {
                        //             let fileMetadata = {
                        //                 ...store.getState().projectManager.openFiles[inViewID],
                        //             };
                        //             fileMetadata.timestamp = fmResult.content["timestamp"];
                        //             dispatch(setFileMetaData(fileMetadata));
                        //         }
                        //     }
                        //     break;
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
                        // case ProjectCommand.save_state:
                        //     console.log("FileManager got save_state result: ", fmResult);
                        //     if (fmResult.type === ContentType.FILE_METADATA) {
                        //         //TODO: remove stateSaved variable, use fileToSaveState only
                        //         dispatch(setFileToSaveState(null));
                        //     }
                        //     break;
                        case ProjectCommand.get_active_project:
                            console.log("FileManager got active project result: ", fmResult);
                            let message: IMessage = _createMessage(
                                ProjectCommand.get_open_files,
                                "",
                                1
                            );
                            sendMessage(message);
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

    function getCodeText(state: RootState) {
        let inViewID = state.projectManager.inViewID;
        if (inViewID) {
            return ifElse(state.codeEditor.codeText, inViewID, null);
        }
        return null;
    }

    function getCodeLines(state: RootState) {
        let inViewID = state.projectManager.inViewID;
        if (inViewID) {
            return ifElse(state.codeEditor.codeLines, inViewID, null);
        }
        return null;
    }

    const sendMessage = (message: IMessage) => {
        console.log(`${message.webapp_endpoint} send message: `, JSON.stringify(message));
        socket.emit(message.webapp_endpoint, JSON.stringify(message));
    };

    const _createMessage = (
        command_name: ProjectCommand,
        content: string | ICodeLine[] | null,
        seq_number: number,
        metadata: {} = {}
    ): IMessage => {
        let message: IMessage = {
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
        if (saveTimer) {
            clearInterval(saveTimer);
        }
        // TODO: the following line means if the previous code has not been saved it won't be saved
        // need to handle the on going saving before inViewID changed
        // setCodeTextUpdated(false);
    };

    // called when the in-view file changed
    const SAVE_FILE_DURATION = 10000;
    useEffect(() => {
        clearSaveConditions();

        const state = store.getState();
        // When changing file, trigger the saveFile & saveState function
        const saveFileAndState = async () => {
            await saveFile(false);
            await saveState(false);
        };
        saveFileAndState();

        if (inViewID) {
            const file: IFileMetadata = state.projectManager.openFiles[inViewID];
            const projectPath = state.projectManager.activeProject?.path;
            const message: IMessage = _createMessage(ProjectCommand.read_file, "", 1, {
                path: file.path,
                projectPath: projectPath,
                timestamp: file.timestamp,
            });
            sendMessage(message);
            setSaveTimer(
                setInterval(() => {
                    setSaveTimeout(true);
                }, SAVE_FILE_DURATION)
            );
        }
    }, [inViewID]);

    useEffect(() => {
        if (fileToClose) {
            // When changing file, trigger the saveFile & saveState function
            const saveFileAndState = async () => {
                await saveFile(false);
                await saveState(false);
            };
            saveFileAndState();

            let message: IMessage = _createMessage(ProjectCommand.close_file, "", 1, {
                path: fileToClose,
            });
            sendMessage(message);
        }
    }, [fileToClose]);

    useEffect(() => {
        if (fileToOpen) {
            // TODO: make sure the file is saved before being closed
            let message: IMessage = _createMessage(ProjectCommand.open_file, "", 1, {
                path: fileToOpen,
            });
            sendMessage(message);
        }
    }, [fileToOpen]);

    /**
     * This function will be called whenever there is a file to be saved
     * and saveTimeout changes the value. However, files will only be saved
     * if saveTimeout is true and there is file to be saved. Since file only
     * be saved when saveTimeout is true, the saving message will only be
     * sent out at most once every SAVE_FILE_DURATION
     */
    const saveFile = async (useTimeOut: boolean = true) => {
        const state = store.getState();
        const fileToSave = state.projectManager.fileToSave;
        if ((saveTimeout || !useTimeOut) && fileToSave.length > 0) {
            console.log("FileManager: save file");
            for (let filePath of fileToSave) {
                let file: IFileMetadata = state.projectManager.openFiles[filePath];
                let codeText = state.codeEditor.codeText[filePath];
                let timestamp = state.codeEditor.timestamp[filePath];
                let message: IMessage = _createMessage(
                    ProjectCommand.save_file,
                    codeText.join("\n"),
                    1,
                    { path: file.path, timestamp: timestamp }
                );
                console.log("FileManager send:", message.command_name, message.metadata);
                await sendMessage(message);
                setSaveTimeout(false);

                return new Promise((resolve) => {
                    socket.on(WebAppEndpoint.FileManager, (result: string) => {
                        try {
                            const output = JSON.parse(result);
                            if (
                                output.command_name === ProjectCommand.save_file &&
                                output.type === ContentType.FILE_METADATA &&
                                output.error == false
                            ) {
                                //TODO: remove stateSaved variable, use fileToSaveState only
                                dispatch(setFileSaved(null));
                                dispatch(setFileToSave(null));
                                let inViewID = store.getState().projectManager.inViewID;

                                /** update file timestamp */
                                if (inViewID) {
                                    let fileMetadata = {
                                        ...store.getState().projectManager.openFiles[inViewID],
                                    };
                                    fileMetadata.timestamp = output.content["timestamp"];
                                    dispatch(setFileMetaData(fileMetadata));
                                }

                                resolve(output);
                            }
                            resolve(null);
                        } catch {
                            resolve(null);
                        }
                    });
                });
            }
        }
    };
    useEffect(() => {
        console.log("FileManager useEffect: ", fileToSave);
        saveFile();
    }, [saveTimeout, fileToSave]);

    /**
     * This function will be called whenever display new results or group execute lines.
     * However, state will only be saved if there is state to be saved
     */
    const saveState = async (useTimeOut: boolean = true) => {
        const state = store.getState();
        const fileToSaveState = state.projectManager.fileToSaveState;
        if ((saveTimeout || !useTimeOut) && fileToSaveState.length > 0) {
            for (let filePath of fileToSaveState) {
                if (state.codeEditor.codeLines != null) {
                    const codeLines = state.codeEditor.codeLines[filePath];
                    // Avoid to save the text/html result because maybe it's audio/video files.
                    // Save these files make bad performance.
                    const codeLinesSaveState = codeLines.filter(
                        (codeLine) => codeLine.result?.subType !== SubContentType.TEXT_HTML
                    );
                    const timestamp = state.codeEditor.timestamp[filePath];
                    const projectPath = state.projectManager.activeProject?.path;
                    const message: IMessage = _createMessage(
                        ProjectCommand.save_state,
                        codeLinesSaveState,
                        1,
                        {
                            path: filePath,
                            projectPath: projectPath,
                            timestamp: timestamp,
                        }
                    );
                    await sendMessage(message);
                    setSaveTimeout(false);
                    return new Promise((resolve) => {
                        socket.on(WebAppEndpoint.FileManager, (result: string) => {
                            try {
                                const output = JSON.parse(result);
                                if (
                                    output.command_name === ProjectCommand.save_state &&
                                    output.type === ContentType.FILE_METADATA &&
                                    output.error == false
                                ) {
                                    //TODO: remove stateSaved variable, use fileToSaveState only
                                    dispatch(setFileToSaveState(null));
                                    resolve(output);
                                }
                                resolve(null);
                            } catch {
                                resolve(null);
                            }
                        });
                    });
                }
            }
        }
    };
    useEffect(() => {
        console.log("FileManager useEffect: ", fileToSaveState);
        saveState();
    }, [saveTimeout, fileToSaveState]);

    /**
     * Use fileToSave and fileToSaveState instead of codeText to trigger saveFile and saveState so we can control
     * the situation where saving might fail and need to be retried. This is better
     * than messing up directly with codeText.
     * Also, save condition will only be triggered after file has been loaded suscessfully into to redux codeLines and codeText
     * indicated by state.projectManager.serverSynced
     * */
    useEffect(() => {
        const state = store.getState();
        if (state.projectManager.serverSynced) {
            dispatch(setFileToSave(inViewID));
        }
    }, [codeText]);

    useEffect(() => {
        const state = store.getState();
        if (state.projectManager.serverSynced) {
            dispatch(setFileToSaveState(inViewID));
        }
    }, [codeLines]);

    /**
     * Save state & file immediately when refresh page or leave out the page
     * Use beforeunload event to detect it
     */
    const setUpSaveOnReloadEvent = () => {
        const handleBeforeUnload = async (e: any) => {
            e.preventDefault();
            // Have to trigger saveState() & saveFile() function directly because react hook is blocked in beforeunload event
            const resultSaveFile = await saveFile(false);
            const resultSaveState = await saveState(false);

            // Have to use triple equals to handle return result of saveState & saveFile function.
            // In case it doesn't satisfy the condition in top of saveState & saveFile, the result will be undefined
            // Other case it satisfy the condition then execute the send message, if have any errors with socket, the result is returend as null
            if (resultSaveState === null || resultSaveFile === null) {
                return (e.returnValue = "");
            }
        };

        if (process.browser) {
            window.addEventListener("beforeunload", handleBeforeUnload);

            return () => {
                window.removeEventListener("beforeunload", handleBeforeUnload);
            };
        }
    };

    useEffect(() => {
        _setup_socket();
        let message: IMessage = _createMessage(ProjectCommand.get_active_project, "", 1);
        // let message: Message = _createMessage(ProjectCommandName.get_open_files, '', 1);
        sendMessage(message);

        setUpSaveOnReloadEvent();

        // const saveFileTimer = setInterval(() => {saveFile()}, SAVE_FILE_DURATION);
        // return () => clearInterval(saveFileTimer);
    }, []); //run this only once - not on rerender

    return null;
};;

export default FileManager;
