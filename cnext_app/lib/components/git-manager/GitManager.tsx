import React, { Fragment, useContext, useEffect, useState } from "react";
import path from "path";
import {
    ProjectToolbar,
    FileExplorerHeaderName,
    FileTree,
    FileItem,
    ClosedProjectItem,
    ErrorText,
    ProjectList,
    OpenProjectTree,
    FileItemLabel,
    ProjectExplorerContainer,
    OpenProjectItem,
    ProjectExplorerToolbar,
} from "../StyledComponents";
import { CommandName, ContentType, WebAppEndpoint } from "../../interfaces/IApp";
import { useDispatch } from "react-redux";
import { setFileDiff, setFileToOpen, setInView } from "../../../redux/reducers/ProjectManagerRedux";
import { setDiffEditor } from "../../../redux/reducers/CodeEditorRedux";
import store from "../../../redux/store";
import { sendMessage, SocketContext } from "../Socket";

const GitManager = (props: any) => {
    const dispatch = useDispatch();
    const socket = useContext(SocketContext);

    const [listChanged, setListChanged] = useState([]);
    const [itemActice, setItemActive] = useState("");

    useEffect(() => {
        setupSocket();
        return () => {
            socket?.off(WebAppEndpoint.FileManager);
        };
    }, []);
    const connectDiff = () => {
        const state = store.getState();
        const projectPath = state.projectManager.activeProject?.path;
        sendMessage(socket, WebAppEndpoint.FileManager, {
            webapp_endpoint: WebAppEndpoint.FileManager,
            content: "",
            command_name: CommandName.get_file_changed,
            metadata: {
                project_path: projectPath,
            },
            type: ContentType.COMMAND
        });
    };
    useEffect(() => {
        connectDiff();
    }, []);
    const setupSocket = () => {
        socket?.emit("ping", WebAppEndpoint.FileManager);
        socket?.on(WebAppEndpoint.FileManager, (result: string) => {
            try {
                if (JSON.parse(result).command_name === CommandName.get_file_changed) {
                    setListChanged(JSON.parse(result).content);
                }
            } catch (error) {
                console.log(`error`, error);
                throw error;
            }
        });
    };
    const openFileDiff = (item) => {
        setItemActive(item);
        let path = `${item}?diff_view=true&&diff_mode=code&&commit1=HEAD&&commit2=`;
        dispatch(setFileToOpen(path));
        dispatch(setDiffEditor(true));
        // dispatch(setFileDiff(item));
        // dispatch(setInView(`);
    };
    return (
        <ProjectExplorerContainer>
            <ProjectToolbar>
                <FileExplorerHeaderName variant="overline">SOURCE CONTROL</FileExplorerHeaderName>
            </ProjectToolbar>
            {listChanged.map((item) => (
                <div
                    key={item}
                    onClick={() => openFileDiff(item)}
                    style={{
                        background: item === itemActice ? "#ddd" : "",
                        cursor: "pointer",
                        fontSize: 10,
                        padding: "2px 4px",
                    }}
                >
                    {item}
                </div>
            ))}
        </ProjectExplorerContainer>
    );
};

export default GitManager;