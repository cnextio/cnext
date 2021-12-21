import shortid from "shortid";
import { createSlice, current } from '@reduxjs/toolkit'
import { IDirectoryMetadata, IDirListResult, IFileMetadata, IProjectMetadata } from "../../lib/interfaces/IFileManager";

type ProjectManagerState = { 
    openFiles: {[id: string]: IFileMetadata},
    activeProject: IProjectMetadata | null,
    executorID: string | null,
    inViewID: string | null, 
    openDirs: {[id: string]: IDirectoryMetadata[]},
    fileToClose: string | null,
    fileToOpen: string | null,
    showProjectExplore: boolean
}

const initialState: ProjectManagerState = {
    openFiles: {},
    activeProject: null,
    executorID: null,
    inViewID: null,
    openDirs: {},
    fileToClose: null,
    fileToOpen: null,
    showProjectExplore: false, 
}

export const ProjectManagerRedux = createSlice({
    name: 'projectManager',
    initialState: initialState,
    reducers: {
        setActiveProject: (state, action) => {  
            state.activeProject = action.payload;
        },
        setOpenFiles: (state, action) => {  
            state.openFiles = {};
            action.payload.map((file: IFileMetadata) => {                
                let id = file.path;
                state.openFiles[id] = file;
                if (file.executor == true){
                    state.executorID = id;
                    state.inViewID = id;
                }
            })
        },
        setInView: (state, action) => {
            state.inViewID = action.payload;
        },
        setOpenDir: (state, action) => {
            let data: IDirListResult = action.payload;
            state.openDirs[data.id] = data.dirs;
        },
        setFileToClose: (state, action) => {
            state.fileToClose = action.payload;
        },
        setFileToOpen: (state, action) => {
            state.fileToOpen = action.payload;
        },
        setShowProjectExplorer: (state, action) => {
            state.showProjectExplore = action.payload;
        }
    },        
})

// Action creators are generated for each case reducer function
export const { 
    setOpenFiles, 
    setInView, 
    setActiveProject, 
    setOpenDir, 
    setFileToClose, 
    setFileToOpen,
    setShowProjectExplorer } = ProjectManagerRedux.actions

export default ProjectManagerRedux.reducer