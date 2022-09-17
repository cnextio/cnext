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
import { setFileDiff } from "../../../redux/reducers/ProjectManagerRedux";

const GitManager = (props: any) => {
    const dispatch = useDispatch();

    const [listChanged, setListChanged] = useState([]);
    const [itemActice, setItemActive] = useState("");

    useEffect(() => {
        setupSocket();
        return () => {
            socket.off(WebAppEndpoint.GitManager);
        };
    }, []);
    const test = () => {
        socket.emit(
            WebAppEndpoint.GitManager,
            JSON.stringify({
                webapp_endpoint: WebAppEndpoint.GitManager,
                content: "",
                command_name: CommandName.connect_repo,
            })
        );
    };
    useEffect(() => {
        test();
    }, []);
    const setupSocket = () => {
        socket.emit("ping", WebAppEndpoint.GitManager);
        socket.on(WebAppEndpoint.GitManager, (result: string) => {
            console.log(`GitManager content`, JSON.parse(result).content);

            try {
                if (JSON.parse(result).command_name === CommandName.connect_repo) {
                    setListChanged(JSON.parse(result).content);
                }
            } catch (error) {
                console.log(`error`, error);
                throw error;
            }
        });
    };
    const sendFile = (item) => {
        setItemActive(item);
        dispatch(setFileDiff(item));
        socket.emit(
            WebAppEndpoint.GitManager,
            JSON.stringify({
                webapp_endpoint: WebAppEndpoint.GitManager,
                content: item,
                command_name: CommandName.check_diff,
            })
        );
    };
    return (
        <ProjectExplorerContainer>
            <ProjectToolbar>
                <FileExplorerHeaderName variant="overline">SOURCE CONTROL</FileExplorerHeaderName>
            </ProjectToolbar>
            {listChanged.map((item) => (
                <div
                    onClick={() => sendFile(item)}
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
