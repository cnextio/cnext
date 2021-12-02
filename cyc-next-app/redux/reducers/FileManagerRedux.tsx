import shortid from "shortid";
import { createSlice, current } from '@reduxjs/toolkit'
import { FileMetadata } from "../../lib/interfaces/IFileManager";

export const FileManagerRedux = createSlice({
    name: 'fileManager',
    initialState: {
        openFiles: {},
        executorID: null,
        inViewID: null,
    },

    reducers: {
        setOpenFiles: (state, action) => {  
            action.payload.map((file: FileMetadata) => {
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
        }
    },        
})

// Action creators are generated for each case reducer function
export const { setOpenFiles, setInView } = FileManagerRedux.actions

export default FileManagerRedux.reducer