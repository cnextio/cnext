import { createSlice } from "@reduxjs/toolkit";
import {
    IDirectoryMetadata,
    IDirListResult,
    IFileMetadata,
    IProjectMetadata,
} from "../../lib/interfaces/IFileManager";
import { IConfigs, IShorcutKey, ViewMode } from "../../lib/interfaces/IApp";

const originalShortcutKeys: IShorcutKey = {
    run_queue: "Mod-l",
    set_group: "Mod-k",
    set_ungroup: "Mod-j",
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
    showProjectExplore: false,
    serverSynced: false,
    // configs: {
    //     experiment_manager: {
    //         local_tmp_dir: "/Users/bachbui/works/cycai/cnext-working-dir/Skywalker/.tmp",
    //         mlflow_tracking_uri: "/Users/bachbui/works/cycai/cnext-working-dir/Skywalker/.mlflow",
    //     },
    //     view_mode: ViewMode.VERTICAL,
    // },
    configs: {
        view_mode: ViewMode.VERTICAL,
        shortcut_keys: originalShortcutKeys,
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

        setFileToSave: (state, action) => {
            if (action.payload) {
                state.fileToSave.push(action.payload);
                state.fileToSave = [...new Set(state.fileToSave)];
                // console.log("ProjectManagerRedux: ", state.fileToSave);
            } else {
                state.fileToSave = [];
            }
        },

        setFileToSaveState: (state, action) => {
            if (action.payload) {
                state.fileToSaveState.push(action.payload);
                state.fileToSaveState = [...new Set(state.fileToSaveState)];
                // console.log("ProjectManagerRedux: ", state.fileToSaveState);
            } else {
                state.fileToSaveState = [];
            }
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
    setFileToSave,
    setFileToSaveState,
    setShowProjectExplorer,
    setFileMetaData,
    setServerSynced,
    setScrollPos,
    setProjectConfig,
} = ProjectManagerRedux.actions;

export default ProjectManagerRedux.reducer;
