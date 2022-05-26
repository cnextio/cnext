import { createSlice } from "@reduxjs/toolkit";
import {
    IDirectoryMetadata,
    IDirListResult,
    IFileMetadata,
    IProjectMetadata,
} from "../../lib/interfaces/IFileManager";

import {
    IAppShortcutKey,
    IConfigs,
    IEditorShortcutKey,
    ViewMode,
    IEditorConfigs,
    IDataFrameManagerConfigs,
} from "../../lib/interfaces/IApp";

const originalEditorShortcutKeys: IEditorShortcutKey = {
    run_queue: "Mod-l",
    set_group: "Mod-k",
    set_ungroup: "Mod-j",
};

const originalAppShortcutKeys: IAppShortcutKey = {
    autocompletion_tooggle: "shift + a",
    lint_tooggle: "shift + l",
    hover_tooggle: "shift + h",
};

const codeEditorConfigs: IEditorConfigs = {
    lint: true,
    hover: true,
    autocompletion: true,
};

const dataframeManagerConfigs: IDataFrameManagerConfigs = {
    show_exec_text: false,
    auto_display_data: true,
};

type ProjectManagerState = {
    openFiles: { [id: string]: IFileMetadata };
    activeProject: IProjectMetadata | null;
    executorID: string | null;
    inViewID: string | null;
    openDirs: { [id: string]: IDirectoryMetadata[] };
    fileToClose: string | null;
    fileToOpen: string | null;
    fileToSave: string[];
    fileToSaveState: string[];
    savingFile: null | string;
    savingStateFile: null | string;
    showProjectExplore: boolean;
    serverSynced: boolean;
    configs: IConfigs;
};

const initialState: ProjectManagerState = {
    openFiles: {},
    activeProject: null,
    executorID: null,
    inViewID: null,
    openDirs: {},
    fileToClose: null,
    fileToOpen: null,
    fileToSave: [],
    fileToSaveState: [],
    savingFile: null,
    savingStateFile: null,
    showProjectExplore: false,
    serverSynced: false,
    configs: {
        view_mode: ViewMode.VERTICAL,
        code_editor_shortcut: originalEditorShortcutKeys,
        app_shortcut: originalAppShortcutKeys,
        code_editor: codeEditorConfigs,
        dataframe_manager: dataframeManagerConfigs,
    },
};

export const ProjectManagerRedux = createSlice({
    name: "projectManager",
    initialState: initialState,
    reducers: {
        setActiveProject: (state, action) => {
            state.activeProject = action.payload;
        },

        setOpenFiles: (state, action) => {
            state.openFiles = {};
            let files: IFileMetadata[] = action.payload;
            files.map((file: IFileMetadata) => {
                let id = file.path;
                state.openFiles[id] = file;
                if (file.executor == true) {
                    state.executorID = id;
                }
            });
        },

        setFileMetaData: (state, action) => {
            let file: IFileMetadata = action.payload;
            let id = file.path;
            state.openFiles[id] = file;
            if (file.executor == true) {
                state.executorID = id;
            }
        },

        setInView: (state, action) => {
            state.inViewID = action.payload;
            state.serverSynced = false;
        },

        setServerSynced: (state, action) => {
            state.serverSynced = action.payload;
        },

        setOpenDir: (state, action) => {
            let data: IDirListResult = action.payload;
            state.openDirs[data.id] = data.dirs;
        },

        setFileToClose: (state, action) => {
            state.fileToClose = action.payload;
        },

        setFileToOpen: (state, action) => {
            let path = action.payload;
            if (Object.keys(state.openFiles).includes(path)) {
                console.log("ProjectManagerRedux setFileToOpen file already open: ", path);
                state.inViewID = path;
                state.serverSynced = false;
            } else {
                state.fileToOpen = action.payload;
            }
        },

        addFileToSave: (state, action) => {
            if (action.payload) {
                state.fileToSave.push(action.payload);
                state.fileToSave = [...new Set(state.fileToSave)];
                // console.log("ProjectManagerRedux: ", state.fileToSave);
            }
        },

        /** Remove the first item from the list */
        removeFileToSave: (state) => {
            state.fileToSave.shift();
            state.fileToSave = [...new Set(state.fileToSave)];
        },

        /** set savingFile and remove it from fileToSave  if not null*/
        setSavingFile: (state, action) => {
            state.savingFile = action.payload;
            if (state.savingFile != null)
                state.fileToSave = state.fileToSave.filter(function (e) {
                    return e !== state.savingFile;
                });
        },

        addFileToSaveState: (state, action) => {
            if (action.payload) {
                state.fileToSaveState.push(action.payload);
                state.fileToSaveState = [...new Set(state.fileToSaveState)];
            }
        },

        /** Remove the first item from the list */
        removeFileToSaveState: (state) => {
            state.fileToSaveState.shift();
            state.fileToSaveState = [...new Set(state.fileToSaveState)];
        },

        /** set savingStateFile and remove it from fileToSaveState if not null */
        setSavingStateFile: (state, action) => {
            state.savingStateFile = action.payload;
            if (state.savingStateFile != null)
                state.fileToSaveState = state.fileToSaveState.filter(function (e) {
                    return e !== state.savingStateFile;
                });
        },

        setShowProjectExplorer: (state, action) => {
            state.showProjectExplore = action.payload;
        },

        setScrollPos: (state, action) => {
            if (state.inViewID) state.openFiles[state.inViewID].scroll_pos = action.payload;
        },

        setProjectConfig: (state, action) => {
            if (action.payload) {
                state.configs = { ...state.configs, ...action.payload };
            }
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    setOpenFiles,
    setInView,
    setActiveProject,
    setOpenDir,
    setFileToClose,
    setFileToOpen,
    addFileToSave,
    // removeFileToSave,
    setSavingFile,
    addFileToSaveState,
    // removeFileToSaveState,
    setSavingStateFile,
    setShowProjectExplorer,
    setFileMetaData,
    setServerSynced,
    setScrollPos,
    setProjectConfig,
} = ProjectManagerRedux.actions;

export default ProjectManagerRedux.reducer;
