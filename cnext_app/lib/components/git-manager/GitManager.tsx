import React, { Fragment, useEffect, useState } from "react";
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
import { CommandName, WebAppEndpoint } from "../../interfaces/IApp";
import socket from "../Socket";
import { useDispatch } from "react-redux";
import { setFileDiff, setFileToOpen, setInView } from "../../../redux/reducers/ProjectManagerRedux";
import { setDiffEditor } from "../../../redux/reducers/CodeEditorRedux";

const GitManager = (props: any) => {
    const dispatch = useDispatch();

    const [listChanged, setListChanged] = useState([]);
    const [itemActice, setItemActive] = useState("");

    useEffect(() => {
        setupSocket();
        return () => {
            socket.off(WebAppEndpoint.FileManager);
        };
    }, []);
    const connectDiff = () => {
        socket.emit(
            WebAppEndpoint.FileManager,
            JSON.stringify({
                webapp_endpoint: WebAppEndpoint.FileManager,
                content: "",
                command_name: CommandName.get_file_changed,
            })
        );
    };
    useEffect(() => {
        connectDiff();
    }, []);
    const setupSocket = () => {
        socket.emit("ping", WebAppEndpoint.FileManager);
        socket.on(WebAppEndpoint.FileManager, (result: string) => {
            try {
                console.log(`JSON.parse(result).content`, JSON.parse(result).content);

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
        dispatch(setDiffEditor(true))
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
