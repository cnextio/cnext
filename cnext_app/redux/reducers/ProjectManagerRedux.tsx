import { createSlice } from "@reduxjs/toolkit";
import {
    IDirectoryMetadata,
    IDirListResult,
    IFileMetadata,
    IProjectInfoInWorkspace,
    IProjectMetadata,
    IWorkspaceMetadata,
} from "../../lib/interfaces/IFileManager";

import {
    IAppShortcutKey,
    IConfigs,
    IEditorShortcutKey,
    ViewMode,
    IEditorSettings,
    IDataFrameManagerSettings,
    IRichOutputSettings,
    ILayoutSettings,
    // IWorkSpaceConfig,
} from "../../lib/interfaces/IApp";

const defaultEditorShortcutKeys: IEditorShortcutKey = {
    run_queue: "Mod-Enter",
    run_queue_then_move_down: "Shift-Enter",
    set_group: "Mod-g",
    set_ungroup: "Mod-u",
    insert_group_below: "Mod-Shift-g",
    insert_line_below: "Mod-Shift-l",
};

const defaultAppShortcutKeys: IAppShortcutKey = {
    autocompletion_on: "shift + a",
    lint_on: "shift + l",
    hover_on: "shift + h",
};

const codeEditorSettings: IEditorSettings = {
    lint: false,
    autocompletion: false,
    hover: false,
};

const dataframeManagerSettings: IDataFrameManagerSettings = {
    show_exec_text: false,
    auto_display_data: true,
};

const defaultRichOutputSettings: IRichOutputSettings = {
    show_markdown: false,
};

const defaultLayoutSettings: ILayoutSettings = {
    project_explorer_size: 200 
}

type ProjectManagerState = {
    openFiles: { [id: string]: IFileMetadata };
    openOrder: string[];
    activeProject: IProjectInfoInWorkspace | null;
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
    settings: IConfigs;
    projects: Object[];
    workspaceMetadata: IWorkspaceMetadata;
    projectToAdd: null | string;
    projectToSetActive: null | string;
};

const initialState: ProjectManagerState = {
    openFiles: {},
    openOrder: [],
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
    settings: {
        view_mode: ViewMode.VERTICAL,
        layout: defaultLayoutSettings,
        code_editor_shortcut: defaultEditorShortcutKeys,
        app_shortcut: defaultAppShortcutKeys,
        code_editor: codeEditorSettings,
        dataframe_manager: dataframeManagerSettings,
        rich_output: defaultRichOutputSettings,
    },
    projects: [],
    workspaceMetadata: {
        active_project: null,
        open_projects: [],
    },
    projectToAdd: null,
    projectToSetActive: null,
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
            let projectMetadata: IProjectMetadata = action.payload;
            let files: IFileMetadata[] = projectMetadata.open_files;
            console.log("ProjectManagerRedux: ", files);
            files?.map((file: IFileMetadata) => {
                let id = file.path;
                state.openFiles[id] = file;
            });
            if (Array.isArray(projectMetadata.open_order)) {
                state.openOrder = projectMetadata.open_order;
            } else {
                state.openOrder = Object.keys(state.openFiles);
            }
        },

        setFileMetadata: (state, action) => {
            let file: IFileMetadata = action.payload;
            let id = file.path;
            state.openFiles[id] = file;
            if (file.executor == true) {
                state.executorID = id;
            }
        },

        setInView: (state, action) => {
            let inViewID = action.payload;
            state.inViewID = inViewID;
            if (
                state.openOrder.includes(inViewID) &&
                state.openOrder[state.openOrder.length - 1] !== inViewID
            ) {
                state.openOrder = state.openOrder.filter((file) => {
                    return file !== inViewID;
                });
                state.openOrder.push(inViewID);
            }
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
            } else {
                console.log("ProjectManagerRedux setFileToOpen: ", path);
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

        setProjectSetting: (state, action) => {
            if (action.payload) {
                state.settings = { ...state.settings, ...action.payload };
            }
        },

        setProjects: (state, action) => {
            state.projects = action.payload;
        },

        setWorkspaceMetadata: (state, action) => {
            const workspaceMetadata = action.payload as IWorkspaceMetadata;
            state.workspaceMetadata = workspaceMetadata;
            let activeProjects = workspaceMetadata["open_projects"].filter(
                (project) => project["id"] === workspaceMetadata["active_project"]
            );
            if (activeProjects.length > 0) {
                state.activeProject = activeProjects[0];
            }
        },

        setProjectToAdd: (state, action) => {
            state.projectToAdd = action.payload;
        },

        setProjectToSetActive: (state, action) => {
            state.projectToSetActive = action.payload;
        },

        resetProjectRedux: (state) => {
            state.openFiles = {};
            state.openOrder = [];
            state.inViewID = null;
            state.openDirs = {};
            state.fileToClose = null;
            state.fileToOpen = null;
            state.fileToSave = [];
            state.fileToSaveState = [];
            state.savingFile = null;
            state.savingStateFile = null;
            state.serverSynced = false;
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
    setFileMetadata,
    setServerSynced,
    setScrollPos,
    setProjectSetting,
    setProjects,
    setWorkspaceMetadata,
    setProjectToAdd,
    setProjectToSetActive,
    resetProjectRedux,
} = ProjectManagerRedux.actions;

export default ProjectManagerRedux.reducer;
