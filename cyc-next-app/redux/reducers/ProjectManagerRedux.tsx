import shortid from "shortid";
import { createSlice, current } from '@reduxjs/toolkit'
import { IDirectoryMetadata, IDirListResult, IFileMetadata, IProjectMetadata } from "../../lib/interfaces/IFileManager";

type ProjectManagerState = { 
    openFiles: {[id: string]: IFileMetadata},
    activeProject: IProjectMetadata | null,
    executorID: string | null,
    inViewID: string | null, 
    openDirs: {[id: string]: IDirectoryMetadata[]}
}

const initialState: ProjectManagerState = {
    openFiles: {},
    activeProject: null,
    executorID: null,
    inViewID: null, 
    openDirs: {}
}

export const ProjectManagerRedux = createSlice({
    name: 'projectManager',
    initialState: initialState,
    reducers: {
        setActiveProject: (state, action) => {  
            state.activeProject = action.payload;
        },
        setOpenFiles: (state, action) => {  
            action.payload.map((file: IFileMetadata) => {
                let id = shortid();
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
        }
    },        
})

// Action creators are generated for each case reducer function
export const { setOpenFiles, setInView, setActiveProject, setOpenDir } = ProjectManagerRedux.actions

export default ProjectManagerRedux.reducer