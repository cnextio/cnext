import shortid from "shortid";
import { createSlice } from '@reduxjs/toolkit'
import { IDirectoryMetadata, IDirListResult, IFileMetadata, IProjectMetadata } from "../../lib/interfaces/IFileManager";


type ProjectManagerState = { 
    openFiles: {[id: string]: IFileMetadata},
    activeProject: IProjectMetadata | null,
    executorID: string | null,
    inViewID: string | null, 
    openDirs: {[id: string]: IDirectoryMetadata[]},
    fileToClose: string | null,
    fileToOpen: string | null,
    fileToSave: string[],
    showProjectExplore: boolean,
    serverSynced: boolean,
}

const initialState: ProjectManagerState = {
    openFiles: {},
    activeProject: null,
    executorID: null,
    inViewID: null,
    openDirs: {},
    fileToClose: null,
    fileToOpen: null,
    fileToSave: [],
    showProjectExplore: false, 
    serverSynced: false,
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
            let files: IFileMetadata[] = action.payload;
            files.map((file: IFileMetadata) => {                
                let id = file.path;
                state.openFiles[id] = file;
                if (file.executor == true){
                    state.executorID = id;
                }
            });
        },
        
        setFileMetaData: (state, action) => {
            let file: IFileMetadata = action.payload;
            let id = file.path;
            state.openFiles[id] = file;
            if (file.executor == true){
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
            if (Object.keys(state.openFiles).includes(path)){
                console.log('ProjectManagerRedux setFileToOpen file already open: ', path);
                state.inViewID = path;
                state.serverSynced = false;
            } else {
                state.fileToOpen = action.payload;
            }            
        },

        setFileToSave: (state, action) => {
            if(action.payload){
                state.fileToSave.push(action.payload);
            } else {
                state.fileToSave = [];
            }            
        },
        
        setShowProjectExplorer: (state, action) => {
            state.showProjectExplore = action.payload;
        },

        setScrollPos: (state, action) => {
            if(state.inViewID)
                state.openFiles[state.inViewID].scroll_pos = action.payload;
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
    setFileToSave,
    setShowProjectExplorer,
    setFileMetaData,
    setServerSynced,
    setScrollPos, } = ProjectManagerRedux.actions

export default ProjectManagerRedux.reducer