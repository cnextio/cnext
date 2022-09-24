import React, { FC, useEffect, useState } from "react";
import { Box } from "@mui/material";
import MiniSidebar from "./sidebar/Sidebar";
import { MainPanel } from "./StyledComponents";
import WorkingPanel from "./WorkingPanel";
import FooterBar from "./FooterBar";
import { SERVER_SOCKET_ENDPOINT, SocketContext } from "./Socket";
import openConnection, { io, Socket } from "socket.io-client";

const Main: FC = (props: any) => {
    const [connected, setConnected] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    
    useEffect(() => {
        const socket = openConnection(SERVER_SOCKET_ENDPOINT, {
            closeOnBeforeunload: false,
            // transports: ["websocket"],
        });

        socket?.on("connect", function () {
            // the use of function here is to make sure the latest value will be read
            if (() => connected) {
                // send reconnect message to the server so it will send back any message in queue
                socket.emit("reconnect");
            } else {
                // first connection; any further connections means we disconnected
                socket.emit("init");
                setConnected(true);
            }
        });

        setSocket(socket);

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        // macbook pro 13 height
        // move this to style files
        <Box
            display="flex"
            sx={{ flexDirection: "column" }}
            style={{ height: "calc(100vh - 24px)" }}
        >
            {/* <CssBaseline /> */}
            {/* <TopPanel>
                <LogoComponent />
                <AppBarComponent />
            </TopPanel> */}
            <MainPanel>
                <SocketContext.Provider value={socket}>
                    <MiniSidebar {...props} />
                    <WorkingPanel {...props} />
                    <FooterBar {...props} />
                </SocketContext.Provider>
            </MainPanel>
        </Box>
    );
};

export default Main;
