import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useBeforeunload } from "react-beforeunload";
import {
    initCodeText,
    resetCodeEditor as resetCodeEditorRedux,
} from "../../../redux/reducers/CodeEditorRedux";
import {
    setFileMetadata,
    setFileToClose,
    setFileToOpen,
    addFileToSave,
    addFileToSaveState,
    setOpenFiles,
    setProjectSetting,
    setServerSynced,
    setSavingStateFile,
    setSavingFile,
    setWorkspaceMetadata,
    resetProjectRedux,
} from "../../../redux/reducers/ProjectManagerRedux";
import store, { RootState } from "../../../redux/store";
import {
    ContentType,
    IConfigs,
    IMessage,
    SETTING_FILE_PATH,
    SubContentType,
    WebAppEndpoint,
} from "../../interfaces/IApp";
import { ICodeText, ICodeLine } from "../../interfaces/ICodeEditor";
import {
    ProjectCommand,
    IFileMetadata,
    IWorkspaceMetadata,
    IProjectMetadata,
} from "../../interfaces/IFileManager";
import socket from "../Socket";
import { restartKernel } from "../kernel-manager/KernelManager";

const FileManager = () => {
    const dispatch = useDispatch();
    const inViewID = useSelector((state: RootState) => state.projectManager.inViewID);
    const fileToClose = useSelector((state: RootState) => state.projectManager.fileToClose);
    const fileToOpen = useSelector((state: RootState) => state.projectManager.fileToOpen);
    const fileToSave = useSelector((state: RootState) => state.projectManager.fileToSave);
    const fileToSaveState = useSelector((state: RootState) => state.projectManager.fileToSaveState);
    const workspaceMetadata: IWorkspaceMetadata = useSelector(
        (state: RootState) => state.projectManager.workspaceMetadata
    );
    const projectToAdd = useSelector((state: RootState) => state.projectManager.projectToAdd);
    const projectToSetActive = useSelector(
        (state: RootState) => state.projectManager.projectToSetActive
    );
    // const codeText = useSelector((state: RootState) => getCodeText(state));
    // const codeLines = useSelector((state: RootState) => getCodeLines(state));
    const saveCodeTextCounter = useSelector(
        (state: RootState) => state.codeEditor.saveCodeTextCounter
    );
    const saveCodeLineCounter = useSelector(
        (state: RootState) => state.codeEditor.saveCodeLineCounter
    );
    const projectSettings = useSelector((state: RootState) => state.projectManager.settings);
    // const [codeTextUpdated, setCodeTextUpdated] = useState(false);
    // using this to avoid saving the file when we load code doc for the first time
    // const [codeTextInit, setcodeTextInit] = useState(0);
    const [saveTimer, setSaveTimer] = useState<NodeJS.Timer | null>(null);
    const [saveTimeout, setSaveTimeout] = useState(false);
    // const [savingFile, setSavingFile] = useState<string | null>(null);
    // const [savingStateFile, setSavingStateFile] = useState<string | null>(null);

    const resetProjectStates = (workspaceMetadata: IWorkspaceMetadata) => {
        if (
            workspaceMetadata.active_project !== store.getState().projectManager.activeProject?.id
        ) {
            dispatch(resetCodeEditorRedux());
            dispatch(resetProjectRedux());
        }
    };

    const setupSocket = () => {
        socket.emit("ping", WebAppEndpoint.FileManager);
        socket.on(WebAppEndpoint.FileManager, (result: string) => {
            console.log("FileManager got results...", result);
            try {
                let fmResult: IMessage = JSON.parse(result);
                let state = store.getState();
                /** can't use inViewID from useSelector because this function is defined only once */
                let inViewID = state.projectManager.inViewID;
                let projectMetadata;
                if (!fmResult.error) {
                    switch (fmResult.command_name) {
                        case ProjectCommand.get_open_files:
                            console.log("FileManager got open_files result: ", fmResult.content);
                            projectMetadata = fmResult.content as IProjectMetadata;
                            if (projectMetadata != null) {
                                dispatch(setOpenFiles(projectMetadata));
                            }
                            break;
                        case ProjectCommand.read_file:
                            if (inViewID != null) {
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
                                    dispatch(setFileMetadata(fileMetadata));
                                }
                                /** make sure that this is only set to true after redux state has been updated.
                                 * Otherwise the save action will be triggered */
                                dispatch(setServerSynced(true));
                            }
                            break;
                        case ProjectCommand.close_file:
                            console.log("FileManager got close_file result: ", fmResult);
                            dispatch(setFileToClose(null));
                            projectMetadata = fmResult.content as IProjectMetadata;
                            if (projectMetadata != null) {
                                dispatch(setOpenFiles(projectMetadata));
                            }
                            break;
                        case ProjectCommand.open_file:
                            console.log("FileManager got open_file result: ", fmResult);
                            dispatch(setFileToOpen(null));
                            projectMetadata = fmResult.content as IProjectMetadata;
                            if (projectMetadata != null) {
                                dispatch(setOpenFiles(projectMetadata));
                            }
                            break;
                        case ProjectCommand.get_workspace_metadata:
                            console.log("FileManager got working config: ", fmResult);
                            const workspaceMetadata = fmResult.content as IWorkspaceMetadata;
                            /** reset the state if the active project is different */
                            resetProjectStates(workspaceMetadata);
                            dispatch(setWorkspaceMetadata(workspaceMetadata));
                            break;
                        case ProjectCommand.get_project_settings:
                            console.log("FileManager got project configs result: ", fmResult);
                            if (fmResult.content != null) {
                                dispatch(setProjectSetting(fmResult.content));
                            }
                            break;
                        case ProjectCommand.save_file:
                            //remove the first item from the list
                            dispatch(setSavingFile(null));
                            // setSavingFile(null);

                            /** update file timestamp */
                            let filePath = fmResult.metadata['path'];
                            let fileMetadata = {
                                ...store.getState().projectManager.openFiles[filePath],
                            };
                            if (fmResult.content)
                                fileMetadata.timestamp = fmResult.content["timestamp"];
                            dispatch(setFileMetadata(fileMetadata));
                            
                            break;
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
                                dispatch(setFileMetadata(fileMetadata));
                            }
                            break;
                        case ProjectCommand.set_active_project:
                            console.log(
                                "FileManager got set active project result: ",
                                fmResult.content
                            );
                            if (fmResult.type === ContentType.WORKSPACE_METADATA) {
                                const workspaceMetadata = fmResult.content as IWorkspaceMetadata;
                                /** reset the state if the active project is different */
                                resetProjectStates(workspaceMetadata);
                                dispatch(setWorkspaceMetadata(workspaceMetadata));
                                // Restart the kernel
                                // restartKernel();
                            }
                            break;
                        case ProjectCommand.add_project:
                            console.log(
                                "FileManager got set active project result: ",
                                fmResult.content
                            );
                            if (fmResult.type === ContentType.WORKSPACE_METADATA) {
                                const workspaceMetadata = fmResult.content as IWorkspaceMetadata;
                                /** reset the state if the active project is different */
                                resetProjectStates(workspaceMetadata);
                                dispatch(setWorkspaceMetadata(workspaceMetadata));
                            }
                            break;
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
                console.error(error);
            }
        });
    };

    const sendMessage = (message: IMessage) => {
        console.log(`${message.webapp_endpoint} send message: `, JSON.stringify(message));
        socket.emit(message.webapp_endpoint, JSON.stringify(message));
    };

    const createMessage = (
        command_name: ProjectCommand,
        content: string | ICodeLine[] | IConfigs | null = null,
        metadata: {} = {}
    ): IMessage => {
        let message: IMessage = {
            webapp_endpoint: WebAppEndpoint.FileManager,
            command_name: command_name,
            type: ContentType.COMMAND,
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

        if (inViewID != null) {
            const state = store.getState();
            const codeText = state.codeEditor.codeText;
            /** we will not load the file if it already exists in codeText in redux this design 
             * will not allow client to stay update with server if there is out-of-channel changes 
             * in server but this is good enough for our use case. Note that: since config.py won't 
             * be reload, the content of this file will be outdated when the config is changed using
             * other UI components
             */            
            if (
                codeText == null ||
                (codeText != null && !Object.keys(codeText).includes(inViewID)) ||
                isSettingsFile(inViewID)
            ) {
                const file: IFileMetadata = state.projectManager.openFiles[inViewID];
                const projectPath = state.projectManager.activeProject?.path;
                const message: IMessage = createMessage(ProjectCommand.read_file, "", {
                    project_path: projectPath,
                    path: file.path,
                    timestamp: file.timestamp,
                });
                sendMessage(message);
                dispatch(setServerSynced(false));
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

            let message: IMessage = createMessage(ProjectCommand.close_file, "", {
                path: fileToClose,
                open_order: store.getState().projectManager.openOrder
            });
            sendMessage(message);
        }
    }, [fileToClose]);

    useEffect(() => {
        if (fileToOpen) {
            console.log("FileManager file to open: ", fileToOpen);
            // TODO: make sure the file is saved before being closed
            let message: IMessage = createMessage(ProjectCommand.open_file, "", {
                path: fileToOpen,
                open_order: store.getState().projectManager.openOrder,
            });
            sendMessage(message);
        }
    }, [fileToOpen]);

    useEffect(() => {
        if (workspaceMetadata.active_project != null) {
            // Send get open files message
            let message: IMessage = createMessage(ProjectCommand.get_open_files);
            sendMessage(message);

            // Send get project configs message
            let messageProjectSettings: IMessage = createMessage(
                ProjectCommand.get_project_settings
            );
            sendMessage(messageProjectSettings);            
        }
    }, [workspaceMetadata]);

    useEffect(() => {
        let currentProjectID = store.getState().projectManager.activeProject?.id;
        if (projectToSetActive != null && projectToSetActive != currentProjectID) {
            const message: IMessage = createMessage(
                ProjectCommand.set_active_project,
                projectToSetActive
            );
            sendMessage(message);
        }
    }, [projectToSetActive]);

    useEffect(() => {
        if (projectToAdd != null) {
            let message = createMessage(ProjectCommand.add_project, projectToAdd);
            sendMessage(message);
        }
    }, [projectToAdd]);

    const isSettingsFile = (filePath: string) => {
        return filePath === SETTING_FILE_PATH;
    };

    const reloadSettingIfChanged = (fileToSave: string[]) => {
        let state = store.getState();
        try {
            for (let filePath of fileToSave) {
                if (isSettingsFile(filePath)) {
                    let codeText = state.codeEditor.codeText[filePath];
                    let settings = JSON.parse(codeText.join("\n"));
                    console.log("FileManager reload settings: ", settings);
                    dispatch(setProjectSetting(settings));
                }
            }
        } catch (error) {
            //don't want to log this because there might be a lot of this when user typing in the string
            console.error(error);
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
            }
        }
    };
    useEffect(() => {
        // console.log("FileManager useEffect: ", fileToSave);
        reloadSettingIfChanged(fileToSave);
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
                        {
                            // if (
                            //     codeLine.result?.content &&
                            //     Object.keys(codeLine.result?.content).includes(
                            //         SubContentType.TEXT_HTML
                            //     )
                            // ) {
                            //     let updatedResult = { ...codeLine.result };
                            //     updatedResult.content = {
                            //         "text/html":
                            //             "<div>This result is too big to save. Please rerun the command!</div>",
                            //     };
                            //     return {
                            //         ...codeLine,
                            //         result: updatedResult,
                            //     };
                            // } else return codeLine;
                            return codeLine;
                        }
                    );
                    const timestamp = state.codeEditor.timestamp[filePath];
                    const projectPath = state.projectManager.activeProject?.path;
                    const message: IMessage = createMessage(
                        ProjectCommand.save_state,
                        codeLinesSaveState,
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

    const saveSettings = () => {
        const state = store.getState();
        const settings = state.projectManager.settings;
        let message: IMessage = createMessage(ProjectCommand.save_project_settings, settings, {});
        console.log("FileManager send:", message.command_name, message.metadata);
        sendMessage(message);
    };

    /**
     * Save config when the project manager configs on redux is updated
     */
    useEffect(() => {
        const state = store.getState();
        if (state.projectManager.serverSynced) {
            saveSettings();
        }
    }, [projectSettings]);

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
        let message: IMessage = createMessage(ProjectCommand.get_workspace_metadata, "");
        sendMessage(message);
        // let message: IMessage = createMessage(ProjectCommand.get_active_project, "");
        // sendMessage(message);

        return () => {
            socket.off(WebAppEndpoint.FileManager);
        };
    }, []); //run this only once - not on rerender

    return null;
};

export default FileManager;
