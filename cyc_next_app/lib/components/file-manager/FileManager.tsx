import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useBeforeunload } from "react-beforeunload";
import { initCodeText } from "../../../redux/reducers/CodeEditorRedux";
import {
    setActiveProject,
    setFileMetaData,
    setFileToClose,
    setFileToOpen,
    addFileToSave,
    addFileToSaveState,
    setInView,
    setOpenFiles,
    setProjectConfig,
    setServerSynced,
    // removeFileToSave,
    // removeFileToSaveState,
    setSavingStateFile,
    setSavingFile,
} from "../../../redux/reducers/ProjectManagerRedux";
import store, { RootState } from "../../../redux/store";
import {
    ContentType,
    IConfigs,
    IMessage,
    SubContentType,
    WebAppEndpoint,
} from "../../interfaces/IApp";
import { ICodeText, ICodeLine } from "../../interfaces/ICodeEditor";
import { ProjectCommand, IFileMetadata } from "../../interfaces/IFileManager";
import socket from "../Socket";

const FileManager = () => {
    const dispatch = useDispatch();
    const inViewID = useSelector((state: RootState) => state.projectManager.inViewID);
    const fileToClose = useSelector((state: RootState) => state.projectManager.fileToClose);
    const fileToOpen = useSelector((state: RootState) => state.projectManager.fileToOpen);
    const fileToSave = useSelector((state: RootState) => state.projectManager.fileToSave);
    const fileToSaveState = useSelector((state: RootState) => state.projectManager.fileToSaveState);
    // const codeText = useSelector((state: RootState) => getCodeText(state));
    // const codeLines = useSelector((state: RootState) => getCodeLines(state));
    const saveCodeTextCounter = useSelector(
        (state: RootState) => state.codeEditor.saveCodeTextCounter
    );
    const saveCodeLineCounter = useSelector(
        (state: RootState) => state.codeEditor.saveCodeLineCounter
    );
    const projectConfigs = useSelector((state: RootState) => state.projectManager.configs);
    // const [codeTextUpdated, setCodeTextUpdated] = useState(false);
    // using this to avoid saving the file when we load code doc for the first time
    // const [codeTextInit, setcodeTextInit] = useState(0);
    const [saveTimer, setSaveTimer] = useState<NodeJS.Timer | null>(null);
    const [saveTimeout, setSaveTimeout] = useState(false);
    // const [savingFile, setSavingFile] = useState<string | null>(null);
    // const [savingStateFile, setSavingStateFile] = useState<string | null>(null);

    const setupSocket = () => {
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
                                    // dispatch(removeFileToSaveState(null));

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

                            // Send get open files message
                            let message: IMessage = createMessage(
                                ProjectCommand.get_open_files,
                                "",
                                1
                            );
                            sendMessage(message);
                            dispatch(setActiveProject(fmResult.content));

                            // Send get project configs message
                            let messageProjectConfig: IMessage = createMessage(
                                ProjectCommand.get_project_config,
                                "",
                                1
                            );
                            sendMessage(messageProjectConfig);
                            break;
                        case ProjectCommand.get_project_config:
                            console.log("FileManager got project configs result: ", fmResult);
                            if (fmResult.content != null) {
                                dispatch(setProjectConfig(fmResult.content));
                            }
                            break;
                        case ProjectCommand.save_file:
                            //remove the first item from the list
                            dispatch(setSavingFile(null));
                            // setSavingFile(null);

                            /** update file timestamp */
                            if (inViewID) {
                                let fileMetadata = {
                                    ...store.getState().projectManager.openFiles[inViewID],
                                };
                                if (fmResult.content)
                                    fileMetadata.timestamp = fmResult.content["timestamp"];
                                dispatch(setFileMetaData(fileMetadata));
                            }
                        case ProjectCommand.save_state:
                            //remove the first item from the list
                            dispatch(setSavingStateFile(null));
                            // setSavingStateFile(null);

                            /** update file timestamp */
                            if (inViewID) {
                                let fileMetadata = {
                                    ...store.getState().projectManager.openFiles[inViewID],
                                };
                                fileMetadata.timestamp = fmResult.content["timestamp"];
                                dispatch(setFileMetaData(fileMetadata));
                            }
                    }
                } else {
                    //TODO: send error to ouput
                    console.log("FileManager command error: ", fmResult);
                    let state = store.getState();
                    switch (fmResult.command_name) {
                        case ProjectCommand.save_file:
                            let savingFile = state.projectManager.savingFile;
                            dispatch(setSavingFile(null));
                            dispatch(addFileToSave(savingFile));
                            break;
                        case ProjectCommand.save_state:
                            let savingStateFile = state.projectManager.savingStateFile;
                            dispatch(setSavingStateFile(null));
                            dispatch(addFileToSaveState(savingStateFile));
                            break;
                    }
                }
            } catch (error) {
                throw error;
            }
        });
    };

    const sendMessage = (message: IMessage) => {
        console.log(`${message.webapp_endpoint} send message: `, JSON.stringify(message));
        socket.emit(message.webapp_endpoint, JSON.stringify(message));
    };

    const createMessage = (
        command_name: ProjectCommand,
        content: string | ICodeLine[] | IConfigs | null,
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

    const saveFileAndState = async () => {
        // const state = store.getState();
        // console.log("FileManager inViewID useEffect", state.projectManager.fileToSave);
        await saveFile(false);
        await saveState(false);
    };

    // called when the in-view file changed
    const SAVE_FILE_DURATION = 10000;
    useEffect(() => {
        clearSaveConditions();
        // const state = store.getState();
        // When inViewID changed, trigger the saveFile & saveState function
        saveFileAndState();

        if (inViewID) {
            const state = store.getState();
            const codeText = state.codeEditor.codeText;
            // we will not load the file if it already exists (except for config.json) 
            // in redux this design will not allow client to stay update with server 
            // if there is out-of-channel changes in server but this is good enough 
            // for our use case.
            if (
                codeText == null ||
                (codeText && !Object.keys(codeText).includes(inViewID)) ||
                isConfigFile(inViewID)
            ) {
                const file: IFileMetadata = state.projectManager.openFiles[inViewID];
                const projectPath = state.projectManager.activeProject?.path;
                const message: IMessage = createMessage(ProjectCommand.read_file, "", 1, {
                    project_path: projectPath,
                    path: file.path,
                    timestamp: file.timestamp,
                });
                sendMessage(message);
            } else {
                dispatch(setServerSynced(true));
            }
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
            saveFileAndState();

            let message: IMessage = createMessage(ProjectCommand.close_file, "", 1, {
                path: fileToClose,
            });
            sendMessage(message);
        }
    }, [fileToClose]);

    useEffect(() => {
        if (fileToOpen) {
            console.log("FileManager file to open: ", fileToOpen);
            // TODO: make sure the file is saved before being closed
            let message: IMessage = createMessage(ProjectCommand.open_file, "", 1, {
                path: fileToOpen,
            });
            sendMessage(message);
        }
    }, [fileToOpen]);

    const isConfigFile = (filePath: string) => {
        return filePath === "config.json";
    }

    const reloadConfigIfChanged = (fileToSave: string[]) => {
        let state = store.getState();
        try {
            for (let filePath of fileToSave) {
                if (isConfigFile(filePath)) {
                    let codeText = state.codeEditor.codeText[filePath];
                    let config = JSON.parse(codeText.join("\n"));
                    console.log("FileManager reload config: ", config);
                    dispatch(setProjectConfig(config));
                }
            }
        } catch (error) {
            //don't want to log this because there might be a lot of this when user typing in the string
            //console.error(error);
        }        
    };
    /**
     * This function will be called in two cases
     *  1. when `fileToSave` and `saveTimeout` changes. However, files will only be saved
     *      if saveTimeout is true and there is file to be saved and savingFile==null.
     *      Since file only be saved when saveTimeout is true, the saving message will only be
     *      sent out at most once every SAVE_FILE_DURATION
     *  2. when the file is being closed or the file tab changes
     */
    const saveFile = async (useTimeOut: boolean = true) => {
        const state = store.getState();
        const fileToSave = state.projectManager.fileToSave;
        const savingFile = state.projectManager.savingFile;

        if ((saveTimeout || !useTimeOut) && fileToSave.length > 0 && savingFile == null) {
            // get the first file from the queue
            let filePath = fileToSave[0];
            if (filePath != null) {
                let file: IFileMetadata = state.projectManager.openFiles[filePath];
                console.log(
                    "FileManager: save file ",
                    filePath
                    // state.projectManager.openFiles,
                    // file
                );
                let codeText = state.codeEditor.codeText[filePath];
                let timestamp = state.codeEditor.timestamp[filePath];
                const projectPath = state.projectManager.activeProject?.path;
                let message: IMessage = createMessage(
                    ProjectCommand.save_file,
                    codeText.join("\n"),
                    1,
                    {
                        project_path: projectPath,
                        path: file.path,
                        timestamp: timestamp,
                    }
                );
                console.log("FileManager send:", message.command_name, message.metadata);
                dispatch(setSavingFile(filePath));
                sendMessage(message);
                setSaveTimeout(false);

                // return new Promise((resolve) => {
                //     socket.on(WebAppEndpoint.FileManager, (result: string) => {
                //         console.log("FileManager saveFile got results...", result);
                //         try {
                //             const output = JSON.parse(result);
                //             if (
                //                 output.command_name === ProjectCommand.save_file &&
                //                 output.type === ContentType.FILE_METADATA &&
                //                 output.error == false
                //             ) {
                //                 dispatch(setFileToSave(null));
                //                 let inViewID = store.getState().projectManager.inViewID;

                //                 /** update file timestamp */
                //                 if (inViewID) {
                //                     let fileMetadata = {
                //                         ...store.getState().projectManager.openFiles[inViewID],
                //                     };
                //                     fileMetadata.timestamp = output.content["timestamp"];
                //                     dispatch(setFileMetaData(fileMetadata));
                //                 }

                //                 resolve(output);
                //             }
                //             resolve(null);
                //         } catch {
                //             resolve(null);
                //         }
                //     });
                // });
            }
        }
    };
    useEffect(() => {
        // console.log("FileManager useEffect: ", fileToSave);
        reloadConfigIfChanged(fileToSave);
        saveFile();
    }, [saveTimeout, fileToSave]);

    /**
     * This function will be called in two cases
     *  1. when `fileToSaveState` and `saveTimeout` changes. However, files will only be saved
     *      if saveTimeout is true and there is file to be saved and savingStateFile==null.
     *      Since file only be saved when saveTimeout is true, the saving message will only be
     *      sent out at most once every SAVE_FILE_DURATION
     *  2. when the file is being closed or the file tab changes
     */
    const saveState = async (useTimeOut: boolean = true) => {
        const state = store.getState();
        const fileToSaveState = state.projectManager.fileToSaveState;
        const savingStateFile = state.projectManager.savingStateFile;

        if ((saveTimeout || !useTimeOut) && fileToSaveState.length > 0 && savingStateFile == null) {
            //get the first item in the queue
            let filePath = fileToSaveState[0];
            if (filePath != null) {
                if (state.codeEditor.codeLines != null) {
                    const codeLines = state.codeEditor.codeLines[filePath];
                    // Avoid to save the text/html result because maybe it's audio/video files.
                    // Save these files make bad performance.
                    const codeLinesSaveState = codeLines.map((codeLine) =>
                        // codeLine.result?.subType === SubContentType.TEXT_HTML
                        //     ? { ...codeLine, result: null }
                        //     : codeLine
                        {
                            if (
                                codeLine.result?.content &&
                                Object.keys(codeLine.result?.content).includes(
                                    SubContentType.TEXT_HTML
                                )
                            ) {
                                let updatedResult = {...codeLine.result};
                                updatedResult.content = {
                                    "text/html":
                                        "<div>This result is too big to save. Please rerun the command!</div>",
                                };
                                return {
                                    ...codeLine,
                                    result: updatedResult,
                                };
                            } else return codeLine;
                        }
                    );
                    const timestamp = state.codeEditor.timestamp[filePath];
                    const projectPath = state.projectManager.activeProject?.path;
                    const message: IMessage = createMessage(
                        ProjectCommand.save_state,
                        codeLinesSaveState,
                        1,
                        {
                            project_path: projectPath,
                            path: filePath,
                            timestamp: timestamp,
                        }
                    );
                    dispatch(setSavingStateFile(filePath));
                    sendMessage(message);
                    setSaveTimeout(false);
                }
            }
        }
    };
    useEffect(() => {
        // console.log("FileManager useEffect: ", fileToSaveState);
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
        const inViewID = state.projectManager.inViewID;
        if (state.projectManager.serverSynced && inViewID != null) {
            console.log("FileManager codeText useEffect", inViewID);
            dispatch(addFileToSave(inViewID));
        }
    }, [saveCodeTextCounter]);

    useEffect(() => {
        const state = store.getState();
        const inViewID = state.projectManager.inViewID;
        if (state.projectManager.serverSynced && inViewID != null) {
            dispatch(addFileToSaveState(inViewID));
        }
    }, [saveCodeLineCounter]);

    const saveConfigs = () => {
        const state = store.getState();
        const configs = state.projectManager.configs;
        let message: IMessage = createMessage(ProjectCommand.save_project_config, configs, 1, {});
        console.log("FileManager send:", message.command_name, message.metadata);
        sendMessage(message);
    };

    /**
     * Save config when the project manager configs on redux is updated
     */
    useEffect(() => {
        const state = store.getState();
        if (state.projectManager.serverSynced) {
            saveConfigs();
        }
    }, [projectConfigs]);

    useBeforeunload((event) => {
        let state = store.getState();
        let fileToSave = state.projectManager.fileToSave;
        let fileToSaveState = state.projectManager.fileToSaveState;
        let savingFile = state.projectManager.savingFile;
        let savingStateFile = state.projectManager.savingStateFile;

        if (
            fileToSave.length > 0 ||
            fileToSaveState.length > 0 ||
            savingFile != null ||
            savingStateFile != null
        ) {
            //force save to speed it up
            saveFile(false);
            saveState(false);
            event.preventDefault();
        }
    });

    useEffect(() => {
        setupSocket();
        let message: IMessage = createMessage(ProjectCommand.get_active_project, "", 1);
        sendMessage(message);

        return () => {
            socket.off(WebAppEndpoint.FileManager);
        };

        // const saveFileTimer = setInterval(() => {saveFile()}, SAVE_FILE_DURATION);
        // return () => clearInterval(saveFileTimer);
    }, []); //run this only once - not on rerender

    return null;
};

export default FileManager;
