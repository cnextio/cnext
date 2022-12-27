import React, { Fragment, useEffect, useState } from "react";
import {
    CodeToolbar as StyledCodeToolbar,
    FileNameTab,
    PanelDivider,
    FileCloseIcon as StyledFileCloseIcon,
    FileCloseIconContainer,
    FileNameTabContainer,
} from "../StyledComponents";
import { useDispatch, useSelector } from "react-redux";
import { setFileToClose, setInView } from "../../../redux/reducers/ProjectManagerRedux";
import store, { RootState } from "../../../redux/store";
import { isRunQueueBusy } from "./libCodeEditor";
import ScrollIntoViewIfNeeded from "react-scroll-into-view-if-needed";
import { OverlayComponent } from "../libs/OverlayComponent";
import { isDiffFile, parseUrl } from "../libs";

const FileCloseIcon = (props) => {
    return (
        <FileCloseIconContainer>
            <StyledFileCloseIcon fontSize="small" {...props} />
        </FileCloseIconContainer>
    );
};

const CodeToolbar = () => {
    const openFiles = useSelector((state: RootState) => state.projectManager.openFiles);
    const openFilesUpdateCount = useSelector(
        (state: RootState) => state.projectManager.openFilesUpdateCount
    );

    // const executorID = useSelector((state: RootState) => state.projectManager.executorID);
    const inViewID = useSelector((state: RootState) => state.projectManager.inViewID);
    // const fileSaved = useSelector((state: RootState) => state.codeEditor.fileSaved);
    const fileToSave = useSelector((state: RootState) => state.projectManager.fileToSave);
    const stateFileToSave = useSelector((state: RootState) => state.projectManager.stateFileToSave);
    const savingFile = useSelector((state: RootState) => state.projectManager.savingFile);
    const savingStateFile = useSelector((state: RootState) => state.projectManager.savingStateFile);
    const runQueueBusy = useSelector((state: RootState) =>
        isRunQueueBusy(state.codeEditor.runQueue)
    );
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
        // let inViewID = store.getState().projectManager.inViewID;
        let openOrder = store.getState().projectManager.openOrder;
        // let keys = Object.keys(openFiles);
        dispatch(setInView(openOrder[openOrder.length - 1]));
    }, [openFilesUpdateCount]);
    const getName = (name: string) => {
        let isURL = isDiffFile(name);
        if (!isURL) return name;
        const parse = parseUrl(name);
        return `${parse.path}(WT)`;
    };
    const renderFileNameComponent = (id: string, name: string) => {
        return (
            <Fragment key={id}>
                <FileNameTabContainer>
                    <FileNameTab
                        // toolbarName={name}
                        selected={id === inViewID}
                        component="span"
                        /** not allow switching tab when the runQueue is busy */
                        // onClick={(event: React.MouseEvent) => runQueueSafe(event, () => onClick(id))}
                        onClick={() => onClick(id)}
                        executing={id === inViewID && runQueueBusy ? 1 : 0}
                        saved={
                            !fileToSave.includes(id) &&
                            savingFile !== id &&
                            !stateFileToSave.includes(id) &&
                            savingStateFile !== id
                                ? 1
                                : 0
                        }
                        onMouseEnter={(event: React.MouseEvent) => {
                            // {console.log('CodeToolbar onMouseEnter: ', id, name, displayState)}
                            let newDisplay = { ...displayState };
                            newDisplay[id] = { display: "inline-block" };
                            /** need to do the following to avoid race condition */
                            Object.keys(newDisplay).map((key) => {
                                key !== id ? (newDisplay[key] = { display: "none" }) : null;
                            });
                            setDisplayState(newDisplay);
                        }}
                        onMouseLeave={(event: React.MouseEvent) => {
                            // {console.log('CodeToolbar onMouseEnter: ', id, name, displayState)}
                            let newDisplay = { ...displayState };
                            newDisplay[id] = { display: "none" };
                            setDisplayState(newDisplay);
                        }}
                    >
                        {getName(name)}
                        {
                            <FileCloseIcon
                                style={
                                    !runQueueBusy && id in displayState
                                        ? displayState[id]
                                        : { display: "none" }
                                }
                                onClick={(event: React.MouseEvent) => onClose(event, id)}
                            />
                        }
                    </FileNameTab>
                    {runQueueBusy && id !== inViewID && <OverlayComponent />}
                </FileNameTabContainer>
                <PanelDivider orientation="vertical" color="light" />
                {id == inViewID && (
                    <ScrollIntoViewIfNeeded
                        options={{
                            // active: true,
                            block: "nearest",
                            inline: "nearest",
                            behavior: "auto",
                            // boundary: document.getElementById(codeOutputContentID),
                        }}
                        children={""}
                    />
                )}
            </Fragment>
        );
    };

    return (
        <StyledCodeToolbar>
            {Object.keys(openFiles).map((id: string) => {
                return renderFileNameComponent(id, openFiles[id].name);
            })}
        </StyledCodeToolbar>
    );
};

export default CodeToolbar;
