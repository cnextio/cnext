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

const GitManager = (props: any) => {
    const [listChanged, setListChanged] = useState([]);
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
            try {
                console.log(`result=>>>`, result);

                if (JSON.parse(result).command_name === CommandName.connect_repo) {
                    setListChanged(JSON.parse(result).content);
                }
            } catch (error) {
                console.log(`error`, error);
                throw error;
            }
        });
    };
    return (
        <ProjectExplorerContainer>
            <ProjectToolbar>
                <FileExplorerHeaderName variant="overline">SOURCE CONTROL</FileExplorerHeaderName>
            </ProjectToolbar>
            {listChanged.map((item) => (
                <div style={{ fontSize: 10, padding: "2px 4px" }}>{item}</div>
            ))}
        </ProjectExplorerContainer>
    );
};

export default GitManager;
