import React, { FC, Fragment, useEffect, useState } from 'react';
import {
    CodeToolbar as StyledCodeToolbar,
    FileNameTab,
    PanelDivider,
    ExecutorIcon as StyledExecutorIcon,
    FileCloseIcon as StyledFileCloseIcon,
    FileNameTabContainer,
} from '../StyledComponents';
import { IconButton, stepConnectorClasses } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useDispatch, useSelector } from 'react-redux';
import { setFileToClose, setInView } from '../../../redux/reducers/ProjectManagerRedux';
import store, { RootState } from '../../../redux/store';

const FileMenu = () => {
    return (
        <IconButton size='large' color='default'>
            <MenuIcon style={{ width: '18px', height: '18px' }} />
        </IconButton>
    );
};

const ExecutorIcon = () => {
    return <StyledExecutorIcon color='primary' fontSize='small' />;
};

const FileCloseIcon = (props) => {
    return <StyledFileCloseIcon fontSize='small' {...props} />;
};

const CodeToolbar = () => {
    const openFiles = useSelector((state: RootState) => state.projectManager.openFiles);
    const executorID = useSelector((state: RootState) => state.projectManager.executorID);
    const inViewID = useSelector((state: RootState) => state.projectManager.inViewID);
    // const fileSaved = useSelector((state: RootState) => state.codeEditor.fileSaved);
    const fileToSave = useSelector((state: RootState) => state.projectManager.fileToSave);
    const fileToSaveState = useSelector((state: RootState) => state.projectManager.fileToSaveState);
    const savingFile = useSelector((state: RootState) => state.projectManager.savingFile);
    const savingStateFile = useSelector((state: RootState) => state.projectManager.savingStateFile);
    const [displayState, setDisplayState] = useState<{ [id: string]: {} }>({});
    const dispatch = useDispatch();

    const onClick = (id: string) => {
        dispatch(setInView(id));
    };

    const onClose = (event, id: string) => {
        event.stopPropagation();
        dispatch(setFileToClose(openFiles[id].path));
    };

    /** Set inViewID whenever there is a new openFiles */
    useEffect(() => {
        let inViewID = store.getState().projectManager.inViewID;
        let executorID = store.getState().projectManager.executorID;
        let keys = Object.keys(openFiles);
        if (inViewID === null) {
            if (executorID) {
                dispatch(setInView(executorID));
            } else if (keys.length > 0) {
                dispatch(setInView(openFiles[keys[0]]));
            }
        }
    }, [openFiles]);

    const _getFileNameComponent = (id: string, name: string) => {
        return (
            <Fragment key={id}>
                <FileNameTab
                    // toolbarName={name}
                    selected={id == inViewID}
                    component="span"
                    onClick={() => onClick(id)}
                    fileSaved={
                        !fileToSave.includes(id) &&
                        savingFile !== id &&
                        !fileToSaveState.includes(id) &&
                        savingStateFile !== id
                    }
                    onMouseEnter={(event) => {
                        // {console.log('CodeToolbar onMouseEnter: ', id, name, displayState)}
                        let newDisplay = { ...displayState };
                        newDisplay[id] = { display: "inline-block" };
                        /** need to do the following to avoid race condition */
                        Object.keys(newDisplay).map((key) => {
                            key !== id ? (newDisplay[key] = { display: "none" }) : null;
                        });
                        setDisplayState(newDisplay);
                    }}
                    onMouseLeave={(event) => {
                        // {console.log('CodeToolbar onMouseEnter: ', id, name, displayState)}
                        let newDisplay = { ...displayState };
                        newDisplay[id] = { display: "none" };
                        setDisplayState(newDisplay);
                    }}
                >
                    {name}
                    {/* {id === executorID && <ExecutorIcon />} */}
                    <FileNameTabContainer>
                        <FileCloseIcon
                            style={
                                id in displayState && id !== executorID
                                    ? displayState[id]
                                    : { display: "none" }
                            }
                            onClick={(event) => onClose(event, id)}
                        />
                    </FileNameTabContainer>
                </FileNameTab>
                <PanelDivider orientation="vertical" color="light" />
            </Fragment>
        );
    };

    return (
        <StyledCodeToolbar>
            {/* always display executor first */}
            {executorID && _getFileNameComponent(executorID, openFiles[executorID].name)}
            {Object.keys(openFiles).map((id: string) => {
                // {console.log(key, openFiles[key].name)}
                if (id !== executorID) {
                    return _getFileNameComponent(id, openFiles[id].name);
                }
            })}
        </StyledCodeToolbar>
    );
};

export default CodeToolbar;
